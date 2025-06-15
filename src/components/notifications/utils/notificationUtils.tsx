
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Heart, 
  FileText, 
  Users
} from 'lucide-react';

export const getNotificationIcon = (type: string) => {
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

export const getPriorityBadge = (priority: string) => {
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

export const getTabsConfiguration = (userRole: string | null, notifications: any[]) => {
  const baseStats = {
    all: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    malnutrition_alert: notifications.filter(n => n.type === 'malnutrition_alert').length,
    capacity_alert: notifications.filter(n => n.type === 'capacity_alert').length,
  };

  if (userRole === "partner") {
    return {
      tabs: [
        { value: "all", label: "Toutes", badge: baseStats.all, variant: "secondary" as const },
        { value: "unread", label: "Non lues", badge: baseStats.unread, variant: "destructive" as const },
        { value: "read", label: "Lues" },
        { value: "malnutrition_alert", label: "Malnutrition" },
        { value: "capacity_alert", label: "Capacité" }
      ],
      stats: [
        { key: 'malnutrition_alert', label: 'Alertes malnutrition', count: baseStats.malnutrition_alert },
        { key: 'capacity_alert', label: 'Alertes capacité', count: baseStats.capacity_alert },
      ]
    };
  }

  const adminStats = {
    ...baseStats,
    orphanage_pending: notifications.filter(n => n.type === 'orphanage_pending').length,
    document_expiry: notifications.filter(n => n.type === 'document_expiry').length,
  };

  return {
    tabs: [
      { value: "all", label: "Toutes", badge: adminStats.all, variant: "secondary" as const },
      { value: "unread", label: "Non lues", badge: adminStats.unread, variant: "destructive" as const },
      { value: "read", label: "Lues" },
      { value: "orphanage_pending", label: "Orphelinats en attente" },
      { value: "malnutrition_alert", label: "Malnutrition" },
      { value: "document_expiry", label: "Documents" },
      { value: "capacity_alert", label: "Capacité" }
    ],
    stats: [
      { key: 'orphanage_pending', label: 'Orphelinats en attente', count: adminStats.orphanage_pending },
      { key: 'malnutrition_alert', label: 'Alertes malnutrition', count: adminStats.malnutrition_alert },
      { key: 'document_expiry', label: 'Documents à renouveler', count: adminStats.document_expiry },
      { key: 'capacity_alert', label: 'Alertes capacité', count: adminStats.capacity_alert },
    ]
  };
};
