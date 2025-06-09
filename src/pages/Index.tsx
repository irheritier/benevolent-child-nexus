
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
}

const Index = () => {
  const { language, setLanguage } = useLanguage();

  // Fetch public statistics
  const { data: publicStats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_stats')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as PublicStats;
    }
  });

  const t = texts[language];

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
        stats={t.stats}
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
