
import { Heart, Shield, Globe, Mail, Phone, MapPin } from "lucide-react";

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
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section with enhanced styling */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Heart className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FCS
                </h3>
                <p className="text-sm text-slate-400 font-semibold tracking-wide">Find Children To Save</p>
                <p className="text-xs text-slate-500 mt-1">Protection • Suivi • Dignité</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-8 text-lg max-w-md">
              {footer.aboutText}
            </p>
            
            {/* Contact info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>contact@fcs-congo.org</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+243 XXX XXX XXX</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Kinshasa, République Démocratique du Congo</span>
              </div>
            </div>
          </div>
          
          {/* Links section */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">{footer.links}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">{footer.privacy}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">{footer.terms}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">{footer.contact}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">API Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">Support</a></li>
            </ul>
          </div>
          
          {/* Partners section */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">{footer.partners}</h4>
            <p className="text-slate-300 leading-relaxed mb-6">
              {footer.partnersText}
            </p>
            
            {/* Partner logos placeholder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-slate-400" />
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-slate-400" />
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section with enhanced styling */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 mb-4 md:mb-0 font-medium">
            © 2024 FCS : Find Children To Save. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-6 text-slate-400">
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="font-medium">Fait avec amour pour les enfants du Congo</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
