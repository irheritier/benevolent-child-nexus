
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminNotifications = () => {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour au tableau de bord
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">
                  Gestion des notifications
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NotificationCenter />
        </div>
      </div>
    </NotificationProvider>
  );
};

export default AdminNotifications;
