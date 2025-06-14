
import DashboardStatsCards from './DashboardStatsCards';
import DashboardAnalyticsTabs from './DashboardAnalyticsTabs';
import { useDashboardStats } from './hooks/useDashboardStats';

const AdminStatsDashboard = () => {
  const { stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <DashboardStatsCards stats={stats} isLoading={isLoading} />

      {/* Graphiques et analyses */}
      <DashboardAnalyticsTabs />
    </div>
  );
};

export default AdminStatsDashboard;
