
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CTASectionProps {
  registerText: string;
  exploreMapText: string;
  partnerAccessText: string;
  alreadyPartnerText: string;
  joinMissionText: string;
  joinDescriptionText: string;
}

export const CTASection = ({ registerText, exploreMapText, partnerAccessText, alreadyPartnerText, joinMissionText, joinDescriptionText }: CTASectionProps) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-blue-600 dark:bg-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-4">
          {joinMissionText}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-blue-100 dark:text-blue-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          {joinDescriptionText}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto px-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14">
              {registerText}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Link to="/partner/request" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600 dark:text-blue-100 dark:border-blue-200 dark:hover:bg-blue-100 dark:hover:text-blue-800 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14">
              {partnerAccessText}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
        <div className="mt-4 sm:mt-6">
          <Link to="/partner/auth" className="text-blue-100 hover:text-white dark:text-blue-200 dark:hover:text-blue-50 text-xs sm:text-sm underline">
            {alreadyPartnerText}
          </Link>
        </div>
      </div>
    </section>
  );
};
