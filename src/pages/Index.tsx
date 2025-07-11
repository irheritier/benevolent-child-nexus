
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatisticsSection } from "@/components/landing/StatisticsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { texts } from "@/data/translations";

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

const Index = () => {
  const { language, setLanguage } = useLanguage();

  // Fetch public statistics with enhanced data
  const { data: publicStats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats-enhanced'],
    queryFn: async () => {
      // Fetch basic public stats
      const { data: basicStats } = await supabase
        .from('public_stats')
        .select('*')
        .single();

      // Fetch additional aggregated data
      const { data: orphanagesData } = await supabase
        .from('orphanages')
        .select('boys_count, girls_count, schooling_rate, annual_disease_rate, meals_per_day')
        .eq('legal_status', 'verified');

      // Start with basic stats, ensuring all required properties exist
      let enhancedStats: PublicStats = {
        total_orphanages: basicStats?.total_orphanages || 0,
        total_children: basicStats?.total_children || 0,
        total_provinces: basicStats?.total_provinces || 0,
        well_nourished_children: basicStats?.well_nourished_children || 0,
        malnourished_children: basicStats?.malnourished_children || 0,
        verified_orphanages: basicStats?.verified_orphanages || 0,
      };

      if (orphanagesData && orphanagesData.length > 0) {
        // Calculate totals and averages
        const totalBoys = orphanagesData.reduce((sum, org) => sum + (org.boys_count || 0), 0);
        const totalGirls = orphanagesData.reduce((sum, org) => sum + (org.girls_count || 0), 0);
        
        const schoolingRates = orphanagesData.filter(org => org.schooling_rate !== null).map(org => org.schooling_rate || 0);
        const diseaseRates = orphanagesData.filter(org => org.annual_disease_rate !== null).map(org => org.annual_disease_rate || 0);
        const mealsPerDay = orphanagesData.filter(org => org.meals_per_day !== null).map(org => org.meals_per_day || 0);

        // Add the calculated fields
        enhancedStats.total_boys = totalBoys;
        enhancedStats.total_girls = totalGirls;
        enhancedStats.avg_schooling_rate = schoolingRates.length > 0 ? schoolingRates.reduce((a, b) => a + b, 0) / schoolingRates.length : 0;
        enhancedStats.avg_disease_rate = diseaseRates.length > 0 ? diseaseRates.reduce((a, b) => a + b, 0) / diseaseRates.length : 0;
        enhancedStats.avg_meals_per_day = mealsPerDay.length > 0 ? mealsPerDay.reduce((a, b) => a + b, 0) / mealsPerDay.length : 0;
      }

      return enhancedStats;
    }
  });

  const t = texts[language];

  // Enhanced stats object with new labels
  const enhancedStatsLabels = {
    ...t.stats,
    boys: "Garçons",
    girls: "Filles",
    schoolingRate: "Taux de scolarisation",
    diseaseRate: "Taux de maladies",
    mealsPerDay: "Repas/jour (moy.)",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminLoginText={t.cta.adminLogin} 
      />
      
      <HeroSection 
        title={t.title}
        subtitle={t.subtitle}
        heroDescription={t.heroDescription}
        registerText={t.cta.register}
        exploreMapText={t.cta.exploreMap}
      />
      
      <StatisticsSection 
        publicStats={publicStats}
        statsLoading={statsLoading}
        impact={t.impact}
        impactSubtitle={t.impactSubtitle}
        stats={enhancedStatsLabels}
      />
      
      <FeaturesSection features={t.features} />
      
      <TrustSection trust={t.trust} />
      
      <CTASection 
        registerText={t.cta.register}
        exploreMapText={t.cta.exploreMap}
      />
      
      <Footer footer={t.footer} />
    </div>
  );
};

export default Index;
