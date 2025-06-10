
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCities = (provinceId?: string) => {
  return useQuery({
    queryKey: ['cities', provinceId],
    queryFn: async () => {
      let query = supabase
        .from('cities')
        .select('id, name, province_id')
        .order('name');
      
      if (provinceId) {
        query = query.eq('province_id', provinceId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching cities:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!provinceId,
  });
};
