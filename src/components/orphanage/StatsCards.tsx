
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';

interface Child {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  estimated_age: number | null;
  entry_date: string | null;
  parent_status: string;
  internal_code: string | null;
  created_at: string;
}

interface Orphanage {
  id: string;
  name: string;
  province: string;
  city: string;
  contact_person: string;
  phone: string;
  email: string;
  legal_status: string;
  child_capacity: number;
  created_at: string;
}

interface StatsCardsProps {
  children: Child[];
  orphanage: Orphanage;
}

const StatsCards = ({ children, orphanage }: StatsCardsProps) => {
  const totalChildren = children.length;
  const boysCount = children.filter(child => child.gender === 'M').length;
  const girlsCount = children.filter(child => child.gender === 'F').length;
  const capacityUsage = orphanage.child_capacity 
    ? Math.round((totalChildren / orphanage.child_capacity) * 100) 
    : 0;

  // Calculer les nouvelles arrivées ce mois
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newThisMonth = children.filter(child => {
    if (!child.entry_date) return false;
    const entryDate = new Date(child.entry_date);
    return entryDate >= thisMonth;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-blue-950/10 dark:border dark:border-blue-900/20">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 dark:bg-blue-400/5 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enfants hébergés</CardTitle>
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalChildren}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Capacité: {orphanage.child_capacity || 'Non définie'} {orphanage.child_capacity && `(${capacityUsage}%)`}
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/20 dark:via-slate-900 dark:to-green-950/10 dark:border dark:border-green-900/20">
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 dark:bg-green-400/5 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Garçons</CardTitle>
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{boysCount}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {totalChildren > 0 ? Math.round((boysCount / totalChildren) * 100) : 0}% du total
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-pink-50 via-white to-pink-50/50 dark:from-pink-950/20 dark:via-slate-900 dark:to-pink-950/10 dark:border dark:border-pink-900/20">
        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 dark:bg-pink-400/5 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filles</CardTitle>
          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{girlsCount}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {totalChildren > 0 ? Math.round((girlsCount / totalChildren) * 100) : 0}% du total
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/10 dark:border dark:border-purple-900/20">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 dark:bg-purple-400/5 rounded-full -mr-10 -mt-10"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nouveaux ce mois</CardTitle>
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{newThisMonth}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Depuis le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
