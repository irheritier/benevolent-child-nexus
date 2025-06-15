
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Tab {
  value: string;
  label: string;
  badge?: number;
  variant?: "secondary" | "destructive" | "default" | "outline";
}

interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tabs: Tab[];
  children: React.ReactNode;
}

export const NotificationTabs = ({ activeTab, onTabChange, tabs, children }: NotificationTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
            {tab.label}
            {typeof tab.badge === "number" && <Badge variant={tab.variant || "secondary"}>{tab.badge}</Badge>}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};
