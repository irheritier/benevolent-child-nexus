
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';

// interface Child {
//   id: string;
//   full_name: string;
//   gender: string;
//   birth_date: string | null;
//   estimated_age: number | null;
//   entry_date: string | null;
//   parent_status: string;
//   internal_code: string | null;
//   created_at: string;
// }

// interface Orphanage {
//   id: string;
//   name: string;
//   province: string;
//   city: string;
//   province_id: string;
//   city_id: string;
//   address?: string;
//   contact_person: string;
//   phone?: string;
//   email?: string;
//   description?: string;
//   child_capacity?: number;
//   children_total?: number;
//   boys_count?: number;
//   girls_count?: number;
//   schooling_rate?: number;
//   annual_disease_rate?: number;
//   meals_per_day?: number;
//   legal_status?: 'pending' | 'verified' | 'rejected';
//   created_at?: string;
//   updated_at?: string;
//   documents?: any;
//   photo_url?: string;
//   location_gps?: any;
//   dhis2_orgunit_id?: string;
//   created_by?: string;
// }

// interface StatsCardsProps {
//   children: Child[];
//   orphanage: Orphanage;
// }

// const StatsCards = ({ children, orphanage }: StatsCardsProps) => {
//   const totalChildren = children.length;
//   const boysCount = children.filter(child => child.gender === 'M').length;
//   const girlsCount = children.filter(child => child.gender === 'F').length;
//   const capacityUsage = orphanage.child_capacity 
//     ? Math.round((totalChildren / orphanage.child_capacity) * 100) 
//     : 0;

//   // Calculer les nouvelles arrivées ce mois
//   const thisMonth = new Date();
//   thisMonth.setDate(1);
//   const newThisMonth = children.filter(child => {
//     if (!child.entry_date) return false;
//     const entryDate = new Date(child.entry_date);
//     return entryDate >= thisMonth;
//   }).length;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-blue-950/10 dark:border dark:border-blue-900/20">
//         <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 dark:bg-blue-400/5 rounded-full -mr-10 -mt-10"></div>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enfants hébergés</CardTitle>
//           <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//             <Users className="h-5 w-5 text-white" />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalChildren} <span className="text-sm" >Suivi(s) / {`${orphanage.children_total} enfants`}</span> </div>
//           <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//             Capacité: {orphanage.child_capacity || 'Non définie'} {orphanage.child_capacity && `(${capacityUsage}%)`}
//           </p>
//         </CardContent>
//       </Card>

//       <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/20 dark:via-slate-900 dark:to-green-950/10 dark:border dark:border-green-900/20">
//         <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 dark:bg-green-400/5 rounded-full -mr-10 -mt-10"></div>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Garçons</CardTitle>
//           <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
//             <Users className="h-5 w-5 text-white" />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold text-green-600 dark:text-green-400">{boysCount} <span className="text-sm" >Suivi(s) / {`${orphanage.boys_count} garçons`}</span> </div>
//           <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//             {totalChildren > 0 ? Math.round((boysCount / totalChildren) * 100) : 0}% du total
//           </p>
//         </CardContent>
//       </Card>

//       <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-pink-50 via-white to-pink-50/50 dark:from-pink-950/20 dark:via-slate-900 dark:to-pink-950/10 dark:border dark:border-pink-900/20">
//         <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 dark:bg-pink-400/5 rounded-full -mr-10 -mt-10"></div>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filles</CardTitle>
//           <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
//             <Users className="h-5 w-5 text-white" />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{girlsCount} <span className="text-sm" >Suivie(s) / {`${orphanage.girls_count} filles`}</span> </div>
//           <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//             {totalChildren > 0 ? Math.round((girlsCount / totalChildren) * 100) : 0}% du total
//           </p>
//         </CardContent>
//       </Card>

//       <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/10 dark:border dark:border-purple-900/20">
//         <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 dark:bg-purple-400/5 rounded-full -mr-10 -mt-10"></div>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nouveaux ce mois</CardTitle>
//           <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
//             <TrendingUp className="h-5 w-5 text-white" />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{newThisMonth}</div>
//           <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//             Depuis le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default StatsCards;


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

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

interface StatsCardsProps {
  children: Child[];
  orphanage: Orphanage;
  translations: any;
  language: 'fr' | 'en';
}

const StatsCards = ({ children, orphanage, translations, language }: StatsCardsProps) => {
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

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-blue-950/10 dark:border dark:border-blue-900/20 hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 dark:bg-blue-400/5 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{translations.childrenHosted}</CardTitle>
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-3xl font-bold text-blue-600 dark:text-blue-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {totalChildren} <span className="text-sm">{translations.tracked} / {`${orphanage.children_total} ${translations.children}`}</span>
            </motion.div>
            <motion.p 
              className="text-xs text-slate-600 dark:text-slate-400 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {translations.capacity}: {orphanage.child_capacity || translations.notDefined} {orphanage.child_capacity && `(${capacityUsage}%)`}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/20 dark:via-slate-900 dark:to-green-950/10 dark:border dark:border-green-900/20 hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 dark:bg-green-400/5 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{translations.boys}</CardTitle>
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-3xl font-bold text-green-600 dark:text-green-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {boysCount} <span className="text-sm">{translations.tracked} / {`${orphanage.boys_count} ${translations.boysLower}`}</span>
            </motion.div>
            <motion.p 
              className="text-xs text-slate-600 dark:text-slate-400 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {totalChildren > 0 ? Math.round((boysCount / totalChildren) * 100) : 0}% {translations.ofTotal}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-pink-50 via-white to-pink-50/50 dark:from-pink-950/20 dark:via-slate-900 dark:to-pink-950/10 dark:border dark:border-pink-900/20 hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 dark:bg-pink-400/5 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{translations.girls}</CardTitle>
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-3xl font-bold text-pink-600 dark:text-pink-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {girlsCount} <span className="text-sm">{translations.tracked} / {`${orphanage.girls_count} ${translations.girlsLower}`}</span>
            </motion.div>
            <motion.p 
              className="text-xs text-slate-600 dark:text-slate-400 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {totalChildren > 0 ? Math.round((girlsCount / totalChildren) * 100) : 0}% {translations.ofTotal}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={{ scale: 1.03 }}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/10 dark:border dark:border-purple-900/20 hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 dark:bg-purple-400/5 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{translations.newThisMonth}</CardTitle>
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="text-3xl font-bold text-purple-600 dark:text-purple-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              {newThisMonth}
            </motion.div>
            <motion.p 
              className="text-xs text-slate-600 dark:text-slate-400 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {translations.since} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' })}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StatsCards;