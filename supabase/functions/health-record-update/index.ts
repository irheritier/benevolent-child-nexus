import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

// Valeurs autorisées pour la sévérité
const ALLOWED_SEVERITY_VALUES = ['mild', 'moderate', 'severe'];

// Fonction pour valider et normaliser la sévérité
function validateSeverity(severity: string | undefined): string | null {
  if (!severity) return null;
  
  const lowerSeverity = severity.toLowerCase();
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

    const userId = payload.sub;

    // Créer le client Supabase avec la service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer l'ID du dossier médical depuis l'URL
    const url = new URL(req.url);
    const healthRecordId = url.pathname.split('/').pop();

    if (!healthRecordId) {
      return new Response(
        JSON.stringify({ error: 'ID du dossier médical requis' }),
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
          details: linkError.message
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

    // Vérifier que le dossier médical existe et appartient à l'utilisateur
    const { data: existingRecord, error: recordError } = await supabase
      .from('health_records')
      .select(`
        id,
        child:children (
          id,
          orphanage_id
        )
      `)
      .eq('id', healthRecordId)
      .in('children.orphanage_id', orphanageIds)
      .single()

    if (recordError) {
    console.error('Erreur vérification dossier médical:', recordError)
    
    if (recordError.code === 'PGRST116') { // Code pour "no rows found"
        return new Response(
        JSON.stringify({ 
            error: 'Dossier médical non trouvé',
            details: 'Le dossier médical n\'existe pas ou vous n\'y avez pas accès',
            code: recordError.code
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } else {
        return new Response(
        JSON.stringify({ 
            error: 'Erreur de vérification du dossier médical',
            details: recordError.message,
            code: recordError.code,
            hint: recordError.hint || null
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    }

    if (!existingRecord) {
    return new Response(
        JSON.stringify({ 
        error: 'Dossier médical non trouvé',
        details: 'Le dossier médical n\'existe pas ou vous n\'y avez pas accès',
        code: 'NOT_FOUND'
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

    // Commencer une transaction
    const { data: updatedRecord, error: updateError } = await supabase
      .from('health_records')
      .update({
        date: healthRecordData.date,
        vaccination_status: healthRecordData.vaccination_status || '',
        vaccination_status_structured: healthRecordData.vaccination_status_structured,
        chronic_conditions: healthRecordData.chronic_conditions || '',
        medications: healthRecordData.medications || '',
        remarks: healthRecordData.remarks || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', healthRecordId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour dossier médical:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la mise à jour du dossier médical',
          details: updateError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gérer les maladies diagnostiquées
    if (healthRecordData.selectedDiseases) {
      // Supprimer les anciennes maladies associées à ce dossier médical
      const { error: deleteError } = await supabase
        .from('child_diseases')
        .delete()
        .eq('health_record_id', healthRecordId)

      if (deleteError) {
        console.error('Erreur suppression anciennes maladies:', deleteError)
        return new Response(
          JSON.stringify({ 
            error: 'Erreur lors de la mise à jour des maladies',
            details: deleteError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Insérer les nouvelles maladies si il y en a
      if (healthRecordData.selectedDiseases.length > 0) {
        const childDiseases = healthRecordData.selectedDiseases.map(disease => {
          const validatedSeverity = validateSeverity(disease.severity);
          
          if (disease.severity && !validatedSeverity) {
            console.warn(`Sévérité non valide: "${disease.severity}"`);
          }
          
          return {
            child_id: existingRecord.child.id,
            disease_id: disease.disease_id,
            health_record_id: healthRecordId,
            diagnosed_date: healthRecordData.date,
            severity: validatedSeverity,
            notes: disease.notes || null
          };
        });

        const { error: insertError } = await supabase
          .from('child_diseases')
          .insert(childDiseases)

        if (insertError) {
          console.error('Erreur insertion nouvelles maladies:', insertError)
          return new Response(
            JSON.stringify({ 
              error: 'Erreur lors de l\'enregistrement des maladies',
              details: insertError.message
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dossier médical mis à jour avec succès',
        data: {
          health_record: updatedRecord,
          diseases_count: healthRecordData.selectedDiseases?.length || 0
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