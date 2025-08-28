import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}


interface ChildData {
  full_name: string;
  gender: 'M' | 'F';
  birth_date?: string;
  estimated_age?: number;
  entry_date?: string;
  parent_status: 'total_orphan' | 'partial_orphan' | 'abandoned';
  internal_code?: string;
  photo_url?: string;
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

    // Prendre le premier orphelinat
    const orphanageId = userOrphanages[0].orphanage_id;

    // Vérifier que l'orphelinat existe
    const { data: orphanage, error: orphanageError } = await supabase
      .from('orphanages')
      .select('id, child_capacity, children_total')
      .eq('id', orphanageId)
      .single()

    if (orphanageError || !orphanage) {
      return new Response(
        JSON.stringify({ 
          error: 'Orphelinat non trouvé',
          details: 'L\'orphelinat lié à cet utilisateur n\'existe pas'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les données de la requête
    const childData: ChildData = await req.json()

    // Validation des champs requis
    if (!childData.full_name || !childData.gender || !childData.parent_status) {
      return new Response(
        JSON.stringify({ 
          error: 'Champs requis manquants',
          details: 'Les champs full_name, gender et parent_status sont obligatoires'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validation du genre
    if (!['M', 'F'].includes(childData.gender)) {
      return new Response(
        JSON.stringify({ 
          error: 'Genre invalide',
          details: 'Le gender doit être "M" ou "F"'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validation du statut parental
    const validParentStatuses = ['total_orphan', 'partial_orphan', 'abandoned'];
    if (!validParentStatuses.includes(childData.parent_status)) {
      return new Response(
        JSON.stringify({ 
          error: 'Statut parental invalide',
          details: `Le parent_status doit être l'un des suivants: ${validParentStatuses.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Préparer les données pour l'insertion
    const submitData = {
      orphanage_id: orphanageId,
      full_name: childData.full_name,
      gender: childData.gender,
      birth_date: childData.birth_date || null,
      estimated_age: childData.estimated_age || null,
      entry_date: childData.entry_date || new Date().toISOString().split('T')[0], // Date du jour par défaut
      parent_status: childData.parent_status,
      internal_code: childData.internal_code || null,
      photo_url: childData.photo_url || null,
    }

    // Insérer l'enfant dans la base de données
    const { data: newChild, error: insertError } = await supabase
      .from('children')
      .insert([submitData])
      .select()
      .single()

    if (insertError) {
      console.error('Erreur insertion enfant:', insertError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de l\'ajout de l\'enfant',
          details: insertError.message,
          code: insertError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Enfant ajouté avec succès',
        data: newChild
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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