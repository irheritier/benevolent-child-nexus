
import { Award, Shield, CheckCircle } from "lucide-react";

interface TrustSectionProps {
  trust: {
    title: string;
    subtitle: string;
    ministry: string;
    security: string;
    gdpr: string;
  };
}

export const TrustSection = ({ trust }: TrustSectionProps) => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">{trust.title}</h2>
          <p className="text-lg text-muted-foreground">{trust.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-2">{trust.ministry}</h3>
            <p className="text-sm text-muted-foreground">Certification officielle</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-2">{trust.security}</h3>
            <p className="text-sm text-muted-foreground">Protection maximale</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-foreground mb-2">{trust.gdpr}</h3>
            <p className="text-sm text-muted-foreground">Conformité internationale</p>
          </div>
        </div>
      </div>
    </section>
  );
};
