
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Disease {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export const useDiseases = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDiseases(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des maladies:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des maladies.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { diseases, isLoading, loadDiseases };
};
