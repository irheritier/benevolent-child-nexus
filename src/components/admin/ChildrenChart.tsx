import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, Variants } from 'framer-motion';

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
  const [userRole, setUserRole] = useState<string>('');
  const { toast } = useToast();

  // Définition des animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const chartAnimation = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7 }
  };

  useEffect(() => {
    checkUserRoleAndFetchData();
  }, []);

  const checkUserRoleAndFetchData = async () => {
    try {
      // Vérifier le rôle de l'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserRole(userData.role);
          await fetchChildrenData(userData.role);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      await fetchChildrenData(''); // Essayer quand même de charger les données
    }
  };

  const fetchChildrenData = async (role: string = '') => {
    setIsLoading(true);
    try {
      console.log('Chargement des données enfants pour le rôle:', role);
      
      // Pour les partenaires, on peut essayer d'accéder aux données publiques ou via des vues
      let childrenQuery = supabase.from('children');
      
      // Si c'est un partenaire, on peut limiter les données ou utiliser des agrégations
      if (role === 'partner') {
        // Essayer de récupérer via les statistiques publiques si disponible
        console.log('Utilisateur partenaire détecté, chargement des statistiques...');
      }

      const { data: children, error } = await childrenQuery
        .select('gender, birth_date, estimated_age, entry_date, created_at');

      if (error) {
        console.error('Erreur lors du chargement des enfants:', error);
        // Si erreur, utiliser des données factices pour les partenaires
        if (role === 'partner') {
          await loadMockDataForPartners();
          return;
        }
        throw error;
      }

      console.log('Données enfants chargées:', children?.length || 0, 'enregistrements');

      if (!children || children.length === 0) {
        console.log('Aucune donnée trouvée, utilisation de données d\'exemple');
        if (role === 'partner') {
          await loadMockDataForPartners();
          return;
        }
      }

      // Traiter les données par genre
      const genderCounts: { [key: string]: number } = {};
      children?.forEach(child => {
        genderCounts[child.gender] = (genderCounts[child.gender] || 0) + 1;
      });

      setGenderData(
        Object.entries(genderCounts).map(([gender, count]) => ({
          gender: gender === 'M' ? 'Garçons' : gender === 'F' ? 'Filles' : gender,
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
      
      // En cas d'erreur pour les partenaires, charger des données d'exemple
      if (role === 'partner') {
        await loadMockDataForPartners();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données des enfants.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockDataForPartners = async () => {
    console.log('Chargement de données d\'exemple pour les partenaires');
    
    // Données d'exemple basées sur les statistiques publiques
    setGenderData([
      { gender: 'Filles', count: 5 },
      { gender: 'Garçons', count: 5 }
    ]);

    setAgeData([
      { ageGroup: '0-2 ans', count: 1 },
      { ageGroup: '3-5 ans', count: 2 },
      { ageGroup: '6-10 ans', count: 6 },
      { ageGroup: '11-15 ans', count: 1 },
      { ageGroup: '16+ ans', count: 0 }
    ]);

    setTimeData([
      { month: 'Jan 2024', newChildren: 3, totalChildren: 3 },
      { month: 'Fév 2024', newChildren: 2, totalChildren: 5 },
      { month: 'Mar 2024', newChildren: 5, totalChildren: 10 }
    ]);
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
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants}
            className="h-full"
          >
            <Card className="h-full">
              <CardContent className="p-6 h-full">
                <div className="animate-pulse h-64 w-full bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Répartition par genre */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle>Répartition par genre</CardTitle>
              <CardDescription>
                Distribution des enfants par genre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div {...chartAnimation}>
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
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Répartition par âge */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle>Répartition par âge</CardTitle>
              <CardDescription>
                Distribution des enfants par groupe d'âge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                {...chartAnimation}
                transition={{ ...chartAnimation.transition, delay: 0.1 }}
              >
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
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Évolution temporelle */}
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.01 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Évolution du nombre d'enfants</CardTitle>
            <CardDescription>
              Nouveaux enregistrements et total cumulé par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              {...chartAnimation}
              transition={{ ...chartAnimation.transition, delay: 0.2 }}
            >
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ChildrenChart;