
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Heart, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DiseaseStatsChart from './DiseaseStatsChart';
import VaccinationStatsChart from './VaccinationStatsChart';
import HealthAlertsPanel from './HealthAlertsPanel';

interface HealthStats {
  totalHealthRecords: number;
  totalDiseases: number;
  vaccinatedChildren: number;
  unvaccinatedChildren: number;
  recentHealthRecords: number;
  criticalCases: number;
}

const HealthDashboard = () => {
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalHealthRecords: 0,
    totalDiseases: 0,
    vaccinatedChildren: 0,
    unvaccinatedChildren: 0,
    recentHealthRecords: 0,
    criticalCases: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthStats();
  }, []);

  const loadHealthStats = async () => {
    try {
      console.log('Chargement des statistiques santé...');

      // Charger les vraies statistiques de santé pour tous les utilisateurs
      const [
        healthRecordsResult,
        diseasesResult,
        vaccinationResult,
        recentRecordsResult,
        criticalCasesResult
      ] = await Promise.all([
        supabase.from('health_records').select('id', { count: 'exact', head: true }),
        supabase.from('child_diseases').select('id', { count: 'exact', head: true }),
        supabase
          .from('health_records')
          .select('vaccination_status_structured')
          .not('vaccination_status_structured', 'is', null),
        supabase
          .from('health_records')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('child_diseases')
          .select('id', { count: 'exact', head: true })
          .eq('severity', 'severe')
      ]);

      // Calculer les statistiques de vaccination à partir des vraies données
      let vaccinatedCount = 0;
      let unvaccinatedCount = 0;

      if (vaccinationResult.data) {
        vaccinationResult.data.forEach((record) => {
          const vaccinationData = record.vaccination_status_structured as any;
          if (vaccinationData?.status === 'vaccinated') {
            vaccinatedCount++;
          } else if (vaccinationData?.status === 'not_vaccinated') {
            unvaccinatedCount++;
          }
        });
      }

      setHealthStats({
        totalHealthRecords: healthRecordsResult.count || 0,
        totalDiseases: diseasesResult.count || 0,
        vaccinatedChildren: vaccinatedCount,
        unvaccinatedChildren: unvaccinatedCount,
        recentHealthRecords: recentRecordsResult.count || 0,
        criticalCases: criticalCasesResult.count || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de santé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de santé.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
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
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Dossiers Médicaux
                </p>
                <p className="text-2xl font-bold">{healthStats.totalHealthRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Maladies Diagnostiquées
                </p>
                <p className="text-2xl font-bold">{healthStats.totalDiseases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Enfants Vaccinés
                </p>
                <p className="text-2xl font-bold">{healthStats.vaccinatedChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Cas Critiques
                </p>
                <p className="text-2xl font-bold">{healthStats.criticalCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différents types de graphiques */}
      <Tabs defaultValue="diseases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diseases">Maladies</TabsTrigger>
          <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="diseases" className="space-y-4">
          <DiseaseStatsChart />
        </TabsContent>

        <TabsContent value="vaccination" className="space-y-4">
          <VaccinationStatsChart />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <HealthAlertsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthDashboard;
