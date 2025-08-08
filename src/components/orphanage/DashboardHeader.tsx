
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, Shield, Bell, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Orphanage {
  id: string;
  name: string;
  province: string;
  city: string;
  province_id: string;
  city_id: string;
  address?: string;
  contact_person: string;
  phone?: string;
  email?: string;
  description?: string;
  child_capacity?: number;
  children_total?: number;
  boys_count?: number;
  girls_count?: number;
  schooling_rate?: number;
  annual_disease_rate?: number;
  meals_per_day?: number;
  legal_status?: 'pending' | 'verified' | 'rejected';
  created_at?: string;
  updated_at?: string;
  documents?: any;
  photo_url?: string;
  location_gps?: any;
  dhis2_orgunit_id?: string;
  created_by?: string;
}

interface DashboardHeaderProps {
  user: User | null;
  orphanage: Orphanage;
  onLogout: () => void;
}

const DashboardHeader = ({ user, orphanage, onLogout }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs">Vérifié</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 text-xs">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-xs">Rejeté</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <header className="border-b bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/70 sticky top-0 z-50 shadow-lg border-primary/10 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 sm:space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          {/* <div className="relative">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
          </div> */}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent truncate">
              {orphanage.name}
            </h1>
            <p className="text-xs font-semibold tracking-wide uppercase text-slate-600 dark:text-slate-400 truncate">
              {orphanage.city}, {orphanage.province}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-48">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(orphanage.legal_status)}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold px-3 sm:px-6 rounded-xl text-xs sm:text-sm"
            onClick={onLogout}
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Déconnexion</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
