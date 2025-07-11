
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface NutritionTrendData {
  month: string;
  normal: number;
  malnourished: number;
  severely_malnourished: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const NutritionChart = () => {
  const [trendData, setTrendData] = useState<NutritionTrendData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    setIsLoading(true);
    try {
      const { data: nutritionRecords, error } = await supabase
        .from('nutrition_records')
        .select('nutrition_status, created_at');

      if (error) throw error;

      // Process data for trend chart
      const monthlyStats: { [key: string]: NutritionTrendData } = {};
      const statusCounts = { normal: 0, malnourished: 0, severely_malnourished: 0 };

      nutritionRecords?.forEach(record => {
        const date = new Date(record.created_at || '');
        const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
        const status = record.nutrition_status || 'normal';

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            normal: 0,
            malnourished: 0,
            severely_malnourished: 0
          };
        }

        monthlyStats[monthKey][status as keyof typeof statusCounts]++;
        statusCounts[status as keyof typeof statusCounts]++;
      });

      const trendArray = Object.values(monthlyStats).sort((a, b) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );

      setTrendData(trendArray);
      setStatusData([
        { name: 'Normal', value: statusCounts.normal, color: COLORS[0] },
        { name: 'Malnutri', value: statusCounts.malnourished, color: COLORS[1] },
        { name: 'Sévèrement malnutri', value: statusCounts.severely_malnourished, color: COLORS[2] }
      ]);

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
      color: "#10b981",
    },
    malnourished: {
      label: "Malnutri", 
      color: "#f59e0b",
    },
    severely_malnourished: {
      label: "Sévèrement malnutri",
      color: "#ef4444",
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
      {/* Nutrition Trend Chart */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Évolution nutritionnelle</CardTitle>
            <CardDescription>
              Tendances du statut nutritionnel au fil du temps
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
                      dataKey="malnourished" 
                      stroke={chartConfig.malnourished.color}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="severely_malnourished" 
                      stroke={chartConfig.severely_malnourished.color}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Distribution Chart */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Répartition nutritionnelle</CardTitle>
            <CardDescription>
              Distribution actuelle des statuts nutritionnels
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default NutritionChart;
