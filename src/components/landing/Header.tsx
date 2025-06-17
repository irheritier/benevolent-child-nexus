
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  adminLoginText: string;
}

export const Header = ({ language, setLanguage, adminLoginText }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const loginText = language === 'fr' ? 'Connexion' : 'Login';
  
  // Déterminer la route de connexion basée sur la page actuelle
  const getLoginRoute = () => {
    if (location.pathname.includes('/partner')) {
      return '/partner/auth';
    }
    return '/orphelinat/auth';
  };

  // Déterminer le texte du bouton de connexion
  const getLoginButtonText = () => {
    if (location.pathname.includes('/partner')) {
      return 'Connexion Partenaire';
    }
    return loginText;
  };

  return (
    <header className="border-b bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/70 sticky top-0 z-50 shadow-lg border-primary/10 dark:border-slate-700/50">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div 
          className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              FCS
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">Find Children To Save</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 shadow-inner">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                language === 'fr' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-blue-100 dark:border-blue-800' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                language === 'en' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-blue-100 dark:border-blue-800' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              EN
            </button>
          </div>
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 font-semibold px-6 rounded-xl"
            onClick={() => navigate(getLoginRoute())}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {getLoginButtonText()}
          </Button>
        </div>
      </div>
    </header>
  );
};
