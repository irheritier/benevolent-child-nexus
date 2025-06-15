
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  searchTerm: string;
  onMarkAsRead: (id: string) => void;
}

export const NotificationsList = ({ notifications, searchTerm, onMarkAsRead }: NotificationsListProps) => {
  return (
    <ScrollArea className="h-96 w-full rounded-md border">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Bell className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm text-gray-500">
            {searchTerm ? 'Aucune notification trouvée' : 'Aucune notification'}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
