
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
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
          {/* Brand section - Responsive */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                  <Heart className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Shield className="w-2 h-2 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FCTS
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wide">Find The Children To Save</p>
                <p className="text-xs text-slate-500 mt-1">Protection • Suivi • Dignité</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg max-w-md">
              {footer.aboutText}
            </p>
            
            {/* Contact info - Responsive */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 text-slate-400 text-sm sm:text-base">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <span>contact@fcts.life</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm sm:text-base">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <span>+243 842 354 044</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <span>Kinshasa, République Démocratique du Congo</span>
              </div>
            </div>
          </div>
          
          {/* Links section - Responsive */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">{footer.links}</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-sm sm:text-base">{footer.privacy}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-sm sm:text-base">{footer.terms}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-sm sm:text-base">{footer.contact}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-sm sm:text-base">API Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors font-medium text-sm sm:text-base">Support</a></li>
            </ul>
          </div>
          
          {/* Partners section - Responsive */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-4 sm:mb-6 text-base sm:text-lg">{footer.partners}</h4>
            <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              {footer.partnersText}
            </p>
            
            {/* Partner logos - Responsive grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section - Responsive */}
        <div className="border-t border-slate-700 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 font-medium text-xs sm:text-sm text-center md:text-left">
            © 2024 FCTS : Find The Children To Save. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 sm:space-x-6 text-slate-400">
            <span className="flex items-center gap-2 text-xs sm:text-sm">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              <span className="font-medium">Fait avec amour pour les enfants du Congo</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
