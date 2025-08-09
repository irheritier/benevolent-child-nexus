
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
import { motion, AnimatePresence, Variants } from 'framer-motion';

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
  province_id: string;
  city_id: string;
  address?: string;
  contact_person: string;
  phone?: string;
  email?: string;
  description?: string;
  child_capacity?: number;
  children_total?: number;
  boys_count?: number;
  girls_count?: number;
  schooling_rate?: number;
  annual_disease_rate?: number;
  meals_per_day?: number;
  legal_status?: 'pending' | 'verified' | 'rejected';
  created_at?: string;
  updated_at?: string;
  documents?: any;
  photo_url?: string;
  location_gps?: any;
  dhis2_orgunit_id?: string;
  created_by?: string;
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

// Variants d'animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="flex items-center space-x-3"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full"
          ></motion.div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium text-slate-700 dark:text-slate-300"
          >
            Chargement de votre espace...
          </motion.span>
        </motion.div>
      </motion.div>
    );
  }

  if (!orphanage) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <Card className="w-full max-w-md text-center shadow-xl border-0">
            <CardContent className="pt-6">
              <div className="text-slate-600 dark:text-slate-400 mb-4">
                Aucun centre d'accueil associé à ce compte.
              </div>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Button onClick={handleLogout} variant="outline">
                  Se déconnecter
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardHeader user={user} orphanage={orphanage} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Statistiques rapides */}
        <div className="mb-6 sm:mb-8">
          <StatsCards children={children} orphanage={orphanage} />
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border shadow-lg rounded-xl p-1 h-12 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="overview" className="rounded-lg font-semibold text-xs sm:text-sm">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="children" className="rounded-lg font-semibold text-xs sm:text-sm">Enfants</TabsTrigger>
              <TabsTrigger value="health" className="rounded-lg font-semibold text-xs sm:text-sm">Santé</TabsTrigger>
              <TabsTrigger value="nutrition" className="rounded-lg font-semibold text-xs sm:text-sm">Nutrition</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg font-semibold text-xs sm:text-sm">Documents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
            >
              {/* Informations du centre */}
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-4 sm:p-6">
                    <motion.div variants={fadeIn}>
                      <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center"
                        >
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        <span className="text-sm sm:text-base">Informations du centre</span>
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <motion.div variants={fadeIn}>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nom du centre</label>
                        <p className="font-bold md:text-lg sm:text-xl text-slate-800 dark:text-slate-200 break-words">{orphanage.name}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Province</label>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{orphanage.province}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Ville</label>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{orphanage.city}</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Personne de contact</label>
                        <p className="font-medium text-slate-800 dark:text-slate-200 break-words">{orphanage.contact_person}</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 break-all text-sm sm:text-base">{orphanage.phone || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 break-all text-sm sm:text-base">{orphanage.email}</span>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions rapides */}
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-4 sm:p-6">
                    <motion.div variants={fadeIn}>
                      <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center"
                        >
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        <span className="text-sm sm:text-base">Actions rapides</span>
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <motion.div variants={fadeIn} className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      {children.length === 0 
                        ? "Commencez par enregistrer votre premier enfant dans le système."
                        : `Vous gérez actuellement ${children.length} enfant(s) dans votre centre.`
                      }
                    </motion.div>
                    
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg text-sm sm:text-base"
                          onClick={() => setShowAddChild(true)}
                        >
                          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Ajouter un enfant
                        </Button>
                      </motion.div>
                      
                      <motion.div 
                        variants={containerVariants}
                        className="grid grid-cols-2 gap-3"
                      >
                        {[
                          { icon: Heart, color: 'blue', text: 'Suivi médical', subtext: 'Onglet Santé' },
                          { icon: FileText, color: 'green', text: 'Documents', subtext: 'Onglet Documents' }
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            variants={cardVariants}
                            whileHover={{ y: -5 }}
                            className={`text-center p-3 sm:p-4 bg-${item.color}-50 dark:bg-${item.color}-950/20 rounded-lg border border-${item.color}-200 dark:border-${item.color}-800`}
                          >
                            <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-600 dark:text-${item.color}-400 mx-auto mb-2`} />
                            <p className={`text-xs sm:text-sm font-medium text-${item.color}-800 dark:text-${item.color}-300`}>{item.text}</p>
                            <p className={`text-xs text-${item.color}-600 dark:text-${item.color}-400`}>{item.subtext}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="children" className="space-y-4 sm:space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.005 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CardTitle className="text-lg sm:text-xl font-bold">Gestion des enfants</CardTitle>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CardDescription className="text-blue-100 mt-1 text-sm sm:text-base">
                            Enregistrez et gérez les enfants hébergés dans votre centre.
                          </CardDescription>
                        </motion.div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={() => setShowAddChild(true)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm sm:text-base"
                          variant="outline"
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Ajouter un enfant
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                      transition={{ delay: 0.3 }}
                      className="overflow-x-auto"
                    >
                      <ChildrenTable
                        children={children}
                        onEdit={handleEditChild}
                        onDelete={handleDeleteChild}
                        onViewDetails={handleViewChildDetails}
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4 sm:space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.005 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CardTitle className="md:text-lg sm:text-xl font-bold">Suivi médical et nutritionnel</CardTitle>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CardDescription className="text-red-100 mt-1 text-sm sm:text-base">
                          Gérez les données de santé et de nutrition des enfants de votre centre.
                        </CardDescription>
                      </motion.div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                      transition={{ delay: 0.3 }}
                    >
                      <HealthManagement children={children} />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4 sm:space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.005 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CardTitle className="md:text-lg sm:text-xl font-bold">Suivi nutritionnel</CardTitle>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CardDescription className="text-green-100 mt-1 text-sm sm:text-base">
                          Gérez les données de poids, taille et statut nutritionnel des enfants.
                        </CardDescription>
                      </motion.div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                      transition={{ delay: 0.3 }}
                    >
                      <NutritionManagement children={children} />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 sm:space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.005 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CardTitle className="text-lg sm:text-xl font-bold">Gestion des documents</CardTitle>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CardDescription className="text-purple-100 mt-1 text-sm sm:text-base">
                          Gérez les documents officiels et les rapports de votre centre.
                        </CardDescription>
                      </motion.div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <motion.div
                      variants={fadeIn}
                      transition={{ delay: 0.3 }}
                    >
                      <DocumentsManagement
                        orphanageId={orphanage.id}
                        orphanageName={orphanage.name}
                        children={children}
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Dialog pour ajouter un enfant */}
      <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
        <DialogContent className="max-h-[80vh] overflow-y-auto  ">
          {/*<DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Ajouter un nouvel enfant</DialogTitle>
          </DialogHeader> */}
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
            <DialogTitle className="text-lg sm:text-xl">Modifier l'enfant</DialogTitle>
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
