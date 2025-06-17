
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export const AdminDashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/auth');
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              FCS : Find Children to Save
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">
              Administration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationBell />
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="flex items-center gap-2 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
};
