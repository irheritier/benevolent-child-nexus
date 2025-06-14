
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiseaseData {
  name: string;
  count: number;
  severity_breakdown: {
    mild: number;
    moderate: number;
    severe: number;
  };
}

const DiseaseStatsChart = () => {
  const [diseaseData, setDiseaseData] = useState<DiseaseData[]>([]);
  const [severityData, setSeverityData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDiseaseStats();
  }, []);

  const loadDiseaseStats = async () => {
    try {
      // Charger les statistiques des maladies
      const { data: childDiseases, error } = await supabase
        .from('child_diseases')
        .select(`
          severity,
          diseases (
            name
          )
        `);

      if (error) throw error;

      // Organiser les données par maladie
      const diseaseMap = new Map<string, DiseaseData>();
      const severityMap = new Map<string, number>();

      childDiseases?.forEach((record) => {
        const diseaseName = record.diseases?.name || 'Inconnu';
        const severity = record.severity || 'mild';

        // Compter par maladie
        if (!diseaseMap.has(diseaseName)) {
          diseaseMap.set(diseaseName, {
            name: diseaseName,
            count: 0,
            severity_breakdown: { mild: 0, moderate: 0, severe: 0 }
          });
        }

        const diseaseData = diseaseMap.get(diseaseName)!;
        diseaseData.count++;
        if (severity in diseaseData.severity_breakdown) {
          diseaseData.severity_breakdown[severity as keyof typeof diseaseData.severity_breakdown]++;
        }

        // Compter par sévérité
        severityMap.set(severity, (severityMap.get(severity) || 0) + 1);
      });

      // Convertir en tableaux pour les graphiques
      const diseaseArray = Array.from(diseaseMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

      const severityArray = [
        { name: 'Léger', value: severityMap.get('mild') || 0, color: '#10B981' },
        { name: 'Modéré', value: severityMap.get('moderate') || 0, color: '#F59E0B' },
        { name: 'Sévère', value: severityMap.get('severe') || 0, color: '#EF4444' }
      ];

      setDiseaseData(diseaseArray);
      setSeverityData(severityArray);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de maladies:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de maladies.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartConfig = {
    count: {
      label: "Nombre de cas",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en barres des maladies les plus fréquentes */}
      <Card>
        <CardHeader>
          <CardTitle>Maladies les Plus Fréquentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diseaseData}>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Graphique en camembert de la répartition par sévérité */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Sévérité</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {severityData.map((entry, index) => (
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

export default DiseaseStatsChart;
