
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';
import DashboardAnalyticsTabs from '@/components/admin/DashboardAnalyticsTabs';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface OrphanageRegistration {
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
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  description: string;
  rejection_reason: string;
  reviewed_at: string;
  reviewed_by: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const [orphanages, setOrphanages] = useState<OrphanageRegistration[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);

  // Animation variants
  const containerVariants = {
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

  // Fetch orphanages
  const { data: orphanagesData, isLoading: orphanagesLoading } = useQuery({
    queryKey: ['admin-orphanages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orphanages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch partner requests
  const { data: partnerRequestsData, isLoading: partnerRequestsLoading } = useQuery({
    queryKey: ['admin-partner-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  React.useEffect(() => {
    if (orphanagesData) {
      const mappedOrphanages: OrphanageRegistration[] = orphanagesData.map(org => ({
        id: org.id,
        name: org.name,
        contact_person: org.contact_person,
        email: org.email || '',
        phone: org.phone || '',
        city: org.city,
        province: org.province,
        legal_status: org.legal_status || 'pending',
        created_at: org.created_at || ''
      }));
      setOrphanages(mappedOrphanages);
    }
  }, [orphanagesData]);

  React.useEffect(() => {
    if (partnerRequestsData) {
      const mappedPartnerRequests: PartnerRequest[] = partnerRequestsData.map(req => ({
        id: req.id,
        organization_name: req.organization_name,
        contact_person: req.contact_person,
        email: req.email,
        phone: req.phone || '',
        organization_type: req.organization_type,
        purpose: req.purpose,
        status: (req.status === 'pending' || req.status === 'approved' || req.status === 'rejected') ? req.status : 'pending',
        created_at: req.created_at,
        description: req.description || '',
        rejection_reason: req.rejection_reason || '',
        reviewed_at: req.reviewed_at || '',
        reviewed_by: req.reviewed_by || '',
        updated_at: req.updated_at
      }));
      setPartnerRequests(mappedPartnerRequests);
    }
  }, [partnerRequestsData]);

  // Calculate stats
  const orphanageStats = {
    pending: orphanages.filter(o => o.legal_status === 'pending').length,
    verified: orphanages.filter(o => o.legal_status === 'verified').length,
    rejected: orphanages.filter(o => o.legal_status === 'rejected').length
  };

  const partnerStats = {
    pending: partnerRequests.filter(p => p.status === 'pending').length,
    approved: partnerRequests.filter(p => p.status === 'approved').length,
    rejected: partnerRequests.filter(p => p.status === 'rejected').length
  };

  const StatCard = ({ 
    title, 
    count, 
    icon: Icon, 
    variant = 'default' 
  }: { 
    title: string; 
    count: number; 
    icon: any; 
    variant?: 'default' | 'success' | 'warning' | 'destructive';
  }) => {
    const variants = {
      default: 'border-gray-200 bg-white',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      destructive: 'border-red-200 bg-red-50'
    };

    const iconColors = {
      default: 'text-gray-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      destructive: 'text-red-600'
    };

    return (
      <motion.div variants={cardVariants}>
        <Card className={`${variants[variant]} transition-colors hover:shadow-md`}>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full bg-white ${iconColors[variant]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600">{title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Tabs defaultValue="registrations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="registrations">Demandes d'inscription</TabsTrigger>
              <TabsTrigger value="partners">Partenaires</TabsTrigger>
              <TabsTrigger value="analytics">Analyses et statistiques</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="registrations" className="space-y-6">
                <motion.div
                  key="registrations"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Gestion des inscriptions d'orphelinats</CardTitle>
                        <CardDescription>
                          Gérez les demandes d'inscription des orphelinats
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>

                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                  >
                    <StatCard
                      title="En attente"
                      count={orphanageStats.pending}
                      icon={Clock}
                      variant="warning"
                    />
                    <StatCard
                      title="Validés"
                      count={orphanageStats.verified}
                      icon={CheckCircle}
                      variant="success"
                    />
                    <StatCard
                      title="Rejetés"
                      count={orphanageStats.rejected}
                      icon={XCircle}
                      variant="destructive"
                    />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="partners" className="space-y-6">
                <motion.div
                  key="partners"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Gestion des partenaires</CardTitle>
                        <CardDescription>
                          Gérez les demandes d'accès des partenaires de recherche
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>

                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                  >
                    <StatCard
                      title="En attente"
                      count={partnerStats.pending}
                      icon={Clock}
                      variant="warning"
                    />
                    <StatCard
                      title="Approuvés"
                      count={partnerStats.approved}
                      icon={UserCheck}
                      variant="success"
                    />
                    <StatCard
                      title="Rejetés"
                      count={partnerStats.rejected}
                      icon={UserX}
                      variant="destructive"
                    />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <motion.div
                  key="analytics"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <DashboardAnalyticsTabs />
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <motion.div
                  key="notifications"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <NotificationCenter />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
