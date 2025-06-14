
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NutritionStatusData {
  status: string;
  count: number;
  color: string;
}

interface NutritionTrendData {
  month: string;
  normal: number;
  underweight: number;
  overweight: number;
  malnourished: number;
}

const NUTRITION_COLORS = {
  normal: '#10b981',
  underweight: '#f59e0b',
  overweight: '#3b82f6',
  malnourished: '#ef4444'
};

const NutritionChart = () => {
  const [statusData, setStatusData] = useState<NutritionStatusData[]>([]);
  const [trendData, setTrendData] = useState<NutritionTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les données nutritionnelles
      const { data: nutritionRecords, error } = await supabase
        .from('nutrition_records')
        .select('nutrition_status, date, created_at');

      if (error) throw error;

      // Traiter les données par statut nutritionnel
      const statusCounts: { [key: string]: number } = {
        normal: 0,
        underweight: 0,
        overweight: 0,
        malnourished: 0
      };

      nutritionRecords?.forEach(record => {
        statusCounts[record.nutrition_status] = (statusCounts[record.nutrition_status] || 0) + 1;
      });

      setStatusData([
        { status: 'Normal', count: statusCounts.normal, color: NUTRITION_COLORS.normal },
        { status: 'Insuffisance pondérale', count: statusCounts.underweight, color: NUTRITION_COLORS.underweight },
        { status: 'Surpoids', count: statusCounts.overweight, color: NUTRITION_COLORS.overweight },
        { status: 'Malnutrition', count: statusCounts.malnourished, color: NUTRITION_COLORS.malnourished }
      ]);

      // Traiter les données de tendance mensuelle
      const monthlyStats: { [key: string]: NutritionTrendData } = {};

      nutritionRecords?.forEach(record => {
        const date = new Date(record.date || record.created_at);
        const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            normal: 0,
            underweight: 0,
            overweight: 0,
            malnourished: 0
          };
        }

        monthlyStats[monthKey][record.nutrition_status as keyof Omit<NutritionTrendData, 'month'>]++;
      });

      // Convertir en tableau et trier par date
      const trendArray = Object.values(monthlyStats).sort((a, b) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );

      setTrendData(trendArray);

    } catch (error) {
      console.error('Erreur lors du chargement des données nutritionnelles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données nutritionnelles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    normal: {
      label: "Normal",
      color: NUTRITION_COLORS.normal,
    },
    underweight: {
      label: "Insuffisance pondérale",
      color: NUTRITION_COLORS.underweight,
    },
    overweight: {
      label: "Surpoids",
      color: NUTRITION_COLORS.overweight,
    },
    malnourished: {
      label: "Malnutrition",
      color: NUTRITION_COLORS.malnourished,
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des statuts nutritionnels */}
        <Card>
          <CardHeader>
            <CardTitle>Statuts nutritionnels</CardTitle>
            <CardDescription>
              Répartition des enfants par statut nutritionnel
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
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
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

        {/* Comparaison par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Comparaison nutritionnelle</CardTitle>
            <CardDescription>
              Nombre d'enfants par catégorie nutritionnelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={(entry) => entry.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Évolution temporelle */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution nutritionnelle</CardTitle>
          <CardDescription>
            Tendances des statuts nutritionnels par mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="normal" 
                  stroke={chartConfig.normal.color} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="underweight" 
                  stroke={chartConfig.underweight.color} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="malnourished" 
                  stroke={chartConfig.malnourished.color} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionChart;
