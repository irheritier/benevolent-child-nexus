import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VaccinationStatusData {
  status: string;
  count: number;
  color: string;
}

interface OrphanageVaccinationData {
  orphanage_name: string;
  vaccinated: number;
  not_vaccinated: number;
  partially_vaccinated: number;
  unknown: number;
}

const VaccinationStatsChart = () => {
  const [statusData, setStatusData] = useState<VaccinationStatusData[]>([]);
  const [orphanageData, setOrphanageData] = useState<OrphanageVaccinationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVaccinationStats();
  }, []);

  const loadVaccinationStats = async () => {
    try {
      console.log('Chargement des statistiques de vaccination...');
      
      // Charger tous les orphelinats d'abord
      const { data: orphanages, error: orphanagesError } = await supabase
        .from('orphanages')
        .select('id, name');

      if (orphanagesError) {
        console.error('Erreur lors du chargement des orphelinats:', orphanagesError);
        throw orphanagesError;
      }

      console.log('Orphelinats trouvés:', orphanages);

      // Charger les enfants avec leur orphelinat
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id, orphanage_id');

      if (childrenError) {
        console.error('Erreur lors du chargement des enfants:', childrenError);
        throw childrenError;
      }

      console.log('Enfants trouvés:', children);

      // Charger toutes les données de vaccination
      const { data: healthRecords, error } = await supabase
        .from('health_records')
        .select('vaccination_status_structured, child_id');

      if (error) {
        console.error('Erreur lors du chargement des vaccinations:', error);
        throw error;
      }

      console.log('Données de vaccination trouvées:', healthRecords);

      if (!healthRecords || healthRecords.length === 0) {
        console.log('Aucune donnée de vaccination trouvée');
        setStatusData([
          { status: 'Vacciné', count: 0, color: '#10B981' },
          { status: 'Partiellement vacciné', count: 0, color: '#F59E0B' },
          { status: 'Non vacciné', count: 0, color: '#EF4444' },
          { status: 'Statut inconnu', count: 0, color: '#6B7280' }
        ]);
        setOrphanageData([]);
        setIsLoading(false);
        return;
      }

      // Créer des maps pour les relations
      const orphanageMap = new Map();
      orphanages?.forEach(orphanage => {
        orphanageMap.set(orphanage.id, orphanage.name);
      });

      const childOrphanageMap = new Map();
      children?.forEach(child => {
        childOrphanageMap.set(child.id, child.orphanage_id);
      });

      // Regrouper par enfant pour obtenir le statut le plus récent
      const childVaccinationMap = new Map();
      
      healthRecords.forEach((record) => {
        const childId = record.child_id;
        if (childId && !childVaccinationMap.has(childId)) {
          const orphanageId = childOrphanageMap.get(childId);
          const orphanageName = orphanageMap.get(orphanageId) || 'Orphelinat inconnu';
          const vaccinationData = record.vaccination_status_structured as any;
          
          childVaccinationMap.set(childId, {
            status: vaccinationData?.status || 'unknown',
            orphanage_name: orphanageName
          });
        }
      });

      // Compter les statuts globaux
      const statusCounts = new Map<string, number>();
      const orphanageCounts = new Map<string, OrphanageVaccinationData>();

      Array.from(childVaccinationMap.values()).forEach((child: any) => {
        const status = child.status;
        const orphanageName = child.orphanage_name;

        // Compter par statut global
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);

        // Compter par orphelinat
        if (!orphanageCounts.has(orphanageName)) {
          orphanageCounts.set(orphanageName, {
            orphanage_name: orphanageName,
            vaccinated: 0,
            not_vaccinated: 0,
            partially_vaccinated: 0,
            unknown: 0
          });
        }

        const orphanageData = orphanageCounts.get(orphanageName)!;
        switch (status) {
          case 'vaccinated':
            orphanageData.vaccinated++;
            break;
          case 'not_vaccinated':
            orphanageData.not_vaccinated++;
            break;
          case 'partially_vaccinated':
            orphanageData.partially_vaccinated++;
            break;
          default:
            orphanageData.unknown++;
        }
      });

      // Préparer les données pour les graphiques
      const statusArray: VaccinationStatusData[] = [
        { 
          status: 'Vacciné', 
          count: statusCounts.get('vaccinated') || 0, 
          color: '#10B981' 
        },
        { 
          status: 'Partiellement vacciné', 
          count: statusCounts.get('partially_vaccinated') || 0, 
          color: '#F59E0B' 
        },
        { 
          status: 'Non vacciné', 
          count: statusCounts.get('not_vaccinated') || 0, 
          color: '#EF4444' 
        },
        { 
          status: 'Statut inconnu', 
          count: statusCounts.get('unknown') || 0, 
          color: '#6B7280' 
        }
      ];

      const orphanageArray = Array.from(orphanageCounts.values())
        .slice(0, 10); // Top 10 orphelinats

      console.log('Données de statut traitées:', statusArray);
      console.log('Données d\'orphelinat traitées:', orphanageArray);

      setStatusData(statusArray);
      setOrphanageData(orphanageArray);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de vaccination:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de vaccination.",
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
    vaccinated: {
      label: "Vacciné",
      color: "#10B981",
    },
    not_vaccinated: {
      label: "Non vacciné",
      color: "#EF4444",
    },
    partially_vaccinated: {
      label: "Partiellement vacciné",
      color: "#F59E0B",
    },
    unknown: {
      label: "Statut inconnu",
      color: "#6B7280",
    },
  };

  const hasStatusData = statusData.some(item => item.count > 0);
  const hasOrphanageData = orphanageData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en camembert du statut vaccinal global */}
      <Card>
        <CardHeader>
          <CardTitle>Statut Vaccinal Global</CardTitle>
        </CardHeader>
        <CardContent>
          {hasStatusData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.filter(item => item.count > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucune donnée de vaccination disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphique en barres par orphelinat */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination par Orphelinat</CardTitle>
        </CardHeader>
        <CardContent>
          {hasOrphanageData ? (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orphanageData}>
                  <XAxis 
                    dataKey="orphanage_name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="vaccinated" stackId="a" fill="var(--color-vaccinated)" />
                  <Bar dataKey="partially_vaccinated" stackId="a" fill="var(--color-partially_vaccinated)" />
                  <Bar dataKey="not_vaccinated" stackId="a" fill="var(--color-not_vaccinated)" />
                  <Bar dataKey="unknown" stackId="a" fill="var(--color-unknown)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucune donnée d'orphelinat disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VaccinationStatsChart;
