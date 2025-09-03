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

    // Créer le client Supabase avec la service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer les paramètres de query
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Limite plus élevée pour les maladies
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('is_active') !== 'false'; // true par défaut

    // Valider les paramètres de pagination
    if (page < 1) {
      return new Response(
        JSON.stringify({ error: 'Le numéro de page doit être supérieur à 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (limit < 1 || limit > 500) {
      return new Response(
        JSON.stringify({ error: 'La limite doit être entre 1 et 500' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculer l'offset pour la pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construire la query avec filtres
    let query = supabase
      .from('diseases')
      .select('*', { count: 'exact' })
      .eq('is_active', isActive)
      .order('name', { ascending: true }) // Tri alphabétique par nom
      .range(from, to);

    // Appliquer les filtres de recherche
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Exécuter la query
    const { data: diseases, error: diseasesError, count } = await query;

    if (diseasesError) {
      console.error('Erreur récupération maladies:', diseasesError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la récupération des maladies',
          details: diseasesError.message,
          code: diseasesError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculer les métriques de pagination
    const totalCount = count || 0;
    const metrics = {
      total_count: totalCount,
      current_page: page,
      total_pages: Math.ceil(totalCount / limit),
      has_next_page: (from + limit) < totalCount,
      has_prev_page: page > 1,
      page_size: limit
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          diseases: diseases || [],
          metrics,
          filters: {
            search: search || null,
            is_active: isActive
          }
        }
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