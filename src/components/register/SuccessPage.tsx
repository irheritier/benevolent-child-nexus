
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

interface SuccessPageProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  texts: any;
}

export const SuccessPage = ({ language, setLanguage, texts }: SuccessPageProps) => {
  const footerTexts = {
    aboutText: "FCTS : Find The Children To Save est une plateforme dédiée au suivi et à la protection des enfants vulnérables en République Démocratique du Congo. Notre mission est d'améliorer le bien-être des enfants grâce à une meilleure coordination entre les centres d'accueil.",
    links: "Liens utiles",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    contact: "Contact",
    partners: "Partenaires",
    partnersText: "Nous travaillons en étroite collaboration avec le Ministère des Affaires Sociales, les ONG locales et internationales pour assurer le meilleur suivi possible des enfants."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 flex flex-col">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminLoginText={texts.adminLoginText}
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 px-4">{texts.validation.success}</h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-12 leading-relaxed px-4">
              {texts.validation.pending}
            </p>
            
            <Link to="/">
              <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl rounded-xl w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                {texts.backHome}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer footer={footerTexts} />
    </div>
  );
};
