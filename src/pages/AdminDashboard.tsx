import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, LogOut, Eye, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, FileText, Download, BarChart, Bell, Users } from 'lucide-react';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useNotificationAlerts } from '@/hooks/useNotificationAlerts';
import { Link } from 'react-router-dom';

interface Orphanage {
  id: string;
  name: string;
  province: string;
  city: string;
  contact_person: string;
  phone: string;
  email: string;
  description: string;
  legal_status: 'pending' | 'verified' | 'rejected';
  child_capacity: number;
  address: string;
  documents: any;
  created_at: string;
}

const AdminDashboardContent = () => {
  const [orphanages, setOrphanages] = useState<Orphanage[]>([]);
  const [selectedOrphanage, setSelectedOrphanage] = useState<Orphanage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Utiliser le hook pour les alertes automatiques
  useNotificationAlerts();

  useEffect(() => {
    checkAuth();
    fetchOrphanages();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/admin/auth');
      return;
    }

    // Vérifier le rôle admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
      navigate('/admin/auth');
    }
  };

  const fetchOrphanages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orphanages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes.",
          variant: "destructive",
        });
        return;
      }

      setOrphanages(data || []);
    } catch (error) {
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors du chargement des données.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOrphanage = async () => {
    if (!selectedOrphanage) return;

    setIsValidating(true);
    try {
      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-12);

      // Créer le compte utilisateur
      const { data: accountData, error: accountError } = await supabase.rpc('create_user_account', {
        user_email: selectedOrphanage.email,
        user_password: tempPassword,
        user_role: 'orphelinat',
        orphanage_id_param: selectedOrphanage.id
      });

      if (accountError) {
        toast({
          title: "Erreur de création de compte",
          description: accountError.message,
          variant: "destructive",
        });
        return;
      }

      // Mettre à jour le statut de l'orphelinat
      const { error: updateError } = await supabase
        .from('orphanages')
        .update({ legal_status: 'verified' })
        .eq('id', selectedOrphanage.id);

      if (updateError) {
        toast({
          title: "Erreur de mise à jour",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Demande validée avec succès",
        description: `Le compte a été créé pour ${selectedOrphanage.name}. Email: ${selectedOrphanage.email}, Mot de passe temporaire: ${tempPassword}`,
      });

      // Rafraîchir la liste
      fetchOrphanages();
      setShowDialog(false);
      setSelectedOrphanage(null);

    } catch (error) {
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors de la validation.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRejectOrphanage = async () => {
    if (!selectedOrphanage) return;

    setIsValidating(true);
    try {
      const { error } = await supabase
        .from('orphanages')
        .update({ legal_status: 'rejected' })
        .eq('id', selectedOrphanage.id);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Demande rejetée",
        description: `La demande de ${selectedOrphanage.name} a été rejetée.`,
      });

      fetchOrphanages();
      setShowDialog(false);
      setSelectedOrphanage(null);
    } catch (error) {
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors du rejet.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/auth');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
      case 'verified':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownloadDocument = async (documentData: any) => {
    if (!documentData?.legal_document?.url) {
      toast({
        title: "Aucun document",
        description: "Aucun document n'est disponible pour le téléchargement.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(documentData.legal_document.url);
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = documentData.legal_document.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Document téléchargé",
        description: `Le document ${documentData.legal_document.file_name} a été téléchargé.`,
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le document.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewDocument = (documentData: any) => {
    if (!documentData?.legal_document?.url) {
      toast({
        title: "Aucun document",
        description: "Aucun document n'est disponible pour la prévisualisation.",
        variant: "destructive",
      });
      return;
    }

    window.open(documentData.legal_document.url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Congo ChildNet</h1>
              <p className="text-xs text-muted-foreground">Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Tableau de bord administrateur</h2>
          <p className="text-muted-foreground">
            Gérez les demandes d'inscription et consultez les statistiques du système.
          </p>
        </div>

        {/* Liens rapides */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Accès rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/partners">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Gestion des partenaires</h4>
                      <p className="text-sm text-muted-foreground">Approuver les demandes d'accès</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Demandes d'inscription
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Analyses et statistiques
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Onglet des demandes d'inscription */}
          <TabsContent value="requests" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {orphanages.filter(o => o.legal_status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Validés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {orphanages.filter(o => o.legal_status === 'verified').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rejetés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {orphanages.filter(o => o.legal_status === 'rejected').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orphanages Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des demandes</CardTitle>
                <CardDescription>
                  Cliquez sur une demande pour voir les détails et procéder à la validation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du centre</TableHead>
                      <TableHead>Province</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanages.map((orphanage) => (
                      <TableRow key={orphanage.id}>
                        <TableCell className="font-medium">{orphanage.name}</TableCell>
                        <TableCell>{orphanage.province}, {orphanage.city}</TableCell>
                        <TableCell>{orphanage.contact_person}</TableCell>
                        <TableCell>{getStatusBadge(orphanage.legal_status)}</TableCell>
                        <TableCell>{new Date(orphanage.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrphanage(orphanage);
                              setShowDialog(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet des analyses et statistiques */}
          <TabsContent value="analytics">
            <AdminStatsDashboard />
          </TabsContent>

          {/* Onglet des notifications */}
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </main>

      {/* Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {selectedOrphanage?.name}
            </DialogTitle>
            <DialogDescription>
              Détails de la demande d'inscription
            </DialogDescription>
          </DialogHeader>

          {selectedOrphanage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Localisation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrphanage.province}, {selectedOrphanage.city}
                  </p>
                  {selectedOrphanage.address && (
                    <p className="text-sm text-muted-foreground">{selectedOrphanage.address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Capacité</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrphanage.child_capacity || 'Non spécifiée'} enfants
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOrphanage.contact_person}
                </p>
                <p className="text-sm text-muted-foreground">{selectedOrphanage.email}</p>
                {selectedOrphanage.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {selectedOrphanage.phone}
                  </p>
                )}
              </div>

              {selectedOrphanage.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrphanage.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </h4>
                {selectedOrphanage.documents?.legal_document ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Document légal fourni</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {selectedOrphanage.documents.legal_document.file_name}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewDocument(selectedOrphanage.documents)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Prévisualiser
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(selectedOrphanage.documents)}
                          className="flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun document fourni</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Statut actuel</h4>
                {getStatusBadge(selectedOrphanage.legal_status)}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedOrphanage?.legal_status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleRejectOrphanage}
                  disabled={isValidating}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </Button>
                <Button
                  onClick={handleValidateOrphanage}
                  disabled={isValidating}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isValidating ? "Validation..." : "Valider"}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <NotificationProvider>
      <AdminDashboardContent />
    </NotificationProvider>
  );
};

export default AdminDashboard;
