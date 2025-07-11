
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Heart, MapPin, Shield, Activity } from 'lucide-react';
import { useDashboardStats } from '@/components/admin/hooks/useDashboardStats';

const StatisticsSection = () => {
  console.log('StatisticsSection rendering...');
  
  const { stats, isLoading } = useDashboardStats();
  
  console.log('Stats data:', stats);
  console.log('Loading state:', isLoading);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  console.log('Rendering main statistics section');
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            variants={titleVariants}
          >
            Notre Impact en Temps Réel
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            variants={descriptionVariants}
          >
            Des données transparentes et actualisées en permanence pour mesurer notre action collective
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="text-center p-8 hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.totalOrphanages || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Orphelinats enregistrés
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Centres d'accueil officiels
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="text-center p-8 hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-green-200 dark:border-green-800">
              <CardHeader className="pb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalChildren || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Enfants pris en charge
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Hébergés et accompagnés
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="text-center p-8 hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <MapPin className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.totalProvinces || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Provinces couvertes
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Présence nationale
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="text-center p-8 hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Shield className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats?.verifiedOrphanages || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Centres validés
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Officiellement reconnus
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="text-center p-8 hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-800">
              <CardHeader className="pb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TrendingUp className="h-16 w-16 text-teal-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {stats?.wellNourishedChildren || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Enfants bien nourris
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  État nutritionnel satisfaisant
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
            <Card className="text-center p-8 hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-indigo-200 dark:border-indigo-800">
              <CardHeader className="pb-4">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Activity className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  24/7
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Surveillance continue
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Monitoring en temps réel
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;
