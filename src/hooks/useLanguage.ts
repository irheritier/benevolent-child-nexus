
import { useState } from "react";

export const useLanguage = () => {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  
  return { language, setLanguage };
};
