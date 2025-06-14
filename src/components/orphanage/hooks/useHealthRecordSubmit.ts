
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SelectedDisease {
  disease_id: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

interface HealthRecordData {
  date: Date;
  vaccination_status: string;
  vaccination_status_structured: {
    status: 'vaccinated' | 'partially_vaccinated' | 'not_vaccinated' | 'unknown';
    vaccines: string[];
    last_updated: string;
  };
  chronic_conditions: string;
  medications: string;
  remarks: string;
  selectedDiseases: SelectedDisease[];
}

export const useHealthRecordSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitHealthRecord = async (
    childId: string,
    childName: string,
    data: HealthRecordData,
    onSuccess: () => void
  ) => {
    setIsSubmitting(true);
    
    try {
      // Insérer le dossier médical principal
      const { data: healthRecord, error: healthRecordError } = await supabase
        .from('health_records')
        .insert({
          child_id: childId,
          date: format(data.date, 'yyyy-MM-dd'),
          vaccination_status: data.vaccination_status,
          vaccination_status_structured: data.vaccination_status_structured,
          chronic_conditions: data.chronic_conditions,
          medications: data.medications,
          remarks: data.remarks,
        })
        .select()
        .single();

      if (healthRecordError) throw healthRecordError;

      // Insérer les maladies diagnostiquées si il y en a
      if (data.selectedDiseases.length > 0) {
        const childDiseases = data.selectedDiseases.map(disease => ({
          child_id: childId,
          disease_id: disease.disease_id,
          health_record_id: healthRecord.id,
          diagnosed_date: format(data.date, 'yyyy-MM-dd'),
          severity: disease.severity,
          notes: disease.notes || null,
        }));

        const { error: diseasesError } = await supabase
          .from('child_diseases')
          .insert(childDiseases);

        if (diseasesError) throw diseasesError;
      }

      toast({
        title: "Dossier médical enregistré",
        description: `Le dossier médical de ${childName} a été mis à jour avec succès.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le dossier médical.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitHealthRecord, isSubmitting };
};
