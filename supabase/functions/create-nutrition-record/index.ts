import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Schéma de validation Zod
const nutritionRecordSchema = z.object({
  date: z.string().datetime({ message: "La date doit être au format ISO" }).transform((val) => new Date(val)),
  weight_kg: z.number({
    required_error: "Le poids est requis",
  }).min(0.1, "Le poids doit être supérieur à 0").max(200, "Le poids ne peut pas dépasser 200kg"),
  height_cm: z.number({
    required_error: "La taille est requise",
  }).min(10, "La taille doit être supérieure à 10cm").max(250, "La taille ne peut pas dépasser 250cm"),
  nutrition_status: z.enum(['severely_malnourished', 'malnourished', 'normal'], {
    required_error: "Le statut nutritionnel est requis",
  }),
});

// Interface TypeScript
interface NutritionRecordData {
  date: Date;
  weight_kg: number;
  height_cm: number;
  nutrition_status: 'severely_malnourished' | 'malnourished' | 'normal';
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
  return parseFloat(bmi.toFixed(2)); // Arrondir à 2 décimales
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

    // Récupérer l'ID de l'enfant depuis l'URL
    const url = new URL(req.url);
    const childId = url.pathname.split('/').pop();

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'ID de l\'enfant requis' }),
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
    const validationResult = nutritionRecordSchema.safeParse(requestData);
    
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

    const nutritionData: NutritionRecordData = validationResult.data;

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

    // Calculer le BMI
    const bmiValue = calculateBMI(nutritionData.weight_kg, nutritionData.height_cm);

    // Insérer le record nutritionnel
    const { data: nutritionRecord, error: insertError } = await supabase
      .from('nutrition_records')
      .insert({
        child_id: childId,
        date: formatDate(nutritionData.date),
        weight_kg: nutritionData.weight_kg,
        height_cm: nutritionData.height_cm,
        bmi: bmiValue,
        nutrition_status: nutritionData.nutrition_status,
      })
      .select(`
        *,
        child:children (
          full_name
        )
      `)
      .single()

    if (insertError) {
      console.error('Erreur insertion record nutritionnel:', insertError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la création du record nutritionnel',
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint || null
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Record nutritionnel créé avec succès',
        data: {
          nutrition_record: nutritionRecord,
          child_name: child.full_name,
          bmi: bmiValue,
          bmi_interpretation: getBMIInterpretation(bmiValue, child.age) // Fonction optionnelle
        }
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

// Fonction optionnelle pour interpréter le BMI (à adapter selon l'âge de l'enfant)
function getBMIInterpretation(bmi: number | null, age?: number): string {
  if (bmi === null) return 'Données insuffisantes pour calculer le BMI';
  
  // Interprétation basique pour adultes (à adapter pour enfants avec courbes de croissance)
  if (bmi < 18.5) return 'Insuffisance pondérale';
  if (bmi < 25) return 'Poids normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obésité';
}