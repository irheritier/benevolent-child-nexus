
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrphanagesChart from './OrphanagesChart';
import ChildrenChart from './ChildrenChart';
import NutritionChart from './NutritionChart';
import HealthDashboard from './HealthDashboard';
import ProvinceStatsChart from './ProvinceStatsChart';
import ReportsManager from './ReportsManager';

const DashboardAnalyticsTabs = () => {
  return (
    <Tabs defaultValue="nutrition" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="orphanages">Orphelinats</TabsTrigger>
        <TabsTrigger value="children">Enfants</TabsTrigger>
        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        <TabsTrigger value="health">Santé</TabsTrigger>
        <TabsTrigger value="provinces">Provinces</TabsTrigger>
        <TabsTrigger value="reports">Rapports</TabsTrigger>
      </TabsList>

      <TabsContent value="orphanages" className="space-y-4">
        <OrphanagesChart />
      </TabsContent>

      <TabsContent value="children" className="space-y-4">
        <ChildrenChart />
      </TabsContent>

      <TabsContent value="nutrition" className="space-y-4">
        <NutritionChart />
      </TabsContent>

      <TabsContent value="health" className="space-y-4">
        <HealthDashboard />
      </TabsContent>

      <TabsContent value="provinces" className="space-y-4">
        <ProvinceStatsChart />
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <ReportsManager />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardAnalyticsTabs;
