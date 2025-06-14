
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportConfig {
  type: 'general' | 'orphanages' | 'children' | 'nutrition' | 'provinces';
  title: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface StatsData {
  totalOrphanages: number;
  totalChildren: number;
  pendingOrphanages: number;
  verifiedOrphanages: number;
  wellNourishedChildren: number;
  malnourishedChildren: number;
  totalProvinces: number;
}

export const generatePDFReport = async (config: ReportConfig) => {
  try {
    // Créer un nouveau document PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // En-tête
    addHeader(pdf, config.title, pageWidth);
    
    // Informations sur la période
    addPeriodInfo(pdf, config.dateFrom, config.dateTo, pageWidth);
    
    // Récupérer les données
    const stats = await fetchStatsData();
    
    // Ajouter le contenu selon le type de rapport
    let yPosition = 60;
    
    switch (config.type) {
      case 'general':
        yPosition = await addGeneralReport(pdf, stats, yPosition, pageWidth);
        break;
      case 'orphanages':
        yPosition = await addOrphanagesReport(pdf, yPosition, pageWidth);
        break;
      case 'children':
        yPosition = await addChildrenReport(pdf, yPosition, pageWidth);
        break;
      case 'nutrition':
        yPosition = await addNutritionReport(pdf, yPosition, pageWidth);
        break;
      case 'provinces':
        yPosition = await addProvincesReport(pdf, yPosition, pageWidth);
        break;
    }
    
    // Pied de page
    addFooter(pdf, pageWidth, pageHeight);
    
    // Télécharger le PDF
    const filename = `rapport_${config.type}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(filename);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};

const addHeader = (pdf: jsPDF, title: string, pageWidth: number) => {
  // Logo/Titre principal
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Congo ChildNet', pageWidth / 2, 20, { align: 'center' });
  
  // Sous-titre
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(title, pageWidth / 2, 30, { align: 'center' });
  
  // Ligne de séparation
  pdf.setLineWidth(0.5);
  pdf.line(20, 35, pageWidth - 20, 35);
};

const addPeriodInfo = (pdf: jsPDF, dateFrom?: Date, dateTo?: Date, pageWidth: number) => {
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  let periodText = `Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`;
  
  if (dateFrom && dateTo) {
    periodText += ` • Période: ${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`;
  }
  
  pdf.text(periodText, pageWidth / 2, 45, { align: 'center' });
};

const fetchStatsData = async (): Promise<StatsData> => {
  const { data: publicStats } = await supabase
    .from('public_stats')
    .select('*')
    .single();

  const { data: orphanages } = await supabase
    .from('orphanages')
    .select('legal_status');

  const pendingCount = orphanages?.filter(o => o.legal_status === 'pending').length || 0;
  const verifiedCount = orphanages?.filter(o => o.legal_status === 'verified').length || 0;

  return {
    totalOrphanages: publicStats?.total_orphanages || 0,
    totalChildren: publicStats?.total_children || 0,
    pendingOrphanages: pendingCount,
    verifiedOrphanages: verifiedCount,
    wellNourishedChildren: publicStats?.well_nourished_children || 0,
    malnourishedChildren: publicStats?.malnourished_children || 0,
    totalProvinces: publicStats?.total_provinces || 0
  };
};

const addGeneralReport = async (pdf: jsPDF, stats: StatsData, yPosition: number, pageWidth: number): Promise<number> => {
  // Titre de section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Statistiques générales', 20, yPosition);
  yPosition += 15;
  
  // Métriques principales
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const metrics = [
    { label: 'Total des orphelinats', value: stats.totalOrphanages.toString() },
    { label: 'Orphelinats validés', value: stats.verifiedOrphanages.toString() },
    { label: 'Orphelinats en attente', value: stats.pendingOrphanages.toString() },
    { label: 'Total des enfants', value: stats.totalChildren.toString() },
    { label: 'Enfants bien nourris', value: stats.wellNourishedChildren.toString() },
    { label: 'Enfants malnutris', value: stats.malnourishedChildren.toString() },
    { label: 'Provinces couvertes', value: stats.totalProvinces.toString() }
  ];
  
  metrics.forEach((metric) => {
    pdf.text(`${metric.label}:`, 25, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.value, 120, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition += 8;
  });
  
  // Calculs additionnels
  yPosition += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Indicateurs clés', 20, yPosition);
  yPosition += 10;
  
  const malnutritionRate = stats.totalChildren > 0 
    ? ((stats.malnourishedChildren / stats.totalChildren) * 100).toFixed(1)
    : '0';
  
  const verificationRate = stats.totalOrphanages > 0
    ? ((stats.verifiedOrphanages / stats.totalOrphanages) * 100).toFixed(1)
    : '0';
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Taux de malnutrition: ${malnutritionRate}%`, 25, yPosition);
  yPosition += 8;
  pdf.text(`Taux de validation des orphelinats: ${verificationRate}%`, 25, yPosition);
  yPosition += 8;
  
  return yPosition;
};

const addOrphanagesReport = async (pdf: jsPDF, yPosition: number, pageWidth: number): Promise<number> => {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Rapport des orphelinats', 20, yPosition);
  yPosition += 15;
  
  try {
    const { data: orphanages } = await supabase
      .from('orphanages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (orphanages && orphanages.length > 0) {
      // Tableau des orphelinats
      const headers = ['Nom', 'Province', 'Ville', 'Statut', 'Capacité'];
      const headerY = yPosition;
      
      // En-têtes
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      headers.forEach((header, index) => {
        pdf.text(header, 20 + (index * 35), headerY);
      });
      
      yPosition += 8;
      
      // Ligne de séparation
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;
      
      // Données
      pdf.setFont('helvetica', 'normal');
      orphanages.slice(0, 20).forEach((orphanage) => {
        const row = [
          orphanage.name.substring(0, 15),
          orphanage.province.substring(0, 12),
          orphanage.city.substring(0, 12),
          orphanage.legal_status === 'verified' ? 'Validé' : 
          orphanage.legal_status === 'pending' ? 'Attente' : 'Rejeté',
          (orphanage.child_capacity || 0).toString()
        ];
        
        row.forEach((cell, index) => {
          pdf.text(cell, 20 + (index * 35), yPosition);
        });
        
        yPosition += 6;
        
        // Nouvelle page si nécessaire
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des orphelinats:', error);
    pdf.text('Erreur lors du chargement des données', 25, yPosition);
  }
  
  return yPosition;
};

const addChildrenReport = async (pdf: jsPDF, yPosition: number, pageWidth: number): Promise<number> => {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Rapport des enfants', 20, yPosition);
  yPosition += 15;
  
  try {
    const { data: children } = await supabase
      .from('children')
      .select('*');
    
    if (children) {
      // Statistiques par genre
      const maleCount = children.filter(c => c.gender === 'male').length;
      const femaleCount = children.filter(c => c.gender === 'female').length;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Garçons: ${maleCount}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Filles: ${femaleCount}`, 25, yPosition);
      yPosition += 15;
      
      // Statistiques par âge
      const ageCounts = {
        '0-2 ans': 0,
        '3-5 ans': 0,
        '6-10 ans': 0,
        '11-15 ans': 0,
        '16+ ans': 0
      };
      
      children.forEach(child => {
        let age = 0;
        if (child.birth_date) {
          const birthDate = new Date(child.birth_date);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
        } else if (child.estimated_age) {
          age = child.estimated_age;
        }
        
        if (age <= 2) ageCounts['0-2 ans']++;
        else if (age <= 5) ageCounts['3-5 ans']++;
        else if (age <= 10) ageCounts['6-10 ans']++;
        else if (age <= 15) ageCounts['11-15 ans']++;
        else ageCounts['16+ ans']++;
      });
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Répartition par âge:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      Object.entries(ageCounts).forEach(([ageGroup, count]) => {
        pdf.text(`${ageGroup}: ${count}`, 25, yPosition);
        yPosition += 8;
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
    pdf.text('Erreur lors du chargement des données', 25, yPosition);
  }
  
  return yPosition;
};

const addNutritionReport = async (pdf: jsPDF, yPosition: number, pageWidth: number): Promise<number> => {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Rapport nutritionnel', 20, yPosition);
  yPosition += 15;
  
  try {
    const { data: nutritionRecords } = await supabase
      .from('nutrition_records')
      .select('*');
    
    if (nutritionRecords) {
      const statusCounts = {
        normal: 0,
        underweight: 0,
        overweight: 0,
        malnourished: 0
      };
      
      nutritionRecords.forEach(record => {
        statusCounts[record.nutrition_status as keyof typeof statusCounts]++;
      });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        const label = status === 'normal' ? 'Normal' :
                     status === 'underweight' ? 'Insuffisance pondérale' :
                     status === 'overweight' ? 'Surpoids' : 'Malnutrition';
        
        pdf.text(`${label}: ${count}`, 25, yPosition);
        yPosition += 8;
      });
      
      // Calcul du pourcentage de malnutrition
      const totalRecords = nutritionRecords.length;
      const malnutritionPercentage = totalRecords > 0 
        ? ((statusCounts.malnourished / totalRecords) * 100).toFixed(1)
        : '0';
      
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Taux de malnutrition: ${malnutritionPercentage}%`, 25, yPosition);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données nutritionnelles:', error);
    pdf.text('Erreur lors du chargement des données', 25, yPosition);
  }
  
  return yPosition;
};

const addProvincesReport = async (pdf: jsPDF, yPosition: number, pageWidth: number): Promise<number> => {
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Rapport par province', 20, yPosition);
  yPosition += 15;
  
  try {
    const { data: provinceStats } = await supabase
      .from('province_stats')
      .select('*')
      .order('children_count', { ascending: false });
    
    if (provinceStats && provinceStats.length > 0) {
      // En-têtes du tableau
      const headers = ['Province', 'Orphelinats', 'Enfants', 'Bien nourris', 'Malnutris'];
      const headerY = yPosition;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      headers.forEach((header, index) => {
        pdf.text(header, 20 + (index * 35), headerY);
      });
      
      yPosition += 8;
      
      // Ligne de séparation
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;
      
      // Données
      pdf.setFont('helvetica', 'normal');
      provinceStats.forEach((province) => {
        const row = [
          province.province?.substring(0, 15) || '',
          (province.orphanages_count || 0).toString(),
          (province.children_count || 0).toString(),
          (province.well_nourished || 0).toString(),
          (province.malnourished || 0).toString()
        ];
        
        row.forEach((cell, index) => {
          pdf.text(cell, 20 + (index * 35), yPosition);
        });
        
        yPosition += 6;
        
        // Nouvelle page si nécessaire
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques provinciales:', error);
    pdf.text('Erreur lors du chargement des données', 25, yPosition);
  }
  
  return yPosition;
};

const addFooter = (pdf: jsPDF, pageWidth: number, pageHeight: number) => {
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Congo ChildNet - Système de gestion des orphelinats', pageWidth / 2, pageHeight - 10, { align: 'center' });
};
