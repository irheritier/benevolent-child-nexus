import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
}

// Schéma de validation Zod pour la mise à jour
const nutritionRecordUpdateSchema = z.object({
  date: z.string().datetime({ message: "La date doit être au format ISO" })
    .transform((val) => new Date(val))
    .optional(),
  weight_kg: z.number({
    required_error: "Le poids est requis",
  })
  .min(0.1, "Le poids doit être supérieur à 0")
  .max(200, "Le poids ne peut pas dépasser 200kg")
  .optional(),
  height_cm: z.number({
    required_error: "La taille est requise",
  })
  .min(10, "La taille doit être supérieure à 10cm")
  .max(250, "La taille ne peut pas dépasser 250cm")
  .optional(),
  nutrition_status: z.enum(['severely_malnourished', 'malnourished', 'normal'], {
    required_error: "Le statut nutritionnel est requis",
  })
  .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Au moins un champ doit être fourni pour la mise à jour"
});

// Interface TypeScript
interface NutritionRecordUpdateData {
  date?: Date;
  weight_kg?: number;
  height_cm?: number;
  nutrition_status?: 'severely_malnourished' | 'malnourished' | 'normal';
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

// Fonction pour formater la date en YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fonction pour calculer le BMI
function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return parseFloat(bmi.toFixed(2));
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

    // Récupérer et valider les données de la requête
    let requestData: any;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Données JSON invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valider les données avec Zod
    const validationResult = nutritionRecordUpdateSchema.safeParse(requestData);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return new Response(
        JSON.stringify({ 
          error: 'Données invalides',
          details: errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updateData: NutritionRecordUpdateData = validationResult.data;

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

    // Préparer les données de mise à jour
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    // Ajouter les champs fournis
    if (updateData.date !== undefined) {
      updatePayload.date = formatDate(updateData.date);
    }
    
    if (updateData.weight_kg !== undefined) {
      updatePayload.weight_kg = updateData.weight_kg;
    }
    
    if (updateData.height_cm !== undefined) {
      updatePayload.height_cm = updateData.height_cm;
    }
    
    if (updateData.nutrition_status !== undefined) {
      updatePayload.nutrition_status = updateData.nutrition_status;
    }

    // Recalculer le BMI si le poids ou la taille est modifié
    if (updateData.weight_kg !== undefined || updateData.height_cm !== undefined) {
      const finalWeight = updateData.weight_kg !== undefined ? updateData.weight_kg : existingRecord.weight_kg;
      const finalHeight = updateData.height_cm !== undefined ? updateData.height_cm : existingRecord.height_cm;
      
      if (finalWeight && finalHeight) {
        updatePayload.bmi = calculateBMI(finalWeight, finalHeight);
      } else {
        updatePayload.bmi = null;
      }
    }

    // Mettre à jour le record nutritionnel
    const { data: updatedRecord, error: updateError } = await supabase
      .from('nutrition_records')
      .update(updatePayload)
      .eq('id', nutritionRecordId)
      .select(`
        *,
        child:children (
          full_name
        )
      `)
      .single()

    if (updateError) {
      console.error('Erreur mise à jour record nutritionnel:', updateError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la mise à jour du record nutritionnel',
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint || null
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Record nutritionnel mis à jour avec succès',
        data: {
          nutrition_record: updatedRecord,
          child_name: existingRecord.child?.full_name,
          updated_fields: Object.keys(updatePayload).filter(key => key !== 'updated_at')
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