import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
}

// Fonction pour décoder le JWT manuellement
function decodeJwt(token: string): any {
  try {
    const payloadBase64 = token.split('.')[1];
    const paddedPayload = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, '=');
    const payloadJson = atob(paddedPayload);
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error('Erreur décodage JWT:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Décoder le JWT manuellement pour obtenir l'user ID
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const payload = decodeJwt(token);
    
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Token JWT invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = payload.sub;

    // Créer le client Supabase avec la service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer l'ID du dossier médical depuis l'URL
    const url = new URL(req.url);
    const healthRecordId = url.pathname.split('/').pop();

    if (!healthRecordId) {
      return new Response(
        JSON.stringify({ error: 'ID du dossier médical requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer l'orphelinat de l'utilisateur
    const { data: userOrphanages, error: linkError } = await supabase
      .from('user_orphanage_links')
      .select('orphanage_id')
      .eq('user_id', userId)

    if (linkError) {
      console.error('Erreur récupération orphelinat:', linkError)
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de base de données',
          details: linkError.message,
          code: linkError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userOrphanages || userOrphanages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Aucun orphelinat trouvé pour cet utilisateur' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orphanageIds = userOrphanages.map(link => link.orphanage_id);

    // Vérifier que le dossier médical existe et appartient à l'utilisateur
    const { data: existingRecord, error: recordError } = await supabase
      .from('health_records')
      .select(`
        id,
        child:children (
          id,
          orphanage_id,
          full_name
        )
      `)
      .eq('id', healthRecordId)
      .in('children.orphanage_id', orphanageIds)
      .single()

    if (recordError) {
      console.error('Erreur vérification dossier médical:', recordError)
      
      let statusCode = 500;
      let errorMessage = 'Erreur de vérification du dossier médical';
      let errorDetails = recordError.message;
      
      if (recordError.code === 'PGRST116') {
        statusCode = 404;
        errorMessage = 'Dossier médical non trouvé';
        errorDetails = 'Le dossier médical n\'existe pas ou vous n\'y avez pas accès';
      } else if (recordError.code === '42501') {
        statusCode = 403;
        errorMessage = 'Permission refusée';
        errorDetails = 'Vous n\'avez pas les permissions nécessaires pour supprimer cette ressource';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorDetails,
          code: recordError.code,
          hint: recordError.hint || null
        }),
        { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!existingRecord) {
      return new Response(
        JSON.stringify({ 
          error: 'Dossier médical non trouvé',
          details: 'Le dossier médical n\'existe pas ou vous n\'y avez pas accès',
          code: 'NOT_FOUND'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Commencer une transaction pour supprimer d'abord les dépendances
    // 1. Supprimer les maladies associées à ce dossier médical
    const { error: deleteDiseasesError } = await supabase
      .from('child_diseases')
      .delete()
      .eq('health_record_id', healthRecordId)

    if (deleteDiseasesError) {
      console.error('Erreur suppression des maladies:', deleteDiseasesError)
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la suppression des maladies associées',
          details: deleteDiseasesError.message,
          code: deleteDiseasesError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Supprimer le dossier médical principal
    const { error: deleteHealthRecordError } = await supabase
      .from('health_records')
      .delete()
      .eq('id', healthRecordId)

    if (deleteHealthRecordError) {
      console.error('Erreur suppression dossier médical:', deleteHealthRecordError)
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la suppression du dossier médical',
          details: deleteHealthRecordError.message,
          code: deleteHealthRecordError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dossier médical supprimé avec succès',
        data: {
          deleted_record_id: healthRecordId,
          child_name: existingRecord.child?.full_name || 'Inconnu',
          deleted_diseases_count: 'Toutes les maladies associées ont été supprimées'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})