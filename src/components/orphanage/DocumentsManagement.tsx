
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Shield, Info } from 'lucide-react';
import DocumentUploadForm from './DocumentUploadForm';
import DocumentsHistory from './DocumentsHistory';

interface Child {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  estimated_age: number | null;
  entry_date: string | null;
  parent_status: string;
  internal_code: string | null;
  created_at: string;
}

interface DocumentsManagementProps {
  orphanageId: string;
  orphanageName: string;
  children: Child[];
}

const DocumentsManagement = ({ orphanageId, orphanageName, children }: DocumentsManagementProps) => {
  const [showAddDocument, setShowAddDocument] = useState(false);

  const handleAddDocumentSuccess = () => {
    setShowAddDocument(false);
    // Le composant DocumentsHistory se rechargera automatiquement
  };

  return (
    <div className="space-y-6">
      {/* Informations importantes */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            Importance des documents légaux
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2 text-sm">
            <p>
              <strong>Documents requis :</strong> Agrément ministériel, statuts de l'organisation, 
              autorisation d'exploitation, certificat d'enregistrement.
            </p>
            <p>
              <strong>Confidentialité :</strong> Ces documents sont utilisés uniquement à des fins 
              de vérification et de recensement, dans le respect de la confidentialité.
            </p>
            <p>
              <strong>Validation :</strong> La mise à jour régulière de vos documents légaux 
              facilite les processus de validation et de suivi administratif.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Engagement éthique */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            Engagement de confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-2 text-sm">
            <p>
              Nous nous engageons à protéger la confidentialité de vos documents et des 
              informations concernant les enfants sous votre protection.
            </p>
            <p>
              <strong>Protection des données :</strong> Toutes les informations sont stockées 
              de manière sécurisée et ne sont accessibles qu'aux personnes autorisées.
            </p>
            <p>
              <strong>Respect des droits :</strong> Nous respectons les lois nationales et 
              internationales sur la protection des enfants.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Centre d'accueil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orphanageName}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {children.length} enfant(s) hébergé(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents légaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gestion centralisée</div>
            <p className="text-xs text-muted-foreground mt-1">
              Agrément, statuts, autorisations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Protégée</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stockage sécurisé et confidentiel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historique des documents */}
      <DocumentsHistory
        orphanageId={orphanageId}
        orphanageName={orphanageName}
        onAddDocument={() => setShowAddDocument(true)}
      />

      {/* Dialog pour ajouter un document */}
      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un document légal</DialogTitle>
          </DialogHeader>
          <DocumentUploadForm
            orphanageId={orphanageId}
            onSuccess={handleAddDocumentSuccess}
            onCancel={() => setShowAddDocument(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsManagement;
