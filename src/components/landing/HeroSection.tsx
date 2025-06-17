
import { Button } from "@/components/ui/button";
import { UserPlus, MapPin, Globe, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  heroDescription: string;
  registerText: string;
  exploreMapText: string;
}

export const HeroSection = ({ title, subtitle, heroDescription, registerText, exploreMapText }: HeroSectionProps) => {
  return (
    <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 dark:bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold mb-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            <Globe className="w-5 h-5 mr-3" />
            <span className="mr-2">Plateforme Nationale</span>
            <span className="w-2 h-2 bg-blue-400 rounded-full mx-2"></span>
            <span>République Démocratique du Congo</span>
          </div>
          
          {/* Main title with enhanced styling */}
          <h1 className="text-6xl md:text-8xl font-black text-slate-800 dark:text-slate-100 mb-8 leading-tight tracking-tight">
            <span className="block text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4 tracking-wider">
              FCS
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent block text-4xl md:text-6xl">
              Find Children To Save
            </span>
          </h1>
          
          {/* Subtitle with better typography */}
          <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-light max-w-4xl mx-auto">
            {subtitle}
          </p>
          
          {/* Description with improved spacing */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed font-normal">
            {heroDescription}
          </p>
          
          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/register" className="group">
              <Button size="lg" className="text-lg px-10 py-6 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl border-0 font-semibold">
                <UserPlus className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                {registerText}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/partner/request">
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 h-16 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 rounded-2xl font-semibold text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-400 transition-all duration-300">
                <MapPin className="w-6 h-6 mr-3" />
                Demander l'accès partenaire
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-medium">Certifié ISO 27001</span>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
            <span className="font-medium">Conforme RGPD</span>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
            <span className="font-medium">Partenaire Ministère de la Santé</span>
          </div>
        </div>
      </div>
    </section>
  );
};
