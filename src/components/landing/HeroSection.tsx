
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
    <section className="relative h-[calc(100vh-120px)] sm:h-[calc(100vh-100px)] md:h-[calc(100vh-90px)] lg:h-[calc(100vh-80px)] flex items-center px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950">
      {/* Background decorative elements - Responsive */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-72 md:h-72 bg-blue-200/30 dark:bg-blue-400/20 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-200/20 dark:bg-purple-400/10 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge - Responsive */}
          <div className="inline-flex items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 text-blue-800 dark:text-blue-200 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            <span className="mr-1 sm:mr-2">Plateforme Nationale</span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mx-1 sm:mx-2"></span>
            <span className="text-xs sm:text-sm">RDC</span>
          </div>
          
          {/* Main title - Fully responsive */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black text-slate-800 dark:text-slate-100 mb-6 sm:mb-8 leading-tight tracking-tight">
            <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 sm:mb-4 tracking-wider">
              FCTS
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Find The Children To Save
            </span>
          </h1>
          
          {/* Subtitle - Responsive */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed font-light max-w-4xl mx-auto px-4">
            {subtitle}
          </p>
          
          {/* Description - Responsive */}
          <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto leading-relaxed font-normal px-4">
            {heroDescription}
          </p>
          
          {/* CTA buttons - Fully responsive */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-10 md:mb-12 px-4">
            <Link to="/register" className="group w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-300 rounded-xl sm:rounded-2xl border-0 font-semibold">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base md:text-lg">{registerText}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/partner/request" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 h-12 sm:h-14 md:h-16 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 rounded-xl sm:rounded-2xl font-semibold text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-400 transition-all duration-300">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base md:text-lg">Demander l'accès partenaire</span>
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators - Responsive */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-medium text-xs sm:text-sm">Certifié ISO 27001</span>
            </div>
            <div className="hidden sm:block w-px h-4 sm:h-6 bg-slate-300 dark:bg-slate-600"></div>
            <span className="font-medium text-xs sm:text-sm text-center">Conforme RGPD</span>
            <div className="hidden sm:block w-px h-4 sm:h-6 bg-slate-300 dark:bg-slate-600"></div>
            <span className="font-medium text-xs sm:text-sm text-center">Partenaire Ministère de la Santé</span>
          </div>
        </div>
      </div>
    </section>
  );
};
