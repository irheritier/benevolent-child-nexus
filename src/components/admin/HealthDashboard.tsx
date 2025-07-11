import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Heart, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DiseaseStatsChart from './DiseaseStatsChart';
import VaccinationStatsChart from './VaccinationStatsChart';
import HealthAlertsPanel from './HealthAlertsPanel';
import { motion, Variants,  AnimatePresence } from 'framer-motion';

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
      console.log('Chargement des statistiques de santé...');

      // Charger toutes les données avec des requêtes plus simples
      const [
        healthRecordsResult,
        diseasesResult,
        recentRecordsResult,
        criticalCasesResult
      ] = await Promise.all([
        // Total des dossiers de santé
        supabase
          .from('health_records')
          .select('id'),
        
        // Total des maladies diagnostiquées
        supabase
          .from('child_diseases')
          .select('id'),
        
        // Dossiers récents (derniers 7 jours)
        supabase
          .from('health_records')
          .select('id')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Cas critiques (maladies sévères)
        supabase
          .from('child_diseases')
          .select('id')
          .eq('severity', 'severe')
      ]);

      console.log('Résultats health_records:', healthRecordsResult.data?.length);
      console.log('Résultats child_diseases:', diseasesResult.data?.length);

      // Charger les données de vaccination de manière plus simple
      const { data: allHealthRecords, error: vaccinationError } = await supabase
        .from('health_records')
        .select('vaccination_status_structured, child_id');

      console.log('Données de vaccination chargées:', allHealthRecords);

      if (vaccinationError) {
        console.error('Erreur vaccination:', vaccinationError);
      }

      // Calculer les statistiques de vaccination
      let vaccinatedCount = 0;
      let unvaccinatedCount = 0;

      if (allHealthRecords && allHealthRecords.length > 0) {
        // Grouper par enfant pour éviter les doublons
        const childVaccinationMap = new Map();
        
        allHealthRecords.forEach((record) => {
          const childId = record.child_id;
          if (childId && !childVaccinationMap.has(childId)) {
            const vaccinationData = record.vaccination_status_structured as any;
            const status = vaccinationData?.status || 'unknown';
            childVaccinationMap.set(childId, status);
          }
        });

        // Compter les statuts
        Array.from(childVaccinationMap.values()).forEach((status) => {
          if (status === 'vaccinated') {
            vaccinatedCount++;
          } else if (status === 'not_vaccinated') {
            unvaccinatedCount++;
          }
        });
      }

      const newStats = {
        totalHealthRecords: healthRecordsResult.data?.length || 0,
        totalDiseases: diseasesResult.data?.length || 0,
        vaccinatedChildren: vaccinatedCount,
        unvaccinatedChildren: unvaccinatedCount,
        recentHealthRecords: recentRecordsResult.data?.length || 0,
        criticalCases: criticalCasesResult.data?.length || 0,
      };

      console.log('Statistiques de santé calculées:', newStats);
      setHealthStats(newStats);
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

  // Animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const // force le type
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} variants={cardVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Cartes de statistiques */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Activity className="h-8 w-8 text-blue-600" />
                </motion.div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Dossiers Médicaux
                  </p>
                  <motion.p 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    {healthStats.totalHealthRecords}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Heart className="h-8 w-8 text-red-600" />
                </motion.div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Maladies Diagnostiquées
                  </p>
                  <motion.p 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {healthStats.totalDiseases}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Shield className="h-8 w-8 text-green-600" />
                </motion.div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Enfants Vaccinés
                  </p>
                  <motion.p 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    {healthStats.vaccinatedChildren}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </motion.div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Cas Critiques
                  </p>
                  <motion.p 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    {healthStats.criticalCases}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Onglets pour les différents types de graphiques */}
      <motion.div variants={cardVariants}>
        <Tabs defaultValue="diseases" className="space-y-4">
          <TabsList>
            <TabsTrigger value="diseases">Maladies</TabsTrigger>
            <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="diseases" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <DiseaseStatsChart />
              </motion.div>
            </TabsContent>

            <TabsContent value="vaccination" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <VaccinationStatsChart />
              </motion.div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <HealthAlertsPanel />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default HealthDashboard;
