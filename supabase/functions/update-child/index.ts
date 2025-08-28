import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
}

// Interface pour les données de mise à jour
interface ChildUpdateData {
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

    // Récupérer l'ID de l'enfant depuis l'URL
    const url = new URL(req.url);
    const childId = url.pathname.split('/').pop();

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'ID de l\'enfant requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer les données de la requête
    const updateData: ChildUpdateData = await req.json()

    // Validation des données si présentes
    if (updateData.gender && !['M', 'F'].includes(updateData.gender)) {
      return new Response(
        JSON.stringify({ 
          error: 'Genre invalide',
          details: 'Le gender doit être "M" ou "F"'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (updateData.parent_status) {

      const validParentStatuses = ['total_orphan', 'partial_orphan', 'abandoned'];
      if (!validParentStatuses.includes(updateData.parent_status)) {
        return new Response(
          JSON.stringify({ 
            error: 'Statut parental invalide',
            details: `Le parent_status doit être l'un des suivants: ${validParentStatuses.join(', ')}`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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

    // Vérifier que l'enfant existe et appartient à l'utilisateur
    const { data: existingChild, error: checkError } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .in('orphanage_id', orphanageIds)
      .single()

    if (checkError || !existingChild) {
      return new Response(
        JSON.stringify({ 
          error: 'Enfant non trouvé',
          details: 'L\'enfant n\'existe pas ou vous n\'y avez pas accès'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mettre à jour l'enfant
    const { data: updatedChild, error: updateError } = await supabase
      .from('children')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', childId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour enfant:', updateError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la mise à jour',
          details: updateError.message,
          code: updateError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Enfant mis à jour avec succès',
        data: updatedChild
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