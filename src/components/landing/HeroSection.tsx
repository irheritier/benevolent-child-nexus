
import { Button } from "@/components/ui/button";
import { UserPlus, MapPin, Globe } from "lucide-react";
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
              {title}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed font-light">
            {subtitle}
          </p>
          
          <p className="text-lg text-muted-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-4 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all">
                <UserPlus className="w-5 h-5 mr-2" />
                {registerText}
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14 border-2 hover:bg-primary/5">
              <MapPin className="w-5 h-5 mr-2" />
              {exploreMapText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
