import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  Search, 
  Filter,
  AlertTriangle, 
  Heart, 
  FileText, 
  Users,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'orphanage_pending':
      return <Heart className="h-5 w-5 text-blue-500" />;
    case 'malnutrition_alert':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'document_expiry':
      return <FileText className="h-5 w-5 text-orange-500" />;
    case 'capacity_alert':
      return <Users className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <Badge variant="destructive">Critique</Badge>;
    case 'high':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Élevée</Badge>;
    case 'medium':
      return <Badge variant="secondary">Moyenne</Badge>;
    case 'low':
      return <Badge variant="outline">Faible</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

export const NotificationCenter = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userRole, setUserRole] = useState<string | null>(null);

  // On récupère le rôle à l'ouverture
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // On va chercher le rôle via la table users
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!error && data?.role) setUserRole(data.role);
      }
    };
    fetchRole();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // onglet courant
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'unread' && !notification.is_read) ||
                      (activeTab === 'read' && notification.is_read) ||
                      (activeTab === notification.type);
    
    return matchesSearch && matchesTab;
  });

  // Définition des tabs et stats selon le rôle
  // --- Admin : tout voir, Partenaire : seulement les deux alertes principales
  const tabsToShow = userRole === "partner"
    ? [
        { value: "all", label: "Toutes", badge: notifications.length, variant: "secondary" as const },
        { value: "unread", label: "Non lues", badge: notifications.filter(n => !n.is_read).length, variant: "destructive" as const },
        { value: "read", label: "Lues" },
        { value: "malnutrition_alert", label: "Malnutrition" },
        { value: "capacity_alert", label: "Capacité" }
      ]
    : [
        { value: "all", label: "Toutes", badge: notifications.length, variant: "secondary" as const },
        { value: "unread", label: "Non lues", badge: notifications.filter(n => !n.is_read).length, variant: "destructive" as const },
        { value: "read", label: "Lues" },
        { value: "orphanage_pending", label: "Orphelinats en attente" },
        { value: "malnutrition_alert", label: "Malnutrition" },
        { value: "document_expiry", label: "Documents" },
        { value: "capacity_alert", label: "Capacité" }
      ];

  // Pour les cartes stats
  const notificationTypes = userRole === "partner"
    ? [
        { key: 'malnutrition_alert', label: 'Alertes malnutrition', count: notifications.filter(n => n.type === 'malnutrition_alert').length },
        { key: 'capacity_alert', label: 'Alertes capacité', count: notifications.filter(n => n.type === 'capacity_alert').length },
      ]
    : [
        { key: 'orphanage_pending', label: 'Orphelinats en attente', count: notifications.filter(n => n.type === 'orphanage_pending').length },
        { key: 'malnutrition_alert', label: 'Alertes malnutrition', count: notifications.filter(n => n.type === 'malnutrition_alert').length },
        { key: 'document_expiry', label: 'Documents à renouveler', count: notifications.filter(n => n.type === 'document_expiry').length },
        { key: 'capacity_alert', label: 'Alertes capacité', count: notifications.filter(n => n.type === 'capacity_alert').length },
      ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centre de notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans les notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.is_read)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          </div>

          {/* TabsList avec style flex adaptatif */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabsToShow.length}, 1fr)` }}>
              {tabsToShow.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  {tab.label}
                  {typeof tab.badge === "number" && <Badge variant={tab.variant || "secondary"}>{tab.badge}</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-96 w-full rounded-md border">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'Aucune notification trouvée' : 'Aucune notification'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredNotifications.map((notification, index) => (
                      <div
                        key={notification.id}
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
                                    onClick={() => markAsRead(notification.id)}
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
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stat cards dynamiques selon le rôle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notificationTypes.map((type) => (
          <Card key={type.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{type.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{type.count}</p>
                </div>
                {getNotificationIcon(type.key)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
