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
  refreshTrigger?: number; // Nouveau prop pour déclencher le rechargement
}

const DocumentsHistory = ({ orphanageId, orphanageName, onAddDocument, refreshTrigger }: DocumentsHistoryProps) => {
  const [documents, setDocuments] = useState<OrphanageDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [orphanageId, refreshTrigger]); // Ajouter refreshTrigger comme dépendance

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-5 h-5" />
            <span className="truncate">Documents légaux - {orphanageName}</span>
          </CardTitle>
          <Button onClick={onAddDocument} size="sm" className="w-full sm:w-auto">
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
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Ajouté le {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getDocumentTypeBadge(doc.document_type)}
                    {doc.expiry_date && isExpired(doc.expiry_date) && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Expiré</span>
                      </Badge>
                    )}
                    {doc.expiry_date && isExpiringSoon(doc.expiry_date) && !isExpired(doc.expiry_date) && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Expire bientôt</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {doc.description && (
                  <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <span className="truncate">{doc.file_name}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    {doc.expiry_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Expire le {format(new Date(doc.expiry_date), 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = window.document.createElement('a');
                        link.href = doc.file_url;
                        link.download = doc.file_name;
                        link.click();
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Télécharger</span>
                      <span className="sm:hidden">DL</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
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
