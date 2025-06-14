
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OrphanagesChart from './OrphanagesChart';
import ChildrenChart from './ChildrenChart';
import NutritionChart from './NutritionChart';
import ProvinceStatsChart from './ProvinceStatsChart';
import { TrendingUp, Users, Heart, MapPin } from 'lucide-react';

interface DashboardStats {
  totalOrphanages: number;
  totalChildren: number;
  pendingOrphanages: number;
  verifiedOrphanages: number;
  wellNourishedChildren: number;
  malnourishedChildren: number;
  totalProvinces: number;
}

const AdminStatsDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrphanages: 0,
    totalChildren: 0,
    pendingOrphanages: 0,
    verifiedOrphanages: 0,
    wellNourishedChildren: 0,
    malnourishedChildren: 0,
    totalProvinces: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Récupérer les statistiques générales
      const { data: publicStats } = await supabase
        .from('public_stats')
        .select('*')
        .single();

      // Récupérer les orphelinats en attente
      const { data: orphanages } = await supabase
        .from('orphanages')
        .select('legal_status');

      const pendingCount = orphanages?.filter(o => o.legal_status === 'pending').length || 0;
      const verifiedCount = orphanages?.filter(o => o.legal_status === 'verified').length || 0;

      setStats({
        totalOrphanages: publicStats?.total_orphanages || 0,
        totalChildren: publicStats?.total_children || 0,
        pendingOrphanages: pendingCount,
        verifiedOrphanages: verifiedCount,
        wellNourishedChildren: publicStats?.well_nourished_children || 0,
        malnourishedChildren: publicStats?.malnourished_children || 0,
        totalProvinces: publicStats?.total_provinces || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques du tableau de bord.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orphelinats</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrphanages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedOrphanages} validés, {stats.pendingOrphanages} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enfants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChildren}</div>
            <p className="text-xs text-muted-foreground">
              Enfants hébergés dans le système
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nutrition</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.wellNourishedChildren}</div>
            <p className="text-xs text-muted-foreground">
              Bien nourris / {stats.malnourishedChildren} malnutris
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provinces</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProvinces}</div>
            <p className="text-xs text-muted-foreground">
              Provinces couvertes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <Tabs defaultValue="orphanages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orphanages">Orphelinats</TabsTrigger>
          <TabsTrigger value="children">Enfants</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="provinces">Provinces</TabsTrigger>
        </TabsList>

        <TabsContent value="orphanages" className="space-y-4">
          <OrphanagesChart />
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          <ChildrenChart />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <NutritionChart />
        </TabsContent>

        <TabsContent value="provinces" className="space-y-4">
          <ProvinceStatsChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStatsDashboard;
