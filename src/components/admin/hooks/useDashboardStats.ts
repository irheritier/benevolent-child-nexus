
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalOrphanages: number;
  totalChildren: number;
  pendingOrphanages: number;
  verifiedOrphanages: number;
  wellNourishedChildren: number;
  malnourishedChildren: number;
  totalProvinces: number;
}

export const useDashboardStats = () => {
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return { stats, isLoading, refetch: fetchDashboardStats };
};
