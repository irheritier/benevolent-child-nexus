
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface CTASectionProps {
  registerText: string;
  exploreMapText: string;
}

export const CTASection = ({ registerText, exploreMapText }: CTASectionProps) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary via-primary to-primary/90 relative overflow-hidden">
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
                {registerText}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-14 border-2 border-white/30 text-primary-foreground hover:bg-white/10">
              <MapPin className="w-5 h-5 mr-2" />
              {exploreMapText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
