
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Download, Users, Building, MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalOrphanages: number;
  totalChildren: number;
  totalProvinces: number;
  verifiedOrphanages: number;
}

const PartnerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/partner/auth');
        return;
      }

      // Vérifier le rôle
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'partner') {
        navigate('/partner/auth');
        return;
      }

      setUserEmail(session.user.email || '');
      
      // Logger l'accès
      await supabase.rpc('log_partner_access', {
        action_type: 'dashboard_access',
        resource_accessed: '/partner/dashboard'
      });

      // Charger les statistiques publiques
      const { data: publicStats } = await supabase
        .from('public_stats')
        .select('*')
        .single();

      if (publicStats) {
        setStats({
          totalOrphanages: publicStats.total_orphanages || 0,
          totalChildren: publicStats.total_children || 0,
          totalProvinces: publicStats.total_provinces || 0,
          verifiedOrphanages: publicStats.verified_orphanages || 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.rpc('log_partner_access', {
        action_type: 'logout',
        resource_accessed: '/partner/dashboard'
      });
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDataExport = async (dataType: string) => {
    try {
      await supabase.rpc('log_partner_access', {
        action_type: 'data_export',
        resource_accessed: dataType
      });

      toast({
        title: "Export en cours",
        description: `Préparation de l'export des données ${dataType}...`,
      });

      // Ici, vous pourriez implémenter la logique d'export réelle
      // Pour l'instant, on simule juste l'action
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Portail Partenaire
              </h1>
              <Badge variant="secondary">Accès données</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tableau de bord des données
          </h2>
          <p className="text-gray-600">
            Accédez aux statistiques et données des orphelinats de la RDC
          </p>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orphelinats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalOrphanages || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enfants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalChildren || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Provinces</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProvinces || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orphelinats Vérifiés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.verifiedOrphanages || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exports de données */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Export des données d'orphelinats</CardTitle>
              <CardDescription>
                Téléchargez les données des orphelinats au format CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleDataExport('orphelinats')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger les données d'orphelinats
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export des statistiques par province</CardTitle>
              <CardDescription>
                Téléchargez les statistiques agrégées par province
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleDataExport('statistiques_provinces')}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger les statistiques
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informations d'utilisation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Conditions d'utilisation des données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Les données fournies sont à des fins de recherche et d'analyse uniquement.</p>
              <p>• La redistribution des données est interdite sans autorisation préalable.</p>
              <p>• Toute publication basée sur ces données doit citer la source appropriée.</p>
              <p>• L'utilisation commerciale des données est strictement interdite.</p>
              <p>• En cas de questions, contactez l'équipe administrative.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;
