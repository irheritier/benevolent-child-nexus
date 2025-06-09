
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  adminLoginText: string;
}

export const Header = ({ language, setLanguage, adminLoginText }: HeaderProps) => {
  return (
    <header className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Congo ChildNet
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Protection • Suivi • Dignité</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                language === 'fr' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                language === 'en' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              EN
            </button>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden md:flex">
            <LogIn className="w-4 h-4 mr-2" />
            {adminLoginText}
          </Button>
        </div>
      </div>
    </header>
  );
};
