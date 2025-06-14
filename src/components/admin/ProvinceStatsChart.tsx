
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProvinceStatsData {
  province: string;
  orphanages_count: number;
  children_count: number;
  well_nourished: number;
  malnourished: number;
}

const ProvinceStatsChart = () => {
  const [provinceData, setProvinceData] = useState<ProvinceStatsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProvinceStats();
  }, []);

  const fetchProvinceStats = async () => {
    setIsLoading(true);
    try {
      // Récupérer les statistiques par province
      const { data: provinceStats, error } = await supabase
        .from('province_stats')
        .select('*')
        .order('children_count', { ascending: false });

      if (error) throw error;

      setProvinceData(provinceStats || []);

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques provinciales:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques par province.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    orphanages_count: {
      label: "Orphelinats",
      color: "#3b82f6",
    },
    children_count: {
      label: "Enfants",
      color: "#10b981",
    },
    well_nourished: {
      label: "Bien nourris",
      color: "#22c55e",
    },
    malnourished: {
      label: "Malnutris",
      color: "#ef4444",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
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
      {/* Orphelinats et enfants par province */}
      <Card>
        <CardHeader>
          <CardTitle>Orphelinats et enfants par province</CardTitle>
          <CardDescription>
            Nombre d'orphelinats et d'enfants hébergés dans chaque province
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={provinceData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="province" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orphanages_count" fill={chartConfig.orphanages_count.color} />
                <Bar dataKey="children_count" fill={chartConfig.children_count.color} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Statuts nutritionnels par province */}
      <Card>
        <CardHeader>
          <CardTitle>Statuts nutritionnels par province</CardTitle>
          <CardDescription>
            Comparaison des enfants bien nourris vs malnutris par province
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={provinceData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="province" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="well_nourished" fill={chartConfig.well_nourished.color} />
                <Bar dataKey="malnourished" fill={chartConfig.malnourished.color} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tableau récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif par province</CardTitle>
          <CardDescription>
            Données détaillées pour chaque province
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Province</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Orphelinats</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Enfants</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Bien nourris</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Malnutris</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Taux malnutrition</th>
                </tr>
              </thead>
              <tbody>
                {provinceData.map((province, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{province.province}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{province.orphanages_count}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{province.children_count}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-green-600">{province.well_nourished}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-red-600">{province.malnourished}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {province.children_count > 0 
                        ? `${((province.malnourished / province.children_count) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvinceStatsChart;
