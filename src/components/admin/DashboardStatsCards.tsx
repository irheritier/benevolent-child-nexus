
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Heart, MapPin } from 'lucide-react';

interface DashboardStats {
  totalOrphanages: number;
  totalChildren: number;
  pendingOrphanages: number;
  verifiedOrphanages: number;
  wellNourishedChildren: number;
  malnourishedChildren: number;
  totalProvinces: number;
}

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const DashboardStatsCards = ({ stats, isLoading }: DashboardStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orphelinats</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrphanages}</div>
          <p className="text-xs text-muted-foreground">
            {stats.verifiedOrphanages} validés, {stats.pendingOrphanages} en attente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Enfants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChildren}</div>
          <p className="text-xs text-muted-foreground">
            Enfants hébergés dans le système
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nutrition</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.wellNourishedChildren}</div>
          <p className="text-xs text-muted-foreground">
            Bien nourris / {stats.malnourishedChildren} malnutris
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Provinces</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProvinces}</div>
          <p className="text-xs text-muted-foreground">
            Provinces couvertes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStatsCards;
