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

// Fonction pour valider un UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
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

    // Récupérer l'ID du record nutritionnel depuis l'URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    const nutritionRecordId = pathParts[pathParts.length - 1];

    if (!nutritionRecordId) {
      return new Response(
        JSON.stringify({ error: 'ID du record nutritionnel requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valider que nutritionRecordId est un UUID valide
    if (!isValidUUID(nutritionRecordId)) {
      return new Response(
        JSON.stringify({ 
          error: 'ID de record nutritionnel invalide',
          details: 'L\'ID doit être un UUID valide'
        }),
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

    // Vérifier que le record nutritionnel existe et appartient à l'utilisateur
    const { data: existingRecord, error: recordError } = await supabase
      .from('nutrition_records')
      .select(`
        *,
        child:children (
          id,
          full_name,
          orphanage_id
        )
      `)
      .eq('id', nutritionRecordId)
      .in('children.orphanage_id', orphanageIds)
      .single()

    if (recordError) {
      console.error('Erreur vérification record nutritionnel:', recordError)
      
      if (recordError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            error: 'Record nutritionnel non trouvé',
            details: 'Le record nutritionnel n\'existe pas ou vous n\'y avez pas accès'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de vérification du record nutritionnel',
          details: recordError.message,
          code: recordError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!existingRecord) {
      return new Response(
        JSON.stringify({ 
          error: 'Record nutritionnel non trouvé',
          details: 'Le record nutritionnel n\'existe pas ou vous n\'y avez pas accès'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supprimer le record nutritionnel
    const { error: deleteError } = await supabase
      .from('nutrition_records')
      .delete()
      .eq('id', nutritionRecordId)

    if (deleteError) {
      console.error('Erreur suppression record nutritionnel:', deleteError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la suppression du record nutritionnel',
          details: deleteError.message,
          code: deleteError.code,
          hint: deleteError.hint || null
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les informations de l'enfant pour la réponse
    const childInfo = {
      id: existingRecord.child?.id,
      full_name: existingRecord.child?.full_name
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Record nutritionnel supprimé avec succès',
        data: {
          deleted_record: {
            id: nutritionRecordId,
            date: existingRecord.date,
            weight_kg: existingRecord.weight_kg,
            height_cm: existingRecord.height_cm,
            bmi: existingRecord.bmi,
            nutrition_status: existingRecord.nutrition_status
          },
          child: childInfo,
          deleted_at: new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error?.message || 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})