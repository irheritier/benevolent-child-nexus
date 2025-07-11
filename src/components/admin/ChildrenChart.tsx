
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ChildrenData {
  month: string;
  boys: number;
  girls: number;
  total: number;
}

interface GenderData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#3b82f6', '#ec4899'];

const ChildrenChart = () => {
  const [monthlyData, setMonthlyData] = useState<ChildrenData[]>([]);
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    setIsLoading(true);
    try {
      const { data: children, error } = await supabase
        .from('children')
        .select('gender, created_at');

      if (error) throw error;

      // Process data for monthly chart
      const monthlyStats: { [key: string]: ChildrenData } = {};
      let totalBoys = 0;
      let totalGirls = 0;

      children?.forEach(child => {
        const date = new Date(child.created_at || '');
        const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            boys: 0,
            girls: 0,
            total: 0
          };
        }

        if (child.gender === 'M') {
          monthlyStats[monthKey].boys++;
          totalBoys++;
        } else {
          monthlyStats[monthKey].girls++;
          totalGirls++;
        }
        monthlyStats[monthKey].total++;
      });

      const monthlyArray = Object.values(monthlyStats).sort((a, b) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );

      setMonthlyData(monthlyArray);
      setGenderData([
        { name: 'Garçons', value: totalBoys, color: COLORS[0] },
        { name: 'Filles', value: totalGirls, color: COLORS[1] }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données enfants:', error);
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
    boys: {
      label: "Garçons",
      color: "#3b82f6",
    },
    girls: {
      label: "Filles", 
      color: "#ec4899",
    },
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Monthly Evolution Chart */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Évolution mensuelle des arrivées</CardTitle>
            <CardDescription>
              Nombre d'enfants accueillis par mois et par genre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="boys" stackId="a" fill={chartConfig.boys.color} />
                    <Bar dataKey="girls" stackId="a" fill={chartConfig.girls.color} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gender Distribution Chart */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Répartition par genre</CardTitle>
            <CardDescription>
              Distribution des enfants selon le genre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ChildrenChart;
