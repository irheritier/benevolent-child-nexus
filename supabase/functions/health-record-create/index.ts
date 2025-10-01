import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Interfaces pour les données
interface VaccinationStatusStructured {
  status: string;
  vaccines: string[];
  last_updated: string | null;
}

interface DiseaseData {
  disease_id: string;
  severity?: string;
  notes?: string;
}

interface HealthRecordData {
  date: string;
  vaccination_status?: string;
  vaccination_status_structured: VaccinationStatusStructured;
  chronic_conditions?: string;
  medications?: string;
  remarks?: string;
  selectedDiseases: DiseaseData[];
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

// Valeurs autorisées pour la sévérité (basé sur la contrainte CHECK)
const ALLOWED_SEVERITY_VALUES = ['légère', 'modérée', 'sévère', 'critique'];

// Fonction pour valider et normaliser la sévérité
function validateSeverity(severity: string | undefined): string | null {
  if (!severity) return null;
  
  // Convertir en minuscules pour la comparaison
  const lowerSeverity = severity.toLowerCase();
  
  // Trouver la valeur correspondante dans les valeurs autorisées
  const matchedSeverity = ALLOWED_SEVERITY_VALUES.find(
    allowed => allowed.toLowerCase() === lowerSeverity
  );
  
  return matchedSeverity || null;
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
    const healthRecordData: HealthRecordData = await req.json()

    // Validation des données requises
    if (!healthRecordData.date) {
      return new Response(
        JSON.stringify({ error: 'La date est requise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!healthRecordData.vaccination_status_structured) {
      return new Response(
        JSON.stringify({ error: 'Le statut vaccinal structuré est requis' }),
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

    // Vérifier que l'enfant existe et appartient à l'utilisateur
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, full_name, orphanage_id')
      .eq('id', childId)
      .in('orphanage_id', orphanageIds)
      .single()

    if (childError || !child) {
      return new Response(
        JSON.stringify({ 
          error: 'Enfant non trouvé',
          details: 'L\'enfant n\'existe pas ou vous n\'y avez pas accès'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que les maladies existent si elles sont spécifiées
    if (healthRecordData.selectedDiseases && healthRecordData.selectedDiseases.length > 0) {
      const diseaseIds = healthRecordData.selectedDiseases.map(d => d.disease_id);
      
      const { data: existingDiseases, error: diseasesError } = await supabase
        .from('diseases')
        .select('id')
        .in('id', diseaseIds)
        .eq('is_active', true)

      if (diseasesError) {
        console.error('Erreur vérification maladies:', diseasesError)
        
        return new Response(
          JSON.stringify({ 
            error: 'Erreur de vérification des maladies',
            details: diseasesError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Vérifier que toutes les maladies existent
      const existingDiseaseIds = existingDiseases?.map(d => d.id) || [];
      const invalidDiseases = diseaseIds.filter(id => !existingDiseaseIds.includes(id));
      
      if (invalidDiseases.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Maladies invalides',
            details: `Les maladies suivantes n'existent pas ou ne sont pas actives: ${invalidDiseases.join(', ')}`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 1. Insérer le dossier médical principal
    const { data: healthRecord, error: healthRecordError } = await supabase
      .from('health_records')
      .insert({
        child_id: childId,
        date: healthRecordData.date,
        vaccination_status: healthRecordData.vaccination_status || '',
        vaccination_status_structured: healthRecordData.vaccination_status_structured,
        chronic_conditions: healthRecordData.chronic_conditions || '',
        medications: healthRecordData.medications || '',
        remarks: healthRecordData.remarks || ''
      })
      .select()
      .single()

    if (healthRecordError) {
      console.error('Erreur insertion dossier médical:', healthRecordError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la création du dossier médical',
          details: healthRecordError.message,
          code: healthRecordError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Insérer les maladies diagnostiquées si il y en a
    if (healthRecordData.selectedDiseases && healthRecordData.selectedDiseases.length > 0) {
      const childDiseases = healthRecordData.selectedDiseases.map(disease => {
        // Valider et normaliser la sévérité
        const validatedSeverity = validateSeverity(disease.severity);
        
        if (disease.severity && !validatedSeverity) {
          console.warn(`Sévérité non valide: "${disease.severity}". Valeurs autorisées: ${ALLOWED_SEVERITY_VALUES.join(', ')}`);
        }
        
        return {
          child_id: childId,
          disease_id: disease.disease_id,
          health_record_id: healthRecord.id,
          diagnosed_date: healthRecordData.date,
          severity: validatedSeverity, // Utiliser la sévérité validée ou null
          notes: disease.notes || null
        };
      });

      const { error: diseasesError } = await supabase
        .from('child_diseases')
        .insert(childDiseases)

      if (diseasesError) {
        console.error('Erreur insertion maladies:', diseasesError)
        
        // Essayer de supprimer le dossier médical créé pour maintenir la cohérence
        await supabase
          .from('health_records')
          .delete()
          .eq('id', healthRecord.id)
        
        return new Response(
          JSON.stringify({ 
            error: 'Erreur lors de l\'enregistrement des maladies',
            details: diseasesError.message,
            code: diseasesError.code
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dossier médical créé avec succès',
        data: {
          health_record: healthRecord,
          diseases_count: healthRecordData.selectedDiseases?.length || 0,
          child_name: child.full_name
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
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