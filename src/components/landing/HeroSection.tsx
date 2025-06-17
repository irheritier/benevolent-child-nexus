
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
    <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold mb-8 border border-blue-200/50 shadow-lg">
            <Globe className="w-5 h-5 mr-3" />
            <span className="mr-2">Plateforme Nationale</span>
            <span className="w-2 h-2 bg-blue-400 rounded-full mx-2"></span>
            <span>République Démocratique du Congo</span>
          </div>
          
          {/* Main title with enhanced styling */}
          <h1 className="text-6xl md:text-8xl font-black text-slate-800 mb-8 leading-tight tracking-tight">
            <span className="block text-3xl md:text-4xl font-bold text-blue-600 mb-4 tracking-wider">
              FCS
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent block text-4xl md:text-6xl">
              Find Children To Save
            </span>
          </h1>
          
          {/* Subtitle with better typography */}
          <p className="text-2xl md:text-3xl text-slate-600 mb-8 leading-relaxed font-light max-w-4xl mx-auto">
            {subtitle}
          </p>
          
          {/* Description with improved spacing */}
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-4xl mx-auto leading-relaxed font-normal">
            {heroDescription}
          </p>
          
          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/register" className="group">
              <Button size="lg" className="text-lg px-10 py-6 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl border-0 font-semibold">
                <UserPlus className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                {registerText}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 h-16 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 rounded-2xl font-semibold text-slate-700 hover:text-blue-700 transition-all duration-300">
              <MapPin className="w-6 h-6 mr-3" />
              {exploreMapText}
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-medium">Certifié ISO 27001</span>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <span className="font-medium">Conforme RGPD</span>
            <div className="w-px h-6 bg-slate-300"></div>
            <span className="font-medium">Partenaire Ministère de la Santé</span>
          </div>
        </div>
      </div>
    </section>
  );
};
