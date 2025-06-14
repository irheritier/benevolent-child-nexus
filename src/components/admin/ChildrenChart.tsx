
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChildrenGenderData {
  gender: string;
  count: number;
}

interface ChildrenAgeData {
  ageGroup: string;
  count: number;
}

interface ChildrenTimeData {
  month: string;
  newChildren: number;
  totalChildren: number;
}

const ChildrenChart = () => {
  const [genderData, setGenderData] = useState<ChildrenGenderData[]>([]);
  const [ageData, setAgeData] = useState<ChildrenAgeData[]>([]);
  const [timeData, setTimeData] = useState<ChildrenTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les données des enfants
      const { data: children, error } = await supabase
        .from('children')
        .select('gender, birth_date, estimated_age, entry_date, created_at');

      if (error) throw error;

      // Traiter les données par genre
      const genderCounts: { [key: string]: number } = {};
      children?.forEach(child => {
        genderCounts[child.gender] = (genderCounts[child.gender] || 0) + 1;
      });

      setGenderData(
        Object.entries(genderCounts).map(([gender, count]) => ({
          gender: gender === 'male' ? 'Garçons' : 'Filles',
          count
        }))
      );

      // Traiter les données par âge
      const ageCounts: { [key: string]: number } = {
        '0-2 ans': 0,
        '3-5 ans': 0,
        '6-10 ans': 0,
        '11-15 ans': 0,
        '16+ ans': 0
      };

      children?.forEach(child => {
        let age = 0;
        if (child.birth_date) {
          const birthDate = new Date(child.birth_date);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
        } else if (child.estimated_age) {
          age = child.estimated_age;
        }

        if (age <= 2) ageCounts['0-2 ans']++;
        else if (age <= 5) ageCounts['3-5 ans']++;
        else if (age <= 10) ageCounts['6-10 ans']++;
        else if (age <= 15) ageCounts['11-15 ans']++;
        else ageCounts['16+ ans']++;
      });

      setAgeData(
        Object.entries(ageCounts).map(([ageGroup, count]) => ({
          ageGroup,
          count
        }))
      );

      // Traiter les données temporelles
      const monthlyStats: { [key: string]: { newChildren: number; totalChildren: number } } = {};
      let totalRunning = 0;

      children?.sort((a, b) => new Date(a.entry_date || a.created_at).getTime() - new Date(b.entry_date || a.created_at).getTime())
        .forEach(child => {
          const date = new Date(child.entry_date || child.created_at);
          const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { newChildren: 0, totalChildren: 0 };
          }

          monthlyStats[monthKey].newChildren++;
          totalRunning++;
          monthlyStats[monthKey].totalChildren = totalRunning;
        });

      setTimeData(
        Object.entries(monthlyStats).map(([month, data]) => ({
          month,
          newChildren: data.newChildren,
          totalChildren: data.totalChildren
        }))
      );

    } catch (error) {
      console.error('Erreur lors du chargement des données des enfants:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des enfants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    count: {
      label: "Nombre",
      color: "#3b82f6",
    },
    newChildren: {
      label: "Nouveaux enfants",
      color: "#10b981",
    },
    totalChildren: {
      label: "Total enfants",
      color: "#f59e0b",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
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
        {/* Répartition par genre */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par genre</CardTitle>
            <CardDescription>
              Distribution des enfants par genre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gender" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={chartConfig.count.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Répartition par âge */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par âge</CardTitle>
            <CardDescription>
              Distribution des enfants par groupe d'âge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={chartConfig.count.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Évolution temporelle */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du nombre d'enfants</CardTitle>
          <CardDescription>
            Nouveaux enregistrements et total cumulé par mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="newChildren" 
                  stroke={chartConfig.newChildren.color} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalChildren" 
                  stroke={chartConfig.totalChildren.color} 
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

export default ChildrenChart;
