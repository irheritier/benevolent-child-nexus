
import { Heart, Shield, Globe } from "lucide-react";

interface FooterProps {
  footer: {
    aboutText: string;
    links: string;
    privacy: string;
    terms: string;
    contact: string;
    partners: string;
    partnersText: string;
  };
}

export const Footer = ({ footer }: FooterProps) => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Congo ChildNet</h3>
                <p className="text-sm text-muted-foreground">Protection • Suivi • Dignité</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {footer.aboutText}
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">{footer.links}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{footer.privacy}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{footer.terms}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{footer.contact}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">{footer.partners}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {footer.partnersText}
            </p>
          </div>
        </div>
        
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 Congo ChildNet. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Fait avec ❤️ pour les enfants du Congo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
