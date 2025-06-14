
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChildFormData } from '../schemas/childSchema';

export const useEditChild = (childId: string, onSuccess: () => void) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const editChild = async (data: ChildFormData) => {
    try {
      setIsEditing(true);

      const updateData = {
        full_name: data.full_name,
        gender: data.gender,
        birth_date: data.birth_date ? data.birth_date.toISOString().split('T')[0] : null,
        estimated_age: data.estimated_age || null,
        entry_date: data.entry_date ? data.entry_date.toISOString().split('T')[0] : null,
        parent_status: data.parent_status,
        internal_code: data.internal_code || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('children')
        .update(updateData)
        .eq('id', childId);

      if (error) {
        throw error;
      }

      toast({
        title: "Enfant modifié",
        description: "Les informations de l'enfant ont été mises à jour avec succès.",
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la modification de l\'enfant:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'enfant. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return {
    editChild,
    isEditing,
  };
};
