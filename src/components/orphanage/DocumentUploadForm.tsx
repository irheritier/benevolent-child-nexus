
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const documentSchema = z.object({
  document_type: z.enum(['agrément', 'statuts', 'autorisation', 'certificat', 'autre'], {
    required_error: "Le type de document est requis",
  }),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  expiry_date: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentUploadFormProps {
  orphanageId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DocumentUploadForm = ({ orphanageId, onSuccess, onCancel }: DocumentUploadFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadedFile, isUploading, uploadFile, removeFile, getDocumentData } = useFileUpload();
  const { toast } = useToast();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!uploadedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const documentData = getDocumentData();
      if (!documentData) {
        throw new Error("Erreur lors de la récupération des données du document");
      }

      const { error } = await supabase
        .from('orphanage_documents')
        .insert({
          orphanage_id: orphanageId,
          document_type: data.document_type,
          title: data.title,
          description: data.description || null,
          expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
          file_url: documentData.document_url,
          file_path: documentData.document_path,
          file_name: documentData.file_name,
          file_size: documentData.file_size,
          file_type: documentData.file_type,
        });

      if (error) throw error;

      toast({
        title: "Document ajouté",
        description: "Le document a été ajouté avec succès.",
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du document.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypeOptions = [
    { value: 'agrément', label: 'Agrément ministériel' },
    { value: 'statuts', label: 'Statuts de l\'organisation' },
    { value: 'autorisation', label: 'Autorisation d\'exploitation' },
    { value: 'certificat', label: 'Certificat d\'enregistrement' },
    { value: 'autre', label: 'Autre document' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Ajouter un document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de document *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de document" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du document *</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Agrément 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description optionnelle du document..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'expiration (optionnelle)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Fichier du document *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {!uploadedFile ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <div className="text-sm text-gray-600">
                      <label className="cursor-pointer">
                        <span className="font-medium text-primary hover:text-primary/80">
                          Cliquez pour télécharger
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || !uploadedFile}
                className="flex-1"
              >
                {isSubmitting ? "Ajout en cours..." : "Ajouter le document"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadForm;
