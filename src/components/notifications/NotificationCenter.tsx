
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Bell } from 'lucide-react';
// import { useNotifications } from '@/contexts/NotificationContext';
// import { supabase } from "@/integrations/supabase/client";
// import { getTabsConfiguration } from './utils/notificationUtils';
// import { NotificationTabs } from './components/NotificationTabs';
// import { NotificationSearch } from './components/NotificationSearch';
// import { NotificationsList } from './components/NotificationsList';
// import { NotificationStatsCards } from './components/NotificationStatsCards';

// export const NotificationCenter = () => {
//   const { notifications, markAsRead, markAllAsRead } = useNotifications();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState('all');
//   const [userRole, setUserRole] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchRole = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         const { data, error } = await supabase
//           .from('users')
//           .select('role')
//           .eq('id', user.id)
//           .single();
//         if (!error && data?.role) setUserRole(data.role);
//       }
//     };
//     fetchRole();
//   }, []);

//   const filteredNotifications = notifications.filter(notification => {
//     const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesTab = activeTab === 'all' ||
//                       (activeTab === 'unread' && !notification.is_read) ||
//                       (activeTab === 'read' && notification.is_read) ||
//                       (activeTab === notification.type);
    
//     return matchesSearch && matchesTab;
//   });

//   const { tabs, stats } = getTabsConfiguration(userRole, notifications);

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Bell className="h-5 w-5" />
//             Centre de notifications
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <NotificationSearch
//             searchTerm={searchTerm}
//             onSearchChange={setSearchTerm}
//             onMarkAllAsRead={markAllAsRead}
//             hasUnreadNotifications={notifications.some(n => !n.is_read)}
//           />

//           <NotificationTabs
//             activeTab={activeTab}
//             onTabChange={setActiveTab}
//             tabs={tabs}
//           >
//             <NotificationsList
//               notifications={filteredNotifications}
//               searchTerm={searchTerm}
//               onMarkAsRead={markAsRead}
//             />
//           </NotificationTabs>
//         </CardContent>
//       </Card>

//       <NotificationStatsCards stats={stats} />
//     </div>
//   );
// };


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
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

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
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Bell className="h-5 w-5" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Centre de notifications
              </motion.span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <NotificationSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onMarkAllAsRead={markAllAsRead}
                hasUnreadNotifications={notifications.some(n => !n.is_read)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <NotificationStatsCards stats={stats} />
      </motion.div>
    </motion.div>
  );
};