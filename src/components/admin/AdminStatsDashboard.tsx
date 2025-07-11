import DashboardStatsCards from './DashboardStatsCards';
import DashboardAnalyticsTabs from './DashboardAnalyticsTabs';
import { useDashboardStats } from './hooks/useDashboardStats';
import { motion, Variants } from 'framer-motion';

const AdminStatsDashboard = () => {
  const { stats, isLoading } = useDashboardStats();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] // Format cubic bezier recommandé
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Métriques principales */}
      <motion.div variants={sectionVariants}>
        <DashboardStatsCards stats={stats} isLoading={isLoading} />
      </motion.div>

      {/* Graphiques et analyses */}
      <motion.div 
        variants={sectionVariants}
        whileInView="visible"
        initial="hidden"
        viewport={{ once: true, amount: 0.3 }}
      >
        <DashboardAnalyticsTabs />
      </motion.div>
    </motion.div>
  );
};

export default AdminStatsDashboard;