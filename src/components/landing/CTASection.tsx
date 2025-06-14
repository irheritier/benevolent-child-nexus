
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-20 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Rejoignez notre mission
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Que vous soyez un orphelinat ou un partenaire de recherche, 
          contribuez à améliorer la vie des enfants vulnérables en RDC.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Enregistrer un orphelinat
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/partner/request">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
              Demander l'accès partenaire
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/partner/auth" className="text-blue-100 hover:text-white text-sm underline">
            Déjà partenaire ? Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
};
