
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Heart, Shield, Activity, TrendingUp } from "lucide-react";

interface PublicStats {
  total_orphanages: number;
  total_children: number;
  total_provinces: number;
  well_nourished_children: number;
  malnourished_children: number;
  verified_orphanages: number;
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
  };
}

export const StatisticsSection = ({ publicStats, statsLoading, impact, impactSubtitle, stats }: StatisticsSectionProps) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-muted/30 via-background to-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">{impact}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {impactSubtitle}
          </p>
        </div>
        
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-xl mx-auto mb-3 sm:mb-4"></div>
                  <div className="h-6 sm:h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/50 dark:to-blue-950/20 hover:scale-105">
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {publicStats?.total_orphanages || 0}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stats.centers}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-emerald-50/50 dark:to-emerald-950/20 hover:scale-105">
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {publicStats?.total_children || 0}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stats.children}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-purple-50/50 dark:to-purple-950/20 hover:scale-105">
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {publicStats?.total_provinces || 0}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stats.provinces}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-teal-50/50 dark:to-teal-950/20 hover:scale-105">
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {publicStats?.verified_orphanages || 0}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stats.verified}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-green-50/50 dark:to-green-950/20 hover:scale-105">
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {publicStats?.well_nourished_children || 0}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stats.wellNourished}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-amber-50/50 dark:to-amber-950/20 hover:scale-105">
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  {publicStats?.malnourished_children || 0}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stats.malnourished}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};
