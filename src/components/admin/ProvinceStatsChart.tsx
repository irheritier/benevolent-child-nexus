import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence, Variants } from 'framer-motion';

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

  // Animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const containerVariants: Variants = {
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
        className="grid grid-cols-1 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} variants={cardVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Orphelinats et enfants par province */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
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
      </motion.div>

      {/* Statuts nutritionnels par province */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
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
      </motion.div>

      {/* Tableau récapitulatif */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Récapitulatif par province</CardTitle>
            <CardDescription>
              Données détaillées pour chaque province
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="overflow-x-auto"
            >
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
                    <motion.tr 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProvinceStatsChart;