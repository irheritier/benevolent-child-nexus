
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  file: File;
  url: string;
  path: string;
}

export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Validation du fichier
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format non accepté",
          description: `Le fichier ${file.name} n'est pas dans un format accepté.`,
          variant: "destructive",
        });
        return null;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier ${file.name} dépasse la taille maximale de 10MB.`,
          variant: "destructive",
        });
        return null;
      }

      // Génération d'un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `temp/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('orphanage-documents')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Erreur d'upload",
          description: "Une erreur est survenue lors du téléchargement du fichier.",
          variant: "destructive",
        });
        return null;
      }

      // Génération de l'URL publique temporaire
      const { data: urlData } = supabase.storage
        .from('orphanage-documents')
        .getPublicUrl(data.path);

      const uploadedFileData = {
        file,
        url: urlData.publicUrl,
        path: data.path
      };

      setUploadedFile(uploadedFileData);
      
      toast({
        title: "Fichier téléchargé",
        description: `Fichier ${file.name} téléchargé avec succès.`,
      });

      return data.path;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async () => {
    if (uploadedFile) {
      try {
        await supabase.storage
          .from('orphanage-documents')
          .remove([uploadedFile.path]);
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
    setUploadedFile(null);
  };

  const getDocumentData = () => {
    if (!uploadedFile) return null;
    
    return {
      document_url: uploadedFile.url,
      document_path: uploadedFile.path,
      uploaded_at: new Date().toISOString(),
      file_type: uploadedFile.file.type.startsWith('image/') ? 'image' : 'pdf',
      file_name: uploadedFile.file.name,
      file_size: uploadedFile.file.size
    };
  };

  return {
    uploadedFile,
    isUploading,
    uploadFile,
    removeFile,
    getDocumentData
  };
};
