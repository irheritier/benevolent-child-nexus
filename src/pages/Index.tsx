
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Heart, Shield, ArrowUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PublicStats {
  total_orphanages: number;
  total_children: number;
  total_provinces: number;
  well_nourished_children: number;
  malnourished_children: number;
  verified_orphanages: number;
}

interface ProvinceStats {
  province: string;
  province_code: string;
  orphanages_count: number;
  children_count: number;
  well_nourished: number;
  malnourished: number;
}

const Index = () => {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

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

  // Fetch province statistics for the map
  const { data: provinceStats, isLoading: provincesLoading } = useQuery({
    queryKey: ['province-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('province_stats')
        .select('*');
      
      if (error) throw error;
      return data as ProvinceStats[];
    }
  });

  const texts = {
    fr: {
      title: "Congo ChildNet",
      subtitle: "Plateforme de recensement et de suivi des centres d'accueil pour enfants vulnérables en RDC",
      mission: "Notre Mission",
      missionText: "Congo ChildNet centralise les informations sur les centres d'accueil pour enfants vulnérables à travers la République Démocratique du Congo. Notre objectif est de garantir un suivi médical et nutritionnel optimal tout en respectant les droits et la dignité de chaque enfant.",
      impact: "Notre Impact",
      stats: {
        centers: "Centres d'accueil",
        children: "Enfants suivis",
        provinces: "Provinces couvertes",
        verified: "Centres vérifiés",
        wellNourished: "Enfants bien nourris",
        malnourished: "Enfants malnutris"
      },
      cta: {
        register: "Créer un compte centre d'accueil",
        adminLogin: "Connexion administrateur"
      },
      features: {
        title: "Fonctionnalités principales",
        tracking: "Suivi médical et nutritionnel",
        security: "Sécurité et confidentialité",
        sync: "Synchronisation DHIS2",
        map: "Cartographie interactive"
      },
      footer: {
        privacy: "Politique de confidentialité",
        terms: "Conditions d'utilisation"
      }
    },
    en: {
      title: "Congo ChildNet",
      subtitle: "Platform for registering and monitoring care centers for vulnerable children in DRC",
      mission: "Our Mission",
      missionText: "Congo ChildNet centralizes information about care centers for vulnerable children across the Democratic Republic of Congo. Our goal is to ensure optimal medical and nutritional monitoring while respecting the rights and dignity of each child.",
      impact: "Our Impact",
      stats: {
        centers: "Care Centers",
        children: "Children Monitored",
        provinces: "Provinces Covered",
        verified: "Verified Centers",
        wellNourished: "Well-nourished Children",
        malnourished: "Malnourished Children"
      },
      cta: {
        register: "Create Care Center Account",
        adminLogin: "Administrator Login"
      },
      features: {
        title: "Key Features",
        tracking: "Medical & Nutritional Tracking",
        security: "Security & Privacy",
        sync: "DHIS2 Synchronization",
        map: "Interactive Mapping"
      },
      footer: {
        privacy: "Privacy Policy",
        terms: "Terms of Use"
      }
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">CCN</h1>
              <p className="text-xs text-muted-foreground">Congo ChildNet</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1 text-sm rounded ${
                  language === 'fr' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm rounded ${
                  language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
            </div>
            <Button variant="outline" size="sm">
              {t.cta.adminLogin}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              {t.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4">
                {t.cta.register}
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <MapPin className="w-5 h-5 mr-2" />
                Explorer la carte
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t.impact}</h2>
            <p className="text-lg text-muted-foreground">
              Données en temps réel sur notre impact à travers la RDC
            </p>
          </div>
          
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-4"></div>
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {publicStats?.total_orphanages || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.stats.centers}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {publicStats?.total_children || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.stats.children}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {publicStats?.total_provinces || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.stats.provinces}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {publicStats?.verified_orphanages || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.stats.verified}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {publicStats?.well_nourished_children || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.stats.wellNourished}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-amber-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {publicStats?.malnourished_children || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.stats.malnourished}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t.mission}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {t.missionText}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.features.tracking}</h3>
                <p className="text-sm text-muted-foreground">Suivi complet de la santé et nutrition</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.features.security}</h3>
                <p className="text-sm text-muted-foreground">Protection des données personnelles</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.features.sync}</h3>
                <p className="text-sm text-muted-foreground">Intégration avec le système DHIS2</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t.features.map}</h3>
                <p className="text-sm text-muted-foreground">Visualisation géographique des centres</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Carte Interactive</h2>
            <p className="text-lg text-muted-foreground">
              Répartition des centres d'accueil à travers les provinces de la RDC
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Carte Interactive</h3>
                  <p className="text-muted-foreground">
                    La carte interactive sera intégrée ici pour visualiser<br />
                    la répartition géographique des centres d'accueil
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-foreground mb-6">
              Rejoignez le réseau Congo ChildNet
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Inscrivez votre centre d'accueil et contribuez à améliorer le suivi des enfants vulnérables en RDC
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              {t.cta.register}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">Congo ChildNet</h3>
                  <p className="text-sm text-muted-foreground">Protection de l'enfance en RDC</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Plateforme sécurisée pour le recensement et le suivi des centres d'accueil pour enfants vulnérables.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">{t.footer.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">{t.footer.terms}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Partenaires</h4>
              <p className="text-sm text-muted-foreground">
                En collaboration avec le Ministère de la Santé et les organisations de protection de l'enfance.
              </p>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Congo ChildNet. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
