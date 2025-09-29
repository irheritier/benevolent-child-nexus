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
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    const childId = pathParts[pathParts.length - 1];

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'ID de l\'enfant requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valider que childId est un UUID valide
    if (!isValidUUID(childId)) {
      return new Response(
        JSON.stringify({ 
          error: 'ID d\'enfant invalide',
          details: 'L\'ID doit être un UUID valide'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les paramètres de query
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

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

    if (!userOrphanages || userOrphanages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Aucun orphelinat trouvé pour cet utilisateur'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orphanageIds = userOrphanages.map(link => link.orphanage_id);

    // Vérifier que l'enfant existe et appartient à l'utilisateur
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, full_name, orphanage_id')
      .eq('id', childId)
      .in('orphanage_id', orphanageIds)
      .single()

    if (childError) {
      console.error('Erreur vérification enfant:', childError)
      
      if (childError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            error: 'Enfant non trouvé',
            details: 'L\'enfant n\'existe pas ou vous n\'y avez pas accès'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de vérification de l\'enfant',
          details: childError.message,
          code: childError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!child) {
      return new Response(
        JSON.stringify({ 
          error: 'Enfant non trouvé',
          details: 'L\'enfant n\'existe pas ou vous n\'y avez pas accès'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construire la query pour récupérer les dossiers médicaux
    let query = supabase
      .from('health_records')
      .select(`
        *,
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
      `, { count: 'exact' })
      .eq('child_id', childId)
      .order('date', { ascending: false })
      .range(from, to);

    // Appliquer les filtres de date
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }

    // Exécuter la query
    const { data: healthRecords, error: recordsError, count } = await query;

    if (recordsError) {
      console.error('Erreur récupération dossiers médicaux:', recordsError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la récupération des dossiers médicaux',
          details: recordsError.message,
          code: recordsError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Formater les données de réponse
    const formattedRecords = healthRecords?.map(record => ({
      ...record,
      diseases: record.diseases.map((disease: any) => ({
        id: disease.id,
        disease_id: disease.disease_id,
        diagnosed_date: disease.diagnosed_date,
        severity: disease.severity,
        notes: disease.notes,
        disease_name: disease.disease?.name,
        disease_description: disease.disease?.description
      }))
    })) || [];

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
          health_records: formattedRecords,
          metrics,
          child: {
            id: child.id,
            full_name: child.full_name
          },
          filters: {
            start_date: startDate || null,
            end_date: endDate || null
          }
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