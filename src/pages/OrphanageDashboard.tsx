
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  UserPlus, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  FileText,
  Activity,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddChildForm from '@/components/orphanage/AddChildForm';
import EditChildForm from '@/components/orphanage/EditChildForm';
import ChildrenTable from '@/components/orphanage/ChildrenTable';
import ChildDetailsDialog from '@/components/orphanage/ChildDetailsDialog';
import HealthManagement from '@/components/orphanage/HealthManagement';
import NutritionManagement from '@/components/orphanage/NutritionManagement';
import DocumentsManagement from '@/components/orphanage/DocumentsManagement';
import DashboardHeader from '@/components/orphanage/DashboardHeader';
import StatsCards from '@/components/orphanage/StatsCards';

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700 dark:text-slate-300">Chargement de votre espace...</span>
        </div>
      </div>
    );
  }

  if (!orphanage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="w-full max-w-md text-center shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="text-slate-600 dark:text-slate-400 mb-4">
              Aucun centre d'accueil associé à ce compte.
            </div>
            <Button onClick={handleLogout} variant="outline">
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardHeader user={user} orphanage={orphanage} onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-8">
        {/* Statistiques rapides */}
        <div className="mb-8">
          <StatsCards children={children} orphanage={orphanage} />
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border shadow-lg rounded-xl p-1 h-12">
            <TabsTrigger value="overview" className="rounded-lg font-semibold">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="children" className="rounded-lg font-semibold">Enfants</TabsTrigger>
            <TabsTrigger value="health" className="rounded-lg font-semibold">Santé</TabsTrigger>
            <TabsTrigger value="nutrition" className="rounded-lg font-semibold">Nutrition</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg font-semibold">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations du centre */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    Informations du centre
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nom du centre</label>
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{orphanage.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Province</label>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{orphanage.province}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Ville</label>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{orphanage.city}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Personne de contact</label>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{orphanage.contact_person}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-slate-300">{orphanage.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-slate-300">{orphanage.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {children.length === 0 
                      ? "Commencez par enregistrer votre premier enfant dans le système."
                      : `Vous gérez actuellement ${children.length} enfant(s) dans votre centre.`
                    }
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all"
                      onClick={() => setShowAddChild(true)}
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Ajouter un enfant
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Suivi médical</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Onglet Santé</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Documents</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Onglet Documents</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Gestion des enfants</CardTitle>
                    <CardDescription className="text-blue-100 mt-1">
                      Enregistrez et gérez les enfants hébergés dans votre centre.
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddChild(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    variant="outline"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un enfant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ChildrenTable
                  children={children}
                  onEdit={handleEditChild}
                  onDelete={handleDeleteChild}
                  onViewDetails={handleViewChildDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Suivi médical et nutritionnel</CardTitle>
                <CardDescription className="text-red-100 mt-1">
                  Gérez les données de santé et de nutrition des enfants de votre centre.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <HealthManagement children={children} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Suivi nutritionnel</CardTitle>
                <CardDescription className="text-green-100 mt-1">
                  Gérez les données de poids, taille et statut nutritionnel des enfants.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <NutritionManagement children={children} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Gestion des documents</CardTitle>
                <CardDescription className="text-purple-100 mt-1">
                  Gérez les documents officiels et les rapports de votre centre.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DocumentsManagement
                  orphanageId={orphanage.id}
                  orphanageName={orphanage.name}
                  children={children}
                />
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
