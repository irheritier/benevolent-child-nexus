
import { Activity, Shield, MapPin } from "lucide-react";

interface FeaturesSectionProps {
  features: {
    title: string;
    subtitle: string;
    tracking: string;
    trackingDesc: string;
    security: string;
    securityDesc: string;
    sync: string;
    syncDesc: string;
    map: string;
    mapDesc: string;
  };
}

export const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">{features.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {features.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="group text-center p-4 sm:p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{features.tracking}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{features.trackingDesc}</p>
          </div>
          
          <div className="group text-center p-4 sm:p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{features.security}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{features.securityDesc}</p>
          </div>
          
          <div className="group text-center p-4 sm:p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{features.sync}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{features.syncDesc}</p>
          </div>
          
          <div className="group text-center p-4 sm:p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{features.map}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{features.mapDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
