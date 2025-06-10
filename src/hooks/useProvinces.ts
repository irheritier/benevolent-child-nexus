
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name, code')
        .order('name');
      
      if (error) {
        console.error('Error fetching provinces:', error);
        throw error;
      }
      
      return data;
    },
  });
};
