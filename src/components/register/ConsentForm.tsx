
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Heart } from "lucide-react";

interface ConsentFormProps {
  texts: any;
  consentChecked: boolean;
  onConsentChange: (checked: boolean) => void;
}

export const ConsentForm = ({ texts, consentChecked, onConsentChange }: ConsentFormProps) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 sm:mr-4">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          {texts.consent.title}
        </h3>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => onConsentChange(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer text-sm sm:text-base">
              {texts.consent.declaration}
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <Checkbox id="privacy" />
            <Label htmlFor="privacy" className="text-slate-700 dark:text-slate-300 cursor-pointer text-sm sm:text-base">
              {texts.consent.privacy}
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-slate-700 dark:text-slate-300 cursor-pointer text-sm sm:text-base">
              {texts.consent.terms}
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 sm:p-8 text-center border border-purple-200 dark:border-purple-800">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
          Prêt à rejoindre FCS ?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          Votre demande sera examinée par notre équipe dans les 48 heures.
        </p>
      </div>
    </div>
  );
};
