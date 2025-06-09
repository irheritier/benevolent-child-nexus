
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Heart, Shield, ArrowUp, Activity, UserPlus, LogIn, Globe, TrendingUp, Award, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

interface PublicStats {
  total_orphanages: number;
  total_children: number;
  total_provinces: number;
  well_nourished_children: number;
  malnourished_children: number;
  verified_orphanages: number;
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

  const texts = {
    fr: {
      title: "Congo ChildNet",
      subtitle: "Plateforme de recensement et de suivi des centres d'accueil pour enfants vulnérables en RDC",
      heroDescription: "Une solution numérique moderne pour centraliser, protéger et optimiser le suivi des enfants vulnérables à travers la République Démocratique du Congo.",
      mission: "Notre Mission",
      missionText: "Congo ChildNet centralise les informations sur les centres d'accueil pour enfants vulnérables à travers la République Démocratique du Congo. Notre objectif est de garantir un suivi médical et nutritionnel optimal tout en respectant les droits et la dignité de chaque enfant.",
      impact: "Notre Impact en Temps Réel",
      impactSubtitle: "Des données transparentes pour un impact mesurable",
      stats: {
        centers: "Centres d'accueil",
        children: "Enfants suivis",
        provinces: "Provinces couvertes",
        verified: "Centres vérifiés",
        wellNourished: "Enfants bien nourris",
        malnourished: "Enfants nécessitant un suivi"
      },
      cta: {
        register: "Créer un compte centre d'accueil",
        adminLogin: "Connexion administrateur",
        exploreMap: "Explorer la carte interactive"
      },
      features: {
        title: "Fonctionnalités Clés",
        subtitle: "Des outils modernes pour une mission essentielle",
        tracking: "Suivi médical et nutritionnel",
        trackingDesc: "Surveillance complète de la santé et nutrition avec tableaux de bord interactifs",
        security: "Sécurité et confidentialité",
        securityDesc: "Protection maximale des données personnelles avec cryptage de bout en bout",
        sync: "Synchronisation DHIS2",
        syncDesc: "Intégration automatique avec le système national de santé",
        map: "Cartographie interactive",
        mapDesc: "Visualisation géographique en temps réel des centres et statistiques"
      },
      trust: {
        title: "Une Plateforme de Confiance",
        subtitle: "Certifiée et reconnue par les institutions",
        ministry: "Partenaire Ministère de la Santé",
        security: "Sécurité ISO 27001",
        gdpr: "Conforme RGPD"
      },
      footer: {
        about: "À propos de CCN",
        aboutText: "Congo ChildNet est une initiative technologique dédiée à la protection et au suivi des enfants vulnérables en RDC.",
        links: "Liens utiles",
        privacy: "Politique de confidentialité",
        terms: "Conditions d'utilisation",
        contact: "Contact & Support",
        partners: "Nos Partenaires",
        partnersText: "En collaboration avec le Ministère de la Santé et les organisations internationales de protection de l'enfance."
      }
    },
    en: {
      title: "Congo ChildNet",
      subtitle: "Platform for registering and monitoring care centers for vulnerable children in DRC",
      heroDescription: "A modern digital solution to centralize, protect and optimize the monitoring of vulnerable children across the Democratic Republic of Congo.",
      mission: "Our Mission",
      missionText: "Congo ChildNet centralizes information about care centers for vulnerable children across the Democratic Republic of Congo. Our goal is to ensure optimal medical and nutritional monitoring while respecting the rights and dignity of each child.",
      impact: "Our Real-Time Impact",
      impactSubtitle: "Transparent data for measurable impact",
      stats: {
        centers: "Care Centers",
        children: "Children Monitored",
        provinces: "Provinces Covered",
        verified: "Verified Centers",
        wellNourished: "Well-nourished Children",
        malnourished: "Children Requiring Follow-up"
      },
      cta: {
        register: "Create Care Center Account",
        adminLogin: "Administrator Login",
        exploreMap: "Explore Interactive Map"
      },
      features: {
        title: "Key Features",
        subtitle: "Modern tools for an essential mission",
        tracking: "Medical & Nutritional Tracking",
        trackingDesc: "Complete health and nutrition monitoring with interactive dashboards",
        security: "Security & Privacy",
        securityDesc: "Maximum protection of personal data with end-to-end encryption",
        sync: "DHIS2 Synchronization",
        syncDesc: "Automatic integration with the national health system",
        map: "Interactive Mapping",
        mapDesc: "Real-time geographic visualization of centers and statistics"
      },
      trust: {
        title: "A Trusted Platform",
        subtitle: "Certified and recognized by institutions",
        ministry: "Ministry of Health Partner",
        security: "ISO 27001 Security",
        gdpr: "GDPR Compliant"
      },
      footer: {
        about: "About CCN",
        aboutText: "Congo ChildNet is a technological initiative dedicated to protecting and monitoring vulnerable children in DRC.",
        links: "Useful Links",
        privacy: "Privacy Policy",
        terms: "Terms of Use",
        contact: "Contact & Support",
        partners: "Our Partners",
        partnersText: "In collaboration with the Ministry of Health and international child protection organizations."
      }
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Congo ChildNet
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Protection • Suivi • Dignité</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                  language === 'fr' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                  language === 'en' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                EN
              </button>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden md:flex">
              <LogIn className="w-4 h-4 mr-2" />
              {t.cta.adminLogin}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10"></div>
        <div className="container mx-auto text-center relative">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-medium mb-8 border border-primary/20">
              <Globe className="w-4 h-4 mr-2" />
              Plateforme Nationale • République Démocratique du Congo
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed font-light">
              {t.subtitle}
            </p>
            
            <p className="text-lg text-muted-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t.heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-4 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t.cta.register}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14 border-2 hover:bg-primary/5">
                <MapPin className="w-5 h-5 mr-2" />
                {t.cta.exploreMap}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-muted/30 via-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t.impact}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.impactSubtitle}
            </p>
          </div>
          
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-muted rounded-xl mx-auto mb-4"></div>
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/50 dark:to-blue-950/20 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {publicStats?.total_orphanages || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{t.stats.centers}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-emerald-50/50 dark:to-emerald-950/20 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {publicStats?.total_children || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{t.stats.children}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-purple-50/50 dark:to-purple-950/20 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {publicStats?.total_provinces || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{t.stats.provinces}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-teal-50/50 dark:to-teal-950/20 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {publicStats?.verified_orphanages || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{t.stats.verified}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-green-50/50 dark:to-green-950/20 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {publicStats?.well_nourished_children || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{t.stats.wellNourished}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-background to-amber-50/50 dark:to-amber-950/20 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {publicStats?.malnourished_children || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{t.stats.malnourished}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t.features.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.features.tracking}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.features.trackingDesc}</p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.features.security}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.features.securityDesc}</p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.features.sync}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.features.syncDesc}</p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.features.map}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.features.mapDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t.trust.title}</h2>
            <p className="text-lg text-muted-foreground">{t.trust.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{t.trust.ministry}</h3>
              <p className="text-sm text-muted-foreground">Certification officielle</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{t.trust.security}</h3>
              <p className="text-sm text-muted-foreground">Protection maximale</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{t.trust.gdpr}</h3>
              <p className="text-sm text-muted-foreground">Conformité internationale</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="container mx-auto text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Rejoignez le réseau Congo ChildNet
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              Inscrivez votre centre d'accueil et contribuez à améliorer le suivi des enfants vulnérables en RDC
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-14 bg-white text-primary hover:bg-white/90 shadow-xl">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t.cta.register}
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-14 border-2 border-white/30 text-primary-foreground hover:bg-white/10">
                <MapPin className="w-5 h-5 mr-2" />
                {t.cta.exploreMap}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur-sm py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">Congo ChildNet</h3>
                  <p className="text-sm text-muted-foreground">Protection • Suivi • Dignité</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t.footer.aboutText}
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">{t.footer.links}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.footer.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.footer.terms}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.footer.contact}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">{t.footer.partners}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.footer.partnersText}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 Congo ChildNet. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Fait avec ❤️ pour les enfants du Congo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
