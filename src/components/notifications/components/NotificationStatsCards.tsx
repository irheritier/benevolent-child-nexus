
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
    <div className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg">
      {stats.map((type, index) => (
        <React.Fragment key={type.key}>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex items-center gap-2">
              {getNotificationIcon(type.key)}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">{type.label}</span>
                <span className="text-lg font-bold text-gray-900">{type.count}</span>
              </div>
            </div>
          </div>
          {index < stats.length - 1 && (
            <div className="h-8 w-px bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
