
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  adminLoginText: string;
}

export const Header = ({ language, setLanguage, adminLoginText }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70 sticky top-0 z-50 shadow-lg border-primary/10">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
            <p className="text-xs text-slate-600 font-semibold tracking-wide uppercase">Find Children To Save</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex space-x-1 bg-slate-100 rounded-xl p-1.5 shadow-inner">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                language === 'fr' 
                  ? 'bg-white text-blue-600 shadow-md border border-blue-100' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                language === 'en' 
                  ? 'bg-white text-blue-600 shadow-md border border-blue-100' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              EN
            </button>
          </div>
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold px-6 rounded-xl"
            onClick={() => navigate('/admin/auth')}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {adminLoginText}
          </Button>
        </div>
      </div>
    </header>
  );
};
