
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from "@/integrations/supabase/client";
import { getTabsConfiguration } from './utils/notificationUtils';
import { NotificationTabs } from './components/NotificationTabs';
import { NotificationSearch } from './components/NotificationSearch';
import { NotificationsList } from './components/NotificationsList';
import { NotificationStatsCards } from './components/NotificationStatsCards';

export const NotificationCenter = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
    
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'unread' && !notification.is_read) ||
                      (activeTab === 'read' && notification.is_read) ||
                      (activeTab === notification.type);
    
    return matchesSearch && matchesTab;
  });

  const { tabs, stats } = getTabsConfiguration(userRole, notifications);

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
          <NotificationSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onMarkAllAsRead={markAllAsRead}
            hasUnreadNotifications={notifications.some(n => !n.is_read)}
          />

          <NotificationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          >
            <NotificationsList
              notifications={filteredNotifications}
              searchTerm={searchTerm}
              onMarkAsRead={markAsRead}
            />
          </NotificationTabs>
        </CardContent>
      </Card>

      <NotificationStatsCards stats={stats} />
    </div>
  );
};
