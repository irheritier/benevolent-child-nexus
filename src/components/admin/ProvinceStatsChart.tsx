
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ProvinceData {
  province: string;
  orphanages_count: number;
  children_count: number;
  well_nourished: number;
  malnourished: number;
}

const ProvinceStatsChart = () => {
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProvinceData();
  }, []);

  const fetchProvinceData = async () => {
    setIsLoading(true);
    try {
      const { data: provinceStats, error } = await supabase
        .from('province_stats')
        .select('*');

      if (error) throw error;

      setProvinceData(provinceStats || []);

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques des provinces:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques des provinces.",
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
  };

  // Animation variants
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
        className="space-y-6"
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
      {/* Orphanages by Province */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Orphelinats par province</CardTitle>
            <CardDescription>
              Nombre d'orphelinats enregistrés dans chaque province
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={provinceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="province" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="orphanages_count" fill={chartConfig.orphanages_count.color} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Children by Province */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Enfants par province</CardTitle>
            <CardDescription>
              Nombre d'enfants pris en charge dans chaque province
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={provinceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="province" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="children_count" fill={chartConfig.children_count.color} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProvinceStatsChart;
