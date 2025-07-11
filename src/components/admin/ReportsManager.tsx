
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Report {
  id: string;
  title: string;
  type: string;
  status: 'generated' | 'pending' | 'error';
  createdAt: string;
  size: string;
}

const ReportsManager = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading reports
    setTimeout(() => {
      setReports([
        {
          id: '1',
          title: 'Rapport mensuel - Janvier 2024',
          type: 'monthly',
          status: 'generated',
          createdAt: '2024-02-01',
          size: '2.5 MB'
        },
        {
          id: '2', 
          title: 'Statistiques nutritionnelles - Q1 2024',
          type: 'nutrition',
          status: 'generated',
          createdAt: '2024-01-15',
          size: '1.8 MB'
        },
        {
          id: '3',
          title: 'Rapport de santé - Décembre 2023',
          type: 'health',
          status: 'pending',
          createdAt: '2024-01-10',
          size: '-'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated': return 'Généré';
      case 'pending': return 'En cours';
      case 'error': return 'Erreur';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly': return <Calendar className="w-4 h-4" />;
      case 'nutrition': return <Activity className="w-4 h-4" />;
      case 'health': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const reportItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Generate New Report Section */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Générer un nouveau rapport
            </CardTitle>
            <CardDescription>
              Créez des rapports personnalisés sur différents aspects du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              <motion.div variants={reportItemVariants}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full h-20 flex flex-col gap-2" 
                    variant="outline"
                  >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm">Rapport mensuel</span>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div variants={reportItemVariants}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full h-20 flex flex-col gap-2" 
                    variant="outline"
                  >
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">Rapport nutritionnel</span>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div variants={reportItemVariants}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full h-20 flex flex-col gap-2" 
                    variant="outline"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Rapport de santé</span>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports List */}
      <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Rapports générés</CardTitle>
            <CardDescription>
              Historique des rapports créés et disponibles au téléchargement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div className="space-y-4" variants={containerVariants}>
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  variants={reportItemVariants}
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="flex items-center justify-between p-4 border rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {getTypeIcon(report.type)}
                    </motion.div>
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-gray-500">
                        Créé le {new Date(report.createdAt).toLocaleDateString('fr-FR')} • {report.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                    {report.status === 'generated' && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReportsManager;
