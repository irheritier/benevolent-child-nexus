
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';
import { getNotificationIcon, getPriorityBadge } from '../utils/notificationUtils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  return (
    <div
      className={`p-4 border-b hover:bg-gray-50 transition-colors ${
        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            {getPriorityBadge(notification.priority)}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: fr
              })}
            </p>
            
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-7 px-2 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Marquer comme lu
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
