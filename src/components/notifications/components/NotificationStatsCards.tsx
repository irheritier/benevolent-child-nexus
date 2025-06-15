
import React from 'react';
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
    <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 rounded-lg">
      {stats.map((type, index) => (
        <div key={type.key} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {getNotificationIcon(type.key)}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">{type.label}</span>
              <span className="text-lg font-bold text-gray-900">{type.count}</span>
            </div>
          </div>
          {index < stats.length - 1 && (
            <div className="h-8 w-px bg-gray-300 ml-4" />
          )}
        </div>
      ))}
    </div>
  );
};
