
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

const ReportsManager = () => {
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
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const reports = [
    {
      title: "Rapport mensuel des orphelinats",
      description: "Statistiques complètes sur tous les orphelinats enregistrés",
      icon: FileText,
      type: "monthly",
      lastGenerated: "2024-01-15"
    },
    {
      title: "Rapport de santé des enfants",
      description: "État nutritionnel et sanitaire des enfants",
      icon: TrendingUp,
      type: "health",
      lastGenerated: "2024-01-10"
    },
    {
      title: "Rapport provincial",
      description: "Répartition des données par province",
      icon: Calendar,
      type: "provincial",
      lastGenerated: "2024-01-12"
    }
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestionnaire de rapports
            </CardTitle>
            <CardDescription>
              Générez et téléchargez des rapports détaillés sur les données du système
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {reports.map((report, index) => (
          <motion.div key={report.type} variants={cardVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <report.icon className="h-5 w-5 text-blue-600" />
                  {report.title}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Dernière génération:</span>
                  <br />
                  {report.lastGenerated}
                </div>
                <div className="flex flex-col gap-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger Excel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Régénérer
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Rapports personnalisés</CardTitle>
            <CardDescription>
              Créez des rapports sur mesure selon vos critères spécifiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Créer un rapport personnalisé
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReportsManager;
