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

    // Récupérer l'ID de l'enfant depuis l'URL
    const url = new URL(req.url);
    const childId = url.pathname.split('/').pop();

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'ID de l\'enfant requis' }),
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
        JSON.stringify({ 
          error: 'Aucun orphelinat trouvé pour cet utilisateur'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orphanageIds = userOrphanages.map(link => link.orphanage_id);

    // Récupérer l'enfant avec vérification qu'il appartient à l'orphelinat de l'utilisateur
    const { data: child, error: childError } = await supabase
      .from('children')
      .select(`
        *,
        nutrition_records(*),
        health_records(*),
        child_diseases(diseases(name), diagnosed_date, severity, notes)
      `)
      .eq('id', childId)
      .in('orphanage_id', orphanageIds)
      .single()

    if (childError) {
      if (childError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            error: 'Enfant non trouvé',
            details: 'L\'enfant n\'existe pas ou vous n\'y avez pas accès'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.error('Erreur récupération enfant:', childError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de base de données',
          details: childError.message,
          code: childError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(child),
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