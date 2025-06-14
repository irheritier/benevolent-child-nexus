
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Trash2, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type OrphanageDocument = Tables<'orphanage_documents'>;

interface DocumentsHistoryProps {
  orphanageId: string;
  orphanageName: string;
  onAddDocument: () => void;
}

const DocumentsHistory = ({ orphanageId, orphanageName, onAddDocument }: DocumentsHistoryProps) => {
  const [documents, setDocuments] = useState<OrphanageDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [orphanageId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('orphanage_documents')
        .select('*')
        .eq('orphanage_id', orphanageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      // Supprimer le fichier du storage
      await supabase.storage
        .from('orphanage-documents')
        .remove([filePath]);

      // Supprimer l'enregistrement de la base de données
      const { error } = await supabase
        .from('orphanage_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    const typeConfig = {
      'agrément': { label: 'Agrément', className: 'bg-green-100 text-green-800 border-green-200' },
      'statuts': { label: 'Statuts', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'autorisation': { label: 'Autorisation', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'certificat': { label: 'Certificat', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'autre': { label: 'Autre', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.autre;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Chargement des documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents légaux - {orphanageName}
          </CardTitle>
          <Button onClick={onAddDocument} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun document</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter vos documents légaux (agrément, statuts, etc.).
            </p>
            <Button onClick={onAddDocument}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un document
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{document.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Ajouté le {format(new Date(document.created_at), 'PPP', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDocumentTypeBadge(document.document_type)}
                    {document.expiry_date && isExpired(document.expiry_date) && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expiré
                      </Badge>
                    )}
                    {document.expiry_date && isExpiringSoon(document.expiry_date) && !isExpired(document.expiry_date) && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expire bientôt
                      </Badge>
                    )}
                  </div>
                </div>

                {document.description && (
                  <p className="text-sm text-muted-foreground mb-3">{document.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{document.file_name}</span>
                    <span>{formatFileSize(document.file_size)}</span>
                    {document.expiry_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Expire le {format(new Date(document.expiry_date), 'PPP', { locale: fr })}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document.file_url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = document.file_url;
                        link.download = document.file_name;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id, document.file_path)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsHistory;
