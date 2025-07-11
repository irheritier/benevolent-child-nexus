
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Building, CheckCircle, XCircle, Clock, BarChart, Bell } from 'lucide-react';
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface OrphanageRequest {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  legal_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

interface PartnerRequest {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  phone: string;
  organization_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Stats {
  pendingOrphanages: number;
  verifiedOrphanages: number;
  rejectedOrphanages: number;
  pendingPartners: number;
  approvedPartners: number;
  rejectedPartners: number;
}

const AdminDashboardContent = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [orphanageRequests, setOrphanageRequests] = useState<OrphanageRequest[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [stats, setStats] = useState<Stats>({
    pendingOrphanages: 0,
    verifiedOrphanages: 0,
    rejectedOrphanages: 0,
    pendingPartners: 0,
    approvedPartners: 0,
    rejectedPartners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/auth');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'admin') {
        navigate('/admin/auth');
        return;
      }

      setUserEmail(session.user.email || '');
      await loadDashboardData();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load orphanage requests
      const { data: orphanages } = await supabase
        .from('orphanages')
        .select('*')
        .order('created_at', { ascending: false });

      // Load partner requests
      const { data: partners } = await supabase
        .from('partner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      setOrphanageRequests(orphanages || []);
      setPartnerRequests(partners || []);

      // Calculate stats
      const orphanageStats = (orphanages || []).reduce((acc, org) => {
        if (org.legal_status === 'pending') acc.pendingOrphanages++;
        else if (org.legal_status === 'verified') acc.verifiedOrphanages++;
        else if (org.legal_status === 'rejected') acc.rejectedOrphanages++;
        return acc;
      }, { pendingOrphanages: 0, verifiedOrphanages: 0, rejectedOrphanages: 0 });

      const partnerStats = (partners || []).reduce((acc, partner) => {
        if (partner.status === 'pending') acc.pendingPartners++;
        else if (partner.status === 'approved') acc.approvedPartners++;
        else if (partner.status === 'rejected') acc.rejectedPartners++;
        return acc;
      }, { pendingPartners: 0, approvedPartners: 0, rejectedPartners: 0 });

      setStats({ ...orphanageStats, ...partnerStats });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const statsCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <motion.div 
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.h3 
            className="text-xl font-semibold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Chargement du tableau de bord administrateur...
          </motion.h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <AdminDashboardHeader userEmail={userEmail} />

      <main className="container mx-auto px-6 py-8">
        <motion.div variants={cardVariants}>
          <Tabs defaultValue="requests" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-white shadow-sm">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Demandes d'inscription
              </TabsTrigger>
              <TabsTrigger value="partners" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Partenaires
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

            <AnimatePresence mode="wait">
              {/* Orphanage Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Stats Cards for Orphanages */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    variants={pageVariants}
                  >
                    <motion.div variants={statsCardVariants} whileHover={{ scale: 1.02 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">En attente</CardTitle>
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <motion.div 
                            className="text-2xl font-bold text-orange-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            {stats.pendingOrphanages}
                          </motion.div>
                          <p className="text-xs text-muted-foreground">
                            Demandes à examiner
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={statsCardVariants} whileHover={{ scale: 1.02 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Validés</CardTitle>
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <motion.div 
                            className="text-2xl font-bold text-green-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                          >
                            {stats.verifiedOrphanages}
                          </motion.div>
                          <p className="text-xs text-muted-foreground">
                            Orphelinats approuvés
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={statsCardVariants} whileHover={{ scale: 1.02 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <motion.div 
                            className="text-2xl font-bold text-red-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            {stats.rejectedOrphanages}
                          </motion.div>
                          <p className="text-xs text-muted-foreground">
                            Demandes refusées
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>

                  {/* Orphanage Requests List */}
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Demandes d'inscription des orphelinats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="space-y-4"
                          variants={pageVariants}
                        >
                          {orphanageRequests.slice(0, 10).map((request, index) => (
                            <motion.div
                              key={request.id}
                              variants={cardVariants}
                              whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                              className="flex items-center justify-between p-4 border rounded-lg transition-colors"
                            >
                              <div>
                                <h4 className="font-medium">{request.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {request.contact_person} • {request.city}, {request.province}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={request.legal_status === 'pending' ? 'secondary' : 
                                          request.legal_status === 'verified' ? 'default' : 'destructive'}
                                >
                                  {request.legal_status === 'pending' ? 'En attente' :
                                   request.legal_status === 'verified' ? 'Validé' : 'Rejeté'}
                                </Badge>
                                {request.legal_status === 'pending' && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button size="sm">Examiner</Button>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Partners Tab */}
              <TabsContent value="partners" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Stats Cards for Partners */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    variants={pageVariants}
                  >
                    <motion.div variants={statsCardVariants} whileHover={{ scale: 1.02 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">En attente</CardTitle>
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <motion.div 
                            className="text-2xl font-bold text-orange-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            {stats.pendingPartners}
                          </motion.div>
                          <p className="text-xs text-muted-foreground">
                            Demandes de partenariat
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={statsCardVariants} whileHover={{ scale: 1.02 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <motion.div 
                            className="text-2xl font-bold text-green-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                          >
                            {stats.approvedPartners}
                          </motion.div>
                          <p className="text-xs text-muted-foreground">
                            Partenaires actifs
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div variants={statsCardVariants} whileHover={{ scale: 1.02 }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                          <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <UserX className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </CardHeader>
                        <CardContent>
                          <motion.div 
                            className="text-2xl font-bold text-red-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            {stats.rejectedPartners}
                          </motion.div>
                          <p className="text-xs text-muted-foreground">
                            Demandes refusées
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>

                  {/* Partner Requests List */}
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Demandes de partenariat</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="space-y-4"
                          variants={pageVariants}
                        >
                          {partnerRequests.slice(0, 10).map((request, index) => (
                            <motion.div
                              key={request.id}
                              variants={cardVariants}
                              whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                              className="flex items-center justify-between p-4 border rounded-lg transition-colors"
                            >
                              <div>
                                <h4 className="font-medium">{request.organization_name}</h4>
                                <p className="text-sm text-gray-500">
                                  {request.contact_person} • {request.organization_type}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={request.status === 'pending' ? 'secondary' : 
                                          request.status === 'approved' ? 'default' : 'destructive'}
                                >
                                  {request.status === 'pending' ? 'En attente' :
                                   request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                                </Badge>
                                {request.status === 'pending' && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button size="sm">Examiner</Button>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AdminStatsDashboard />
                </motion.div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <NotificationCenter />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>
    </motion.div>
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
