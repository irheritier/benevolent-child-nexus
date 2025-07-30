import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppButtonProps {
  groupUrl: string;
}

export const WhatsAppButton = ({ groupUrl }: WhatsAppButtonProps) => {
  const handleClick = () => {
    window.open(groupUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50 group"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-200" />
    </Button>
  );
};

// Export par défaut pour la compatibilité
export default WhatsAppButton;