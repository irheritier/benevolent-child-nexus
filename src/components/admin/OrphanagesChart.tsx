
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrphanageData {
  month: string;
  pending: number;
  verified: number;
  rejected: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

const OrphanagesChart = () => {
  const [monthlyData, setMonthlyData] = useState<OrphanageData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrphanageData();
  }, []);

  const fetchOrphanageData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les données des orphelinats
      const { data: orphanages, error } = await supabase
        .from('orphanages')
        .select('legal_status, created_at');

      if (error) throw error;

      // Traiter les données pour le graphique mensuel
      const monthlyStats: { [key: string]: OrphanageData } = {};
      const statusCounts = { pending: 0, verified: 0, rejected: 0 };

      orphanages?.forEach(orphanage => {
        const date = new Date(orphanage.created_at);
        const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            pending: 0,
            verified: 0,
            rejected: 0
          };
        }

        monthlyStats[monthKey][orphanage.legal_status as keyof typeof statusCounts]++;
        statusCounts[orphanage.legal_status as keyof typeof statusCounts]++;
      });

      // Convertir en tableau et trier par date
      const monthlyArray = Object.values(monthlyStats).sort((a, b) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );

      setMonthlyData(monthlyArray);

      // Données pour le graphique en secteurs
      setStatusData([
        { name: 'En attente', value: statusCounts.pending, color: COLORS[0] },
        { name: 'Validés', value: statusCounts.verified, color: COLORS[1] },
        { name: 'Rejetés', value: statusCounts.rejected, color: COLORS[2] }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données des orphelinats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des orphelinats.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    pending: {
      label: "En attente",
      color: "#f59e0b",
    },
    verified: {
      label: "Validés", 
      color: "#10b981",
    },
    rejected: {
      label: "Rejetés",
      color: "#ef4444",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en barres - Évolution mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution mensuelle des inscriptions</CardTitle>
          <CardDescription>
            Nombre d'orphelinats par statut et par mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="verified" stackId="a" fill={chartConfig.verified.color} />
                <Bar dataKey="pending" stackId="a" fill={chartConfig.pending.color} />
                <Bar dataKey="rejected" stackId="a" fill={chartConfig.rejected.color} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Graphique en secteurs - Répartition des statuts */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
          <CardDescription>
            Distribution des orphelinats selon leur statut de validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrphanagesChart;
