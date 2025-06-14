
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  Heart, 
  FileText, 
  Users,
  Shield,
  CheckCircle2,
  X,
  ExternalLink,
  Building
} from 'lucide-react';

interface NotificationListProps {
  onClose?: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'orphanage_pending':
      return <Heart className="h-4 w-4 text-blue-500" />;
    case 'partner_request_pending':
      return <Building className="h-4 w-4 text-purple-500" />;
    case 'malnutrition_alert':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'document_expiry':
      return <FileText className="h-4 w-4 text-orange-500" />;
    case 'capacity_alert':
      return <Users className="h-4 w-4 text-yellow-500" />;
    case 'health_disease_outbreak':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'health_vaccination_gap':
      return <Shield className="h-4 w-4 text-orange-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const NotificationList = ({ onClose }: NotificationListProps) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const recentNotifications = notifications.slice(0, 10);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="font-medium">Notifications</span>
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadNotifications.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 px-2 text-xs"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-96">
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority === 'critical' ? 'Critique' :
                         notification.priority === 'high' ? 'Élevée' :
                         notification.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                      
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        {notifications.length > 10 && (
          <Link to="/admin/notifications" onClick={onClose}>
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir toutes les notifications ({notifications.length})
            </Button>
          </Link>
        )}
        {notifications.length > 0 && (
          <Link to="/admin/notifications" onClick={onClose}>
            <Button variant="ghost" className="w-full" size="sm">
              Gérer les notifications
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
