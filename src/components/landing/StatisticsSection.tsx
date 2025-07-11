
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Heart, Shield, Activity, TrendingUp, GraduationCap, Utensils, User, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface PublicStats {
  total_orphanages: number;
  total_children: number;
  total_provinces: number;
  well_nourished_children: number;
  malnourished_children: number;
  verified_orphanages: number;
  total_boys?: number;
  total_girls?: number;
  avg_schooling_rate?: number;
  avg_disease_rate?: number;
  avg_meals_per_day?: number;
}

interface StatisticsSectionProps {
  publicStats?: PublicStats;
  statsLoading: boolean;
  impact: string;
  impactSubtitle: string;
  stats: {
    centers: string;
    children: string;
    provinces: string;
    verified: string;
    wellNourished: string;
    malnourished: string;
    boys?: string;
    girls?: string;
    schoolingRate?: string;
    diseaseRate?: string;
    mealsPerDay?: string;
  };
}

export const StatisticsSection = ({ publicStats, statsLoading, impact, impactSubtitle, stats }: StatisticsSectionProps) => {
  const statsToShow = [
    {
      icon: Users,
      value: publicStats?.total_orphanages || 0,
      label: stats.centers,
      gradient: "from-blue-500 to-blue-600",
      bg: "from-background to-blue-50/50 dark:to-blue-950/20"
    },
    {
      icon: Heart,
      value: publicStats?.total_children || 0,
      label: stats.children,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "from-background to-emerald-50/50 dark:to-emerald-950/20"
    },
    {
      icon: User,
      value: publicStats?.total_boys || 0,
      label: stats.boys || "Garçons",
      gradient: "from-cyan-500 to-cyan-600",
      bg: "from-background to-cyan-50/50 dark:to-cyan-950/20"
    },
    {
      icon: UserCheck,
      value: publicStats?.total_girls || 0,
      label: stats.girls || "Filles",
      gradient: "from-pink-500 to-pink-600",
      bg: "from-background to-pink-50/50 dark:to-pink-950/20"
    },
    {
      icon: MapPin,
      value: publicStats?.total_provinces || 0,
      label: stats.provinces,
      gradient: "from-purple-500 to-purple-600",
      bg: "from-background to-purple-50/50 dark:to-purple-950/20"
    },
    {
      icon: Shield,
      value: publicStats?.verified_orphanages || 0,
      label: stats.verified,
      gradient: "from-teal-500 to-teal-600",
      bg: "from-background to-teal-50/50 dark:to-teal-950/20"
    },
    {
      icon: TrendingUp,
      value: publicStats?.well_nourished_children || 0,
      label: stats.wellNourished,
      gradient: "from-green-500 to-green-600",
      bg: "from-background to-green-50/50 dark:to-green-950/20"
    },
    {
      icon: Activity,
      value: publicStats?.malnourished_children || 0,
      label: stats.malnourished,
      gradient: "from-amber-500 to-amber-600",
      bg: "from-background to-amber-50/50 dark:to-amber-950/20"
    },
    {
      icon: GraduationCap,
      value: publicStats?.avg_schooling_rate ? `${Math.round(publicStats.avg_schooling_rate)}%` : '0%',
      label: stats.schoolingRate || "Taux de scolarisation",
      gradient: "from-indigo-500 to-indigo-600",
      bg: "from-background to-indigo-50/50 dark:to-indigo-950/20"
    },
    {
      icon: Utensils,
      value: publicStats?.avg_meals_per_day ? `${publicStats.avg_meals_per_day.toFixed(1)}` : '0',
      label: stats.mealsPerDay || "Repas/jour (moy.)",
      gradient: "from-orange-500 to-orange-600",
      bg: "from-background to-orange-50/50 dark:to-orange-950/20"
    }
  ];

  // Animation variants for stats cards
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
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

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-muted/30 via-background to-muted/30">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">{impact}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {impactSubtitle}
          </p>
        </motion.div>
        
        {statsLoading ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(10)].map((_, i) => (
              <motion.div key={i} variants={cardVariants}>
                <Card className="animate-pulse border-0 shadow-lg">
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-xl mx-auto mb-3 sm:mb-4"></div>
                    <div className="h-6 sm:h-8 bg-muted rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {statsToShow.map((stat, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br ${stat.bg} hover:scale-105`}>
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                    <motion.div 
                      className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <motion.h3 
                      className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {stat.value}
                    </motion.h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
