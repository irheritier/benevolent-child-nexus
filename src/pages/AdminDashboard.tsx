
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eye, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, FileText, Download, BarChart, Bell, Users, Building2, Heart } from 'lucide-react';
import AdminStatsDashboard from '@/components/admin/AdminStatsDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useNotificationAlerts } from '@/hooks/useNotificationAlerts';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';
import { ThemeProvider } from '@/components/ThemeProvider';
import { motion, Variants } from 'framer-motion';


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

interface PartnerRequest {
  id: string;
  organization_name: string;
  organization_type: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  purpose: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

const AdminDashboardContent = () => {
  const [orphanages, setOrphanages] = useState<Orphanage[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [selectedOrphanage, setSelectedOrphanage] = useState<Orphanage | null>(null);
  const [selectedPartnerRequest, setSelectedPartnerRequest] = useState<PartnerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Utiliser le hook pour les alertes automatiques
  useNotificationAlerts();

  useEffect(() => {
    checkAuth();
    fetchOrphanages();
    fetchPartnerRequests();
  }, []);

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

  const tableRowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100
      }
    })
  };

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

  const fetchPartnerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes partenaires.",
          variant: "destructive",
        });
        return;
      }

      setPartnerRequests(data || []);
    } catch (error) {
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors du chargement des demandes partenaires.",
        variant: "destructive",
      });
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

  const handleApprovePartnerRequest = async () => {
    if (!selectedPartnerRequest || !partnerPassword.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un mot de passe pour le compte partenaire.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      // Créer le compte utilisateur
      const { data: newUser, error: createError } = await supabase.rpc('create_user_account', {
        user_email: selectedPartnerRequest.email,
        user_password: partnerPassword,
        user_role: 'partner'
      });

      if (createError) throw createError;

      // Mettre à jour le statut de la demande
      const { error: updateError } = await supabase
        .from('partner_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id
        })
        .eq('id', selectedPartnerRequest.id);

      if (updateError) throw updateError;

      toast({
        title: "Demande approuvée",
        description: `Le compte partenaire a été créé pour ${selectedPartnerRequest.email}. Mot de passe: ${partnerPassword}`,
      });

      fetchPartnerRequests();
      setShowPartnerDialog(false);
      setSelectedPartnerRequest(null);
      setPartnerPassword('');
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRejectPartnerRequest = async () => {
    if (!selectedPartnerRequest || !rejectionReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une raison de rejet.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const { error } = await supabase
        .from('partner_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id,
          rejection_reason: rejectionReason
        })
        .eq('id', selectedPartnerRequest.id);

      if (error) throw error;

      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée avec succès.",
      });

      fetchPartnerRequests();
      setShowPartnerDialog(false);
      setSelectedPartnerRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande.",
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
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrganizationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'ong': 'ONG',
      'universite': 'Université',
      'institut_recherche': 'Institut de recherche',
      'organisme_gouvernemental': 'Organisme gouvernemental',
      'organisation_internationale': 'Organisation internationale',
      'autre': 'Autre'
    };
    return types[type] || type;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <AdminDashboardHeader />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">

        {/* Onglets principaux */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <TabsTrigger 
              value="requests" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Heart className="w-4 h-4" />
              Demandes d'inscription
            </TabsTrigger>
            <TabsTrigger 
              value="partners" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Users className="w-4 h-4" />
              Partenaires
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <BarChart className="w-4 h-4" />
              Analyses et statistiques
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Onglet des demandes d'inscription */}
          <TabsContent value="requests" className="space-y-6">
            {/* Statistics Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                      <motion.div whileHover={{ rotate: 15 }}>
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      En attente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-3xl font-bold text-yellow-600 dark:text-yellow-400"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      {orphanages.filter(o => o.legal_status === 'pending').length}
                    </motion.div>
                    <motion.p 
                      className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Demandes à traiter
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                      <motion.div whileHover={{ rotate: 15 }}>
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                      Validés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-3xl font-bold text-green-600 dark:text-green-400"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                    >
                      {orphanages.filter(o => o.legal_status === 'verified').length}
                    </motion.div>
                    <motion.p 
                      className="text-xs text-green-600/70 dark:text-green-400/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Centres approuvés
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200/50 dark:border-red-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                      <motion.div whileHover={{ rotate: 15 }}>
                        <XCircle className="w-4 h-4" />
                      </motion.div>
                      Rejetés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-3xl font-bold text-red-600 dark:text-red-400"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                    >
                      {orphanages.filter(o => o.legal_status === 'rejected').length}
                    </motion.div>
                    <motion.p 
                      className="text-xs text-red-600/70 dark:text-red-400/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Demandes refusées
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Orphanages Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20">
                    <CardTitle className="text-slate-800 dark:text-slate-100">Liste des demandes</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Cliquez sur une demande pour voir les détails et procéder à la validation.
                    </CardDescription>
                  </CardHeader>
                </motion.div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nom du centre</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Province</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Contact</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Statut</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orphanages.map((orphanage, i) => (
                        <motion.tr 
                          key={orphanage.id} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          variants={tableRowVariants}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ scale: 1.01 }}
                        >
                          <TableCell className="font-medium text-slate-800 dark:text-slate-200">{orphanage.name}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{orphanage.province}, {orphanage.city}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{orphanage.contact_person}</TableCell>
                          <TableCell>{getStatusBadge(orphanage.legal_status)}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{new Date(orphanage.created_at).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrphanage(orphanage);
                                  setShowDialog(true);
                                }}
                                className="flex items-center gap-1 border-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="w-3 h-3" />
                                Voir
                              </Button>
                            </motion.div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Onglet des partenaires */}
          
          <TabsContent value="partners" className="space-y-6">
            {/* Statistics Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {/* Pending Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
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
                }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                      <motion.div whileHover={{ rotate: 15 }}>
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      En attente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-3xl font-bold text-yellow-600 dark:text-yellow-400"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      {partnerRequests.filter(p => p.status === 'pending').length}
                    </motion.div>
                    <motion.p 
                      className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Demandes à traiter
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Approved Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: 0.1
                    }
                  }
                }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                      <motion.div whileHover={{ rotate: 15 }}>
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                      Approuvés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-3xl font-bold text-green-600 dark:text-green-400"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                    >
                      {partnerRequests.filter(p => p.status === 'approved').length}
                    </motion.div>
                    <motion.p 
                      className="text-xs text-green-600/70 dark:text-green-400/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Partenaires actifs
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Rejected Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: 0.2
                    }
                  }
                }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200/50 dark:border-red-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                      <motion.div whileHover={{ rotate: 15 }}>
                        <XCircle className="w-4 h-4" />
                      </motion.div>
                      Rejetés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-3xl font-bold text-red-600 dark:text-red-400"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                    >
                      {partnerRequests.filter(p => p.status === 'rejected').length}
                    </motion.div>
                    <motion.p 
                      className="text-xs text-red-600/70 dark:text-red-400/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Demandes refusées
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Partners Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-600/20 dark:to-pink-600/20">
                    <CardTitle className="text-slate-800 dark:text-slate-100">Liste des demandes partenaires</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Cliquez sur une demande pour voir les détails et procéder à la validation.
                    </CardDescription>
                  </CardHeader>
                </motion.div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Organisation</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Contact</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Statut</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partnerRequests.map((request, i) => (
                        <motion.tr 
                          key={request.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          custom={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.05,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <TableCell className="font-medium text-slate-800 dark:text-slate-200">{request.organization_name}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{getOrganizationTypeLabel(request.organization_type)}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{request.contact_person}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPartnerRequest(request);
                                  setShowPartnerDialog(true);
                                }}
                                className="flex items-center gap-1 border-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
                              >
                                <Eye className="w-3 h-3" />
                                Voir
                              </Button>
                            </motion.div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
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

      {/* Details Dialog for Orphanages */}
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

      {/* Details Dialog for Partner Requests */}
      <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedPartnerRequest?.organization_name}
            </DialogTitle>
            <DialogDescription>
              Détails de la demande d'accès partenaire
            </DialogDescription>
          </DialogHeader>

          {selectedPartnerRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Type d'organisation</h4>
                  <p className="text-sm text-muted-foreground">
                    {getOrganizationTypeLabel(selectedPartnerRequest.organization_type)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Objectif</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPartnerRequest.purpose}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPartnerRequest.contact_person}
                </p>
                <p className="text-sm text-muted-foreground">{selectedPartnerRequest.email}</p>
                {selectedPartnerRequest.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {selectedPartnerRequest.phone}
                  </p>
                )}
              </div>

              {selectedPartnerRequest.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Description du projet</h4>
                  <p className="text-sm text-muted-foreground">{selectedPartnerRequest.description}</p>
                </div>
              )}

              {selectedPartnerRequest.status === 'rejected' && selectedPartnerRequest.rejection_reason && (
                <div className="space-y-2">
                  <h4 className="font-medium">Raison du rejet</h4>
                  <p className="text-sm text-red-600">{selectedPartnerRequest.rejection_reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Statut actuel</h4>
                {getStatusBadge(selectedPartnerRequest.status)}
              </div>

              {selectedPartnerRequest.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner-password">Mot de passe pour le compte partenaire</Label>
                    <Input
                      id="partner-password"
                      type="password"
                      value={partnerPassword}
                      onChange={(e) => setPartnerPassword(e.target.value)}
                      placeholder="Saisissez un mot de passe sécurisé"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Raison de rejet (optionnel)</Label>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi cette demande est rejetée..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedPartnerRequest?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleRejectPartnerRequest}
                  disabled={isValidating}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </Button>
                <Button
                  onClick={handleApprovePartnerRequest}
                  disabled={isValidating}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isValidating ? "Approbation..." : "Approuver"}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowPartnerDialog(false)}>
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <NotificationProvider>
        <AdminDashboardContent />
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default AdminDashboard;
