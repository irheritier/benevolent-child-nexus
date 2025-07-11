
// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { useToast } from '@/hooks/use-toast';
// import { FileText, Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { generatePDFReport } from '@/utils/pdfGenerator';
// import { cn } from '@/lib/utils';

// type ReportType = 'general' | 'orphanages' | 'children' | 'nutrition' | 'provinces';

// const ReportsManager = () => {
//   const [selectedReport, setSelectedReport] = useState<ReportType>('general');
//   const [dateFrom, setDateFrom] = useState<Date>();
//   const [dateTo, setDateTo] = useState<Date>();
//   const [isGenerating, setIsGenerating] = useState(false);
//   const { toast } = useToast();

//   const reportTypes = [
//     { value: 'general', label: 'Rapport général', description: 'Vue d\'ensemble complète du système' },
//     { value: 'orphanages', label: 'Rapport orphelinats', description: 'Statistiques des centres d\'accueil' },
//     { value: 'children', label: 'Rapport enfants', description: 'Données sur les enfants hébergés' },
//     { value: 'nutrition', label: 'Rapport nutritionnel', description: 'État nutritionnel des enfants' },
//     { value: 'provinces', label: 'Rapport provincial', description: 'Répartition par province' }
//   ];

//   const handleGenerateReport = async () => {
//     if (!selectedReport) {
//       toast({
//         title: "Erreur",
//         description: "Veuillez sélectionner un type de rapport.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       await generatePDFReport({
//         type: selectedReport,
//         dateFrom,
//         dateTo,
//         title: reportTypes.find(r => r.value === selectedReport)?.label || 'Rapport'
//       });

//       toast({
//         title: "Rapport généré",
//         description: "Le rapport PDF a été téléchargé avec succès.",
//       });
//     } catch (error) {
//       console.error('Erreur lors de la génération du rapport:', error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de générer le rapport PDF.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Génération de rapports</h2>
//           <p className="text-muted-foreground">
//             Créez et téléchargez des rapports PDF détaillés
//           </p>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <FileText className="w-5 h-5" />
//             Configuration du rapport
//           </CardTitle>
//           <CardDescription>
//             Sélectionnez le type de rapport et la période désirée
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Sélection du type de rapport */}
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Type de rapport</label>
//             <Select value={selectedReport} onValueChange={(value: ReportType) => setSelectedReport(value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Choisir un type de rapport" />
//               </SelectTrigger>
//               <SelectContent>
//                 {reportTypes.map((report) => (
//                   <SelectItem key={report.value} value={report.value}>
//                     <div>
//                       <div className="font-medium">{report.label}</div>
//                       <div className="text-xs text-muted-foreground">{report.description}</div>
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Sélection de la période */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Date de début</label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !dateFrom && "text-muted-foreground"
//                     )}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {dateFrom ? format(dateFrom, "PPP", { locale: fr }) : "Sélectionner une date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={dateFrom}
//                     onSelect={setDateFrom}
//                     locale={fr}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium">Date de fin</label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !dateTo && "text-muted-foreground"
//                     )}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {dateTo ? format(dateTo, "PPP", { locale: fr }) : "Sélectionner une date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={dateTo}
//                     onSelect={setDateTo}
//                     locale={fr}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//           {/* Bouton de génération */}
//           <div className="flex justify-end">
//             <Button 
//               onClick={handleGenerateReport}
//               disabled={isGenerating || !selectedReport}
//               className="flex items-center gap-2"
//             >
//               {isGenerating ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Download className="w-4 h-4" />
//               )}
//               {isGenerating ? "Génération..." : "Générer le rapport"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Rapports prédéfinis */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Rapports rapides</CardTitle>
//           <CardDescription>
//             Générez rapidement des rapports couramment utilisés
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <Button 
//               variant="outline" 
//               className="h-auto p-4 flex flex-col items-start space-y-2"
//               onClick={() => {
//                 setSelectedReport('general');
//                 setDateFrom(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
//                 setDateTo(new Date());
//                 handleGenerateReport();
//               }}
//               disabled={isGenerating}
//             >
//               <FileText className="w-5 h-5 text-blue-500" />
//               <div className="text-left">
//                 <div className="font-medium">Rapport mensuel</div>
//                 <div className="text-xs text-muted-foreground">Données du mois dernier</div>
//               </div>
//             </Button>

//             <Button 
//               variant="outline" 
//               className="h-auto p-4 flex flex-col items-start space-y-2"
//               onClick={() => {
//                 setSelectedReport('nutrition');
//                 setDateFrom(new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1));
//                 setDateTo(new Date());
//                 handleGenerateReport();
//               }}
//               disabled={isGenerating}
//             >
//               <FileText className="w-5 h-5 text-green-500" />
//               <div className="text-left">
//                 <div className="font-medium">Suivi nutritionnel</div>
//                 <div className="text-xs text-muted-foreground">3 derniers mois</div>
//               </div>
//             </Button>

//             <Button 
//               variant="outline" 
//               className="h-auto p-4 flex flex-col items-start space-y-2"
//               onClick={() => {
//                 setSelectedReport('provinces');
//                 setDateFrom(new Date(new Date().getFullYear(), 0, 1));
//                 setDateTo(new Date());
//                 handleGenerateReport();
//               }}
//               disabled={isGenerating}
//             >
//               <FileText className="w-5 h-5 text-purple-500" />
//               <div className="text-left">
//                 <div className="font-medium">Rapport annuel</div>
//                 <div className="text-xs text-muted-foreground">Année en cours</div>
//               </div>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ReportsManager;


import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, Variants } from 'framer-motion';

type ReportType = 'general' | 'orphanages' | 'children' | 'nutrition' | 'provinces';

const ReportsManager = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('general');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'general', label: 'Rapport général', description: 'Vue d\'ensemble complète du système' },
    { value: 'orphanages', label: 'Rapport orphelinats', description: 'Statistiques des centres d\'accueil' },
    { value: 'children', label: 'Rapport enfants', description: 'Données sur les enfants hébergés' },
    { value: 'nutrition', label: 'Rapport nutritionnel', description: 'État nutritionnel des enfants' },
    { value: 'provinces', label: 'Rapport provincial', description: 'Répartition par province' }
  ];

  // Animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
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

  const buttonVariants: Variants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.98 }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de rapport.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDFReport({
        type: selectedReport,
        dateFrom,
        dateTo,
        title: reportTypes.find(r => r.value === selectedReport)?.label || 'Rapport'
      });

      toast({
        title: "Rapport généré",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Génération de rapports</h2>
          <p className="text-muted-foreground">
            Créez et téléchargez des rapports PDF détaillés
          </p>
        </div>
      </motion.div>

      <motion.div variants={cardVariants} whileHover={{ scale: 1.005 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div whileHover={{ rotate: 15 }}>
                <FileText className="w-5 h-5" />
              </motion.div>
              Configuration du rapport
            </CardTitle>
            <CardDescription>
              Sélectionnez le type de rapport et la période désirée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sélection du type de rapport */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="text-sm font-medium">Type de rapport</label>
              <Select value={selectedReport} onValueChange={(value: ReportType) => setSelectedReport(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type de rapport" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <motion.div 
                      key={report.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SelectItem value={report.value}>
                        <div>
                          <div className="font-medium">{report.label}</div>
                          <div className="text-xs text-muted-foreground">{report.description}</div>
                        </div>
                      </SelectItem>
                    </motion.div>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Sélection de la période */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.div whileHover={{ scale: 1.01 }}>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.div whileHover={{ scale: 1.01 }}>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>

            {/* Bouton de génération */}
            <motion.div 
              className="flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !selectedReport}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isGenerating ? "Génération..." : "Générer le rapport"}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rapports prédéfinis */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.005 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Rapports rapides</CardTitle>
            <CardDescription>
              Générez rapidement des rapports couramment utilisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              <motion.div variants={cardVariants}>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => {
                    setSelectedReport('general');
                    setDateFrom(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
                    setDateTo(new Date());
                    handleGenerateReport();
                  }}
                  disabled={isGenerating}
                  asChild
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Rapport mensuel</div>
                        <div className="text-xs text-muted-foreground">Données du mois dernier</div>
                      </div>
                    </div>
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => {
                    setSelectedReport('nutrition');
                    setDateFrom(new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1));
                    setDateTo(new Date());
                    handleGenerateReport();
                  }}
                  disabled={isGenerating}
                  asChild
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <FileText className="w-5 h-5 text-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Suivi nutritionnel</div>
                        <div className="text-xs text-muted-foreground">3 derniers mois</div>
                      </div>
                    </div>
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => {
                    setSelectedReport('provinces');
                    setDateFrom(new Date(new Date().getFullYear(), 0, 1));
                    setDateTo(new Date());
                    handleGenerateReport();
                  }}
                  disabled={isGenerating}
                  asChild
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div className="text-left">
                        <div className="font-medium">Rapport annuel</div>
                        <div className="text-xs text-muted-foreground">Année en cours</div>
                      </div>
                    </div>
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReportsManager;