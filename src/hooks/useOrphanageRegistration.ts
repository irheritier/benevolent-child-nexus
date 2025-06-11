
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationData {
  centerName: string;
  capacity: string;
  provinceId: string;
  cityId: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  description: string;
  documentData?: {
    document_url: string;
    document_path: string;
    uploaded_at: string;
    file_type: string;
    file_name: string;
    file_size: number;
  } | null;
}

export const useOrphanageRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitRegistration = async (data: RegistrationData) => {
    setIsSubmitting(true);
    
    try {
      // Get province and city names
      const { data: provinceData } = await supabase
        .from('provinces')
        .select('name')
        .eq('id', data.provinceId)
        .single();

      const { data: cityData } = await supabase
        .from('cities')
        .select('name')
        .eq('id', data.cityId)
        .single();

      // Prepare orphanage data
      const orphanageData = {
        name: data.centerName,
        province_id: data.provinceId,
        city_id: data.cityId,
        province: provinceData?.name || '',
        city: cityData?.name || '',
        address: data.address,
        contact_person: data.contactPerson,
        phone: data.phone,
        email: data.email,
        description: data.description,
        child_capacity: data.capacity ? parseInt(data.capacity) : null,
        legal_status: 'pending' as const,
        documents: data.documentData ? {
          legal_document: {
            url: data.documentData.document_url,
            path: data.documentData.document_path,
            uploaded_at: data.documentData.uploaded_at,
            file_type: data.documentData.file_type,
            file_name: data.documentData.file_name,
            file_size: data.documentData.file_size
          }
        } : {}
      };

      // Insert orphanage record
      const { data: insertedOrphanage, error } = await supabase
        .from('orphanages')
        .insert(orphanageData)
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Erreur d'inscription",
          description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Demande soumise avec succès !",
        description: "Votre demande d'inscription a été soumise et est en cours de validation par nos équipes. Vous recevrez un email de confirmation dans les 48 heures.",
      });

      return { success: true, data: insertedOrphanage };
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur inattendue est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRegistration,
    isSubmitting
  };
};
