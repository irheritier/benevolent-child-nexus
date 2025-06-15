
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, LogOut, Bell, BarChart, Users, TrendingUp, MapPin, Activity } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationProvider } from '@/contexts/NotificationContext';
import DashboardAnalyticsTabs from '@/components/admin/DashboardAnalyticsTabs';
import DashboardStatsCards from '@/components/admin/DashboardStatsCards';
import HealthDashboard from '@/components/admin/HealthDashboard';

interface DashboardStats {
  totalOrphanages: number;
  totalChildren: number;
  totalProvinces: number;
  verifiedOrphanages: number;
  pendingOrphanages: number;
  wellNourishedChildren: number;
  malnourishedChildren: number;
}

const PartnerDashboardContent = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
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
        navigate('/partner/auth');
        return;
      }
      // Vérifier le rôle
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'partner') {
        navigate('/partner/auth');
        return;
      }

      setUserEmail(session.user.email || '');

      // Charger les statistiques publiques
      const { data: publicStats } = await supabase
        .from('public_stats')
        .select('*')
        .single();

      if (publicStats) {
        setStats({
          totalOrphanages: publicStats.total_orphanages || 0,
          totalChildren: publicStats.total_children || 0,
          totalProvinces: publicStats.total_provinces || 0,
          verifiedOrphanages: publicStats.verified_orphanages || 0,
          pendingOrphanages: (publicStats.total_orphanages || 0) - (publicStats.verified_orphanages || 0),
          wellNourishedChildren: publicStats.well_nourished_children || 0,
          malnourishedChildren: publicStats.malnourished_children || 0,
        });
      }
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
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
              <p className="text-xs text-muted-foreground">Partenaires</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-600">{userEmail}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Tableau de bord partenaire</h2>
          <p className="text-muted-foreground">
            Accédez aux statistiques, analyses et notifications liées aux orphelinats de la RDC.
          </p>
        </div>

        {/* Onglets : Analytics, Santé et Notifications */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Analyses et statistiques
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Santé
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            {/* Cartes de statistiques détaillées - similaires à celles de l'admin */}
            {stats && (
              <DashboardStatsCards 
                stats={{
                  totalOrphanages: stats.totalOrphanages,
                  totalChildren: stats.totalChildren,
                  pendingOrphanages: stats.pendingOrphanages,
                  verifiedOrphanages: stats.verifiedOrphanages,
                  wellNourishedChildren: stats.wellNourishedChildren,
                  malnourishedChildren: stats.malnourishedChildren,
                  totalProvinces: stats.totalProvinces,
                }}
                isLoading={isLoading}
              />
            )}
            <DashboardAnalyticsTabs />
          </TabsContent>
          
          <TabsContent value="health" className="space-y-6">
            <HealthDashboard />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const PartnerDashboard = () => {
  return (
    <NotificationProvider>
      <PartnerDashboardContent />
    </NotificationProvider>
  );
};

export default PartnerDashboard;
