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

    const userId = payload.sub;

    // Créer le client Supabase avec la service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer l'ID du record nutritionnel depuis l'URL
    const url = new URL(req.url);
    const nutritionRecordId = url.pathname.split('/').pop();

    if (!nutritionRecordId) {
      return new Response(
        JSON.stringify({ error: 'ID du record nutritionnel requis' }),
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

    // Récupérer le record nutritionnel avec vérification des permissions
    const { data: nutritionRecord, error: recordError } = await supabase
      .from('nutrition_records')
      .select(`
        *,
        child:children (
          id,
          full_name,
          birth_date,
          orphanage_id
        )
      `)
      .eq('id', nutritionRecordId)
      .in('children.orphanage_id', orphanageIds)
      .single()

    if (recordError) {
      console.error('Erreur récupération record nutritionnel:', recordError)
      
      let statusCode = 500;
      let errorMessage = 'Erreur lors de la récupération du record nutritionnel';
      let errorDetails = recordError.message;
      
      if (recordError.code === 'PGRST116') {
        statusCode = 404;
        errorMessage = 'Record nutritionnel non trouvé';
        errorDetails = 'Le record nutritionnel n\'existe pas ou vous n\'y avez pas accès';
      } else if (recordError.code === '42501') {
        statusCode = 403;
        errorMessage = 'Permission refusée';
        errorDetails = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource';
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

    if (!nutritionRecord) {
      return new Response(
        JSON.stringify({ 
          error: 'Record nutritionnel non trouvé',
          details: 'Le record nutritionnel n\'existe pas ou vous n\'y avez pas accès'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ajouter l'interprétation du BMI
    const recordWithInterpretation = {
      ...nutritionRecord,
      bmi_interpretation: getBMIInterpretation(nutritionRecord.bmi)
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: recordWithInterpretation
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

// Fonction pour interpréter le BMI
function getBMIInterpretation(bmi: number | null): string {
  if (bmi === null) return 'Données insuffisantes pour calculer le BMI';
  
  if (bmi < 18.5) return 'Insuffisance pondérale';
  if (bmi < 25) return 'Poids normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obésité';
}