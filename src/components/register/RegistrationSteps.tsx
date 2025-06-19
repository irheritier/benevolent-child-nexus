
import { CheckCircle } from "lucide-react";

interface RegistrationStepsProps {
  currentStep: number;
  texts: {
    steps: {
      info: string;
      documents: string;
      confirmation: string;
    };
  };
}

export const RegistrationSteps = ({ currentStep, texts }: RegistrationStepsProps) => {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto pb-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              currentStep === step 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg scale-110' 
                : currentStep > step 
                  ? 'bg-green-500 border-green-500 text-white shadow-md'
                  : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800'
            }`}>
              {currentStep > step ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <span className="text-xs sm:text-sm font-bold">{step}</span>
              )}
            </div>
            <div className="ml-3 sm:ml-4 hidden sm:block">
              <p className={`text-xs sm:text-sm font-semibold ${
                currentStep >= step ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {step === 1 && texts.steps.info}
                {step === 2 && texts.steps.documents}
                {step === 3 && texts.steps.confirmation}
              </p>
            </div>
            {step < 3 && (
              <div className={`w-16 sm:w-20 h-px mx-4 sm:mx-6 transition-colors hidden lg:block ${
                currentStep > step ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile step labels */}
      <div className="text-center mt-4 sm:hidden">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {currentStep === 1 && texts.steps.info}
          {currentStep === 2 && texts.steps.documents}
          {currentStep === 3 && texts.steps.confirmation}
        </p>
      </div>
    </div>
  );
};
