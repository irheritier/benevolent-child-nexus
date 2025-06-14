import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Heart, 
  LogOut, 
  Users, 
  UserPlus, 
  Activity, 
  FileText, 
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddChildForm from '@/components/orphanage/AddChildForm';
import EditChildForm from '@/components/orphanage/EditChildForm';
import ChildrenTable from '@/components/orphanage/ChildrenTable';
import ChildDetailsDialog from '@/components/orphanage/ChildDetailsDialog';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Orphanage {
  id: string;
  name: string;
  province: string;
  city: string;
  contact_person: string;
  phone: string;
  email: string;
  legal_status: string;
  child_capacity: number;
  created_at: string;
}

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

const OrphanageDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orphanage, setOrphanage] = useState<Orphanage | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/orphelinat/auth');
        return;
      }

      // Vérifier le rôle utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, is_verified')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        navigate('/orphelinat/auth');
        return;
      }

      if (userData.role !== 'orphelinat' || !userData.is_verified) {
        await supabase.auth.signOut();
        navigate('/orphelinat/auth');
        return;
      }

      setUser(userData);

      // Récupérer les informations de l'orphelinat
      const { data: linkData } = await supabase
        .from('user_orphanage_links')
        .select('orphanage_id')
        .eq('user_id', userData.id)
        .single();

      if (linkData) {
        const { data: orphanageData } = await supabase
          .from('orphanages')
          .select('*')
          .eq('id', linkData.orphanage_id)
          .single();

        if (orphanageData) {
          setOrphanage(orphanageData);
          await loadChildren(orphanageData.id);
        }
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      navigate('/orphelinat/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildren = async (orphanageId: string) => {
    try {
      const { data: childrenData, error } = await supabase
        .from('children')
        .select('*')
        .eq('orphanage_id', orphanageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(childrenData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des enfants:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/orphelinat/auth');
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  const handleAddChildSuccess = () => {
    setShowAddChild(false);
    if (orphanage) {
      loadChildren(orphanage.id);
    }
    toast({
      title: "Enfant ajouté",
      description: "L'enfant a été enregistré avec succès.",
    });
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
  };

  const handleEditChildSuccess = () => {
    setEditingChild(null);
    if (orphanage) {
      loadChildren(orphanage.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingChild(null);
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      setChildren(children.filter(child => child.id !== childId));
      toast({
        title: "Enfant supprimé",
        description: "L'enfant a été retiré de votre centre.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'enfant.",
        variant: "destructive",
      });
    }
  };

  const handleViewChildDetails = (child: Child) => {
    setViewingChild(child);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Vérifié</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!orphanage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="text-muted-foreground mb-4">
              Aucun centre d'accueil associé à ce compte.
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">
                {orphanage.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Espace de gestion
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(orphanage.legal_status)}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enfants hébergés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
              <p className="text-xs text-muted-foreground">
                Capacité: {orphanage.child_capacity || 'Non définie'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Garçons</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {children.filter(child => child.gender === 'M').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filles</CardTitle>
              <Users className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {children.filter(child => child.gender === 'F').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {getStatusBadge(orphanage.legal_status)}
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="children">Enfants</TabsTrigger>
            <TabsTrigger value="health">Santé</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations du centre */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Informations du centre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nom du centre</label>
                    <p className="font-medium">{orphanage.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Province</label>
                      <p className="font-medium">{orphanage.province}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ville</label>
                      <p className="font-medium">{orphanage.city}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Personne de contact</label>
                    <p className="font-medium">{orphanage.contact_person}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{orphanage.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{orphanage.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activité récente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {children.length === 0 
                        ? "Aucun enfant enregistré pour le moment."
                        : `${children.length} enfant(s) enregistré(s) dans votre centre.`
                      }
                    </div>
                    <Button size="sm" className="w-full" onClick={() => setShowAddChild(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter un enfant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Gestion des enfants</h3>
                <p className="text-sm text-muted-foreground">
                  Enregistrez et gérez les enfants hébergés dans votre centre.
                </p>
              </div>
              <Button onClick={() => setShowAddChild(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un enfant
              </Button>
            </div>

            <ChildrenTable
              children={children}
              onEdit={handleEditChild}
              onDelete={handleDeleteChild}
              onViewDetails={handleViewChildDetails}
            />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Suivi médical et nutritionnel
                </CardTitle>
                <CardDescription>
                  Gérez les données de santé et de nutrition des enfants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Fonctionnalité en développement</h3>
                  <p className="text-muted-foreground">
                    Les outils de suivi médical et nutritionnel seront bientôt disponibles.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents légaux
                </CardTitle>
                <CardDescription>
                  Gérez les documents officiels de votre centre d'accueil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gestion des documents</h3>
                  <p className="text-muted-foreground">
                    Interface de gestion des documents en cours de développement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog pour ajouter un enfant */}
      <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel enfant</DialogTitle>
          </DialogHeader>
          <AddChildForm
            orphanageId={orphanage.id}
            onSuccess={handleAddChildSuccess}
            onCancel={() => setShowAddChild(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un enfant */}
      <Dialog open={!!editingChild} onOpenChange={(open) => !open && setEditingChild(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'enfant</DialogTitle>
          </DialogHeader>
          {editingChild && (
            <EditChildForm
              child={editingChild}
              onSuccess={handleEditChildSuccess}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour voir les détails d'un enfant */}
      <ChildDetailsDialog
        child={viewingChild}
        open={!!viewingChild}
        onOpenChange={(open) => !open && setViewingChild(null)}
      />
    </div>
  );
};

export default OrphanageDashboard;
