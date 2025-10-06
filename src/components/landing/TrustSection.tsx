
import { Award, Shield, CheckCircle } from "lucide-react";

interface TrustSectionProps {
  trust: {
    title: string;
    subtitle: string;
    ministry: string;
    security: string;
    gdpr: string;
    officialCertification: string;
    maximumProtection: string;
    internationalCompliance: string;
  };
}

export const TrustSection = ({ trust }: TrustSectionProps) => {
  return (
    <section className="py-12 sm:py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-4">{trust.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">{trust.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="text-center p-4 sm:p-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Award className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">{trust.ministry}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{trust.officialCertification}</p>
          </div>
          
          <div className="text-center p-4 sm:p-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">{trust.security}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{trust.maximumProtection}</p>
          </div>
          
          <div className="text-center p-4 sm:p-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">{trust.gdpr}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{trust.internationalCompliance}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
