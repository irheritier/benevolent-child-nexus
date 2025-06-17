
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CTASectionProps {
  registerText: string;
  exploreMapText: string;
}

export const CTASection = ({ registerText, exploreMapText }: CTASectionProps) => {
  return (
    <section className="py-20 bg-blue-600 dark:bg-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Rejoignez notre mission
        </h2>
        <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
          Que vous soyez un orphelinat ou un partenaire de recherche, 
          contribuez à améliorer la vie des enfants vulnérables en RDC.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              {registerText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/partner/request">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600 dark:text-blue-100 dark:border-blue-200 dark:hover:bg-blue-100 dark:hover:text-blue-800">
              Demander l'accès partenaire
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/partner/auth" className="text-blue-100 hover:text-white dark:text-blue-200 dark:hover:text-blue-50 text-sm underline">
            Déjà partenaire ? Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
};
