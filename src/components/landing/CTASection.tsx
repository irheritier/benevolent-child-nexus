
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
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
