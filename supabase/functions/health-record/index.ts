import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return new Response(
        JSON.stringify({ error: 'Token expiré' }),
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
          details: linkError.message
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

    // Récupérer le dossier médical avec les informations de l'enfant et les maladies
    const { data: healthRecord, error: healthRecordError } = await supabase
      .from('health_records')
      .select(`
        *,
        child:children (
          id,
          full_name,
          orphanage_id
        ),
        diseases:child_diseases (
          id,
          disease_id,
          diagnosed_date,
          severity,
          notes,
          disease:diseases (
            id,
            name,
            description
          )
        )
      `)
      .eq('id', healthRecordId)
      .in('children.orphanage_id', orphanageIds)
      .single()

    if (healthRecordError) {
    console.error('Erreur récupération dossier médical:', healthRecordError)
    
    // Vérifier si c'est une erreur "non trouvé" ou une autre erreur
    if (healthRecordError.code === 'PGRST116') { // Code pour "no rows found"
        return new Response(
        JSON.stringify({ 
            error: 'Dossier médical non trouvé',
            details: 'Le dossier médical n\'existe pas ou vous n\'y avez pas accès',
            code: healthRecordError.code
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } else {
        // Pour les autres erreurs, retourner les détails complets
        return new Response(
        JSON.stringify({ 
            error: 'Erreur lors de la récupération du dossier médical',
            details: healthRecordError.message,
            code: healthRecordError.code,
            hint: healthRecordError.hint || null
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    }

    if (!healthRecord) {
    return new Response(
        JSON.stringify({ 
        error: 'Dossier médical non trouvé',
        details: 'Le dossier médical n\'existe pas ou vous n\'y avez pas accès',
        code: 'NOT_FOUND'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    }

    // Formater les données de réponse
    const responseData = {
      ...healthRecord,
      child: healthRecord.child,
      diseases: healthRecord.diseases.map((cd: any) => ({
        id: cd.id,
        disease_id: cd.disease_id,
        diagnosed_date: cd.diagnosed_date,
        severity: cd.severity,
        notes: cd.notes,
        disease_name: cd.disease?.name,
        disease_description: cd.disease?.description,
        disease_category: cd.disease?.category
      }))
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
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