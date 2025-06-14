
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ChildFormData } from '../schemas/childSchema';

export const useChildSubmit = (orphanageId: string, onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitChild = async (data: ChildFormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert dates to strings and ensure required fields are present
      const submitData = {
        orphanage_id: orphanageId,
        full_name: data.full_name,
        gender: data.gender,
        birth_date: data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null,
        estimated_age: data.estimated_age || null,
        entry_date: data.entry_date ? format(data.entry_date, 'yyyy-MM-dd') : null,
        parent_status: data.parent_status,
        internal_code: data.internal_code || null,
      };

      const { error } = await supabase
        .from('children')
        .insert([submitData]);

      if (error) throw error;

      toast({
        title: "Enfant ajouté avec succès",
        description: `${data.full_name} a été enregistré dans votre centre.`,
      });

      onSuccess();
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'enfant:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'enfant.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitChild, isSubmitting };
};
