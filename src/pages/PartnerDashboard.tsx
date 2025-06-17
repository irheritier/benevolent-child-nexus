
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, LogOut, Bell, BarChart, Users, TrendingUp, MapPin, Activity, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Chargement du tableau de bord</h3>
            <p className="text-slate-600 dark:text-slate-400">Accès aux données partenaires en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header moderne */}
      <header className="border-b bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/70 sticky top-0 z-50 shadow-lg border-primary/10 dark:border-slate-700/50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div 
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                FCS : Find Children to Save
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">
                Portail Partenaire
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="hidden md:flex bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-2 rounded-xl font-medium">
              <Users className="w-4 h-4 mr-2" />
              {userEmail}
            </Badge>
            <ThemeToggle />
            <NotificationBell />
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center gap-2 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700 font-semibold px-6 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Section d'en-tête avec animations */}
        <div className="mb-12 text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-fade-in">
              Tableau de bord partenaire
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Accédez aux statistiques complètes, analyses détaillées et notifications en temps réel 
              concernant les orphelinats et centres d'accueil de la République Démocratique du Congo.
            </p>
          </div>
          
          {/* Indicateurs visuels */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Données en temps réel</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Accès sécurisé</span>
            </div>
          </div>
        </div>

        {/* Onglets avec design amélioré */}
        <Tabs defaultValue="analytics" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-2 shadow-lg">
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-3 h-12 rounded-xl font-semibold text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <BarChart className="w-5 h-5" />
              Analyses et statistiques
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="flex items-center gap-3 h-12 rounded-xl font-semibold text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Activity className="w-5 h-5" />
              Santé
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-3 h-12 rounded-xl font-semibold text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Bell className="w-5 h-5" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-8 animate-fade-in">
            {/* Cartes de statistiques détaillées */}
            {stats && (
              <div className="mb-8">
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
              </div>
            )}
            
            {/* Onglets d'analyse détaillés */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <TrendingUp className="w-7 h-7" />
                  Analyses avancées et tendances
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <DashboardAnalyticsTabs />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-8 animate-fade-in">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="w-7 h-7" />
                  Surveillance sanitaire
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <HealthDashboard />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="animate-fade-in">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Bell className="w-7 h-7" />
                  Centre de notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <NotificationCenter />
              </CardContent>
            </Card>
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
