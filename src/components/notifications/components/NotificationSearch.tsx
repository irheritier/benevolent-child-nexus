
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2 } from 'lucide-react';

interface NotificationSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onMarkAllAsRead: () => void;
  hasUnreadNotifications: boolean;
}

export const NotificationSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onMarkAllAsRead, 
  hasUnreadNotifications 
}: NotificationSearchProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher dans les notifications..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant="outline"
        onClick={onMarkAllAsRead}
        disabled={!hasUnreadNotifications}
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Tout marquer comme lu
      </Button>
    </div>
  );
};
