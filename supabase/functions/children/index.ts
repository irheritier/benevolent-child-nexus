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

    // Récupérer les paramètres de query
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const gender = searchParams.get('gender');
    const parentStatus = searchParams.get('parent_status');

    // Valider les paramètres de pagination
    if (page < 1) {
      return new Response(
        JSON.stringify({ error: 'Le numéro de page doit être supérieur à 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ error: 'La limite doit être entre 1 et 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculer l'offset pour la pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

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

    // Vérifier si l'utilisateur a des orphelinats
    if (!userOrphanages || userOrphanages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Aucun orphelinat trouvé pour cet utilisateur',
          details: 'Cet utilisateur n\'est lié à aucun orphelinat'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orphanageIds = userOrphanages.map(link => link.orphanage_id);

    // Construire la query avec filtres
    let query = supabase
      .from('children')
      .select(`
        *,
        orphanage:orphanages (
          name
        )
      `, { count: 'exact' })
      .in('orphanage_id', orphanageIds)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Appliquer les filtres de recherche
    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    if (gender && ['M', 'F'].includes(gender)) {
      query = query.eq('gender', gender);
    }

    if (parentStatus) {
      const validStatuses = ['total_orphan', 'partial_orphan', 'abandoned'];
      if (validStatuses.includes(parentStatus)) {
        query = query.eq('parent_status', parentStatus);
      }
    }

    // Exécuter la query
    const { data: children, error: childrenError, count } = await query;

    if (childrenError) {
      console.error('Erreur récupération enfants:', childrenError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la récupération des enfants',
          details: childrenError.message,
          code: childrenError.code
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

    // Formater la réponse
    const responseData = {
      children: children || [],
      metrics,
      filters: {
        search: search || null,
        gender: gender || null,
        parent_status: parentStatus || null
      }
    };

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