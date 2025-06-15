
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getNotificationIcon } from '../utils/notificationUtils';

interface StatType {
  key: string;
  label: string;
  count: number;
}

interface NotificationStatsCardsProps {
  stats: StatType[];
}

export const NotificationStatsCards = ({ stats }: NotificationStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((type) => (
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
  );
};
