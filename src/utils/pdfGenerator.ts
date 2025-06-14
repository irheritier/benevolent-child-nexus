
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';

interface ReportConfig {
  type: 'general' | 'orphanages' | 'children' | 'nutrition' | 'provinces';
  title: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface OrphanageData {
  id: string;
  name: string;
  province: string;
  city: string;
  legal_status: string;
  child_capacity: number;
  created_at: string;
}

interface ChildData {
  id: string;
  full_name: string;
  gender: 'M' | 'F';
  birth_date: string;
  entry_date: string;
  parent_status: string;
  orphanage_name: string;
}

interface NutritionData {
  child_name: string;
  nutrition_status: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  date: string;
}

export const generatePDFReport = async (config: ReportConfig) => {
  try {
    const doc = new jsPDF();
    
    // En-tête du rapport
    addReportHeader(doc, config.title);
    
    let yPosition = 40;
    
    // Ajouter les données selon le type de rapport
    switch (config.type) {
      case 'general':
        yPosition = await addGeneralReportContent(doc, yPosition, config.dateFrom, config.dateTo);
        break;
      case 'orphanages':
        yPosition = await addOrphanagesReportContent(doc, yPosition, config.dateFrom, config.dateTo);
        break;
      case 'children':
        yPosition = await addChildrenReportContent(doc, yPosition, config.dateFrom, config.dateTo);
        break;
      case 'nutrition':
        yPosition = await addNutritionReportContent(doc, yPosition, config.dateFrom, config.dateTo);
        break;
      case 'provinces':
        yPosition = await addProvincesReportContent(doc, yPosition, config.dateFrom, config.dateTo);
        break;
    }
    
    // Pied de page
    addReportFooter(doc);
    
    // Télécharger le PDF
    const fileName = `rapport_${config.type}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw error;
  }
};

const addReportHeader = (doc: jsPDF, title: string) => {
  // Logo et titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Congo ChildNet', 20, 20);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 20, 30);
  
  // Date de génération
  doc.setFontSize(10);
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 150, 20);
  
  // Ligne de séparation
  doc.line(20, 35, 190, 35);
};

const addReportFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} sur ${pageCount}`, 170, 290);
    doc.text('Congo ChildNet - Rapport confidentiel', 20, 290);
  }
};

const addGeneralReportContent = async (doc: jsPDF, startY: number, dateFrom?: Date, dateTo?: Date) => {
  let yPosition = startY;
  
  try {
    // Récupérer les statistiques générales
    const { data: stats } = await supabase
      .from('public_stats')
      .select('*')
      .single();
    
    if (stats) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistiques générales', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total orphelinats: ${stats.total_orphanages || 0}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Total enfants: ${stats.total_children || 0}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Orphelinats vérifiés: ${stats.verified_orphanages || 0}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Enfants bien nourris: ${stats.well_nourished_children || 0}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Enfants malnutris: ${stats.malnourished_children || 0}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Provinces couvertes: ${stats.total_provinces || 0}`, 25, yPosition);
      yPosition += 15;
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    doc.text('Erreur lors du chargement des données', 20, yPosition);
    yPosition += 15;
  }
  
  return yPosition;
};

const addOrphanagesReportContent = async (doc: jsPDF, startY: number, dateFrom?: Date, dateTo?: Date) => {
  let yPosition = startY;
  
  try {
    let query = supabase
      .from('orphanages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo.toISOString());
    }
    
    const { data: orphanages } = await query;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des orphelinats', 20, yPosition);
    yPosition += 15;
    
    if (orphanages && orphanages.length > 0) {
      orphanages.forEach((orphanage: OrphanageData) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(orphanage.name, 25, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Province: ${orphanage.province}, Ville: ${orphanage.city}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Statut: ${orphanage.legal_status}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Capacité: ${orphanage.child_capacity || 'Non spécifiée'} enfants`, 25, yPosition);
        yPosition += 5;
        doc.text(`Date d'inscription: ${new Date(orphanage.created_at).toLocaleDateString('fr-FR')}`, 25, yPosition);
        yPosition += 10;
      });
    } else {
      doc.text('Aucun orphelinat trouvé pour cette période', 25, yPosition);
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des orphelinats:', error);
    doc.text('Erreur lors du chargement des données', 20, yPosition);
  }
  
  return yPosition;
};

const addChildrenReportContent = async (doc: jsPDF, startY: number, dateFrom?: Date, dateTo?: Date) => {
  let yPosition = startY;
  
  try {
    let query = supabase
      .from('children')
      .select(`
        *,
        orphanages!inner(name)
      `)
      .order('entry_date', { ascending: false });
    
    if (dateFrom) {
      query = query.gte('entry_date', dateFrom.toISOString().split('T')[0]);
    }
    if (dateTo) {
      query = query.lte('entry_date', dateTo.toISOString().split('T')[0]);
    }
    
    const { data: children } = await query;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des enfants', 20, yPosition);
    yPosition += 15;
    
    if (children && children.length > 0) {
      // Statistiques par genre
      const maleCount = children.filter(child => child.gender === 'M').length;
      const femaleCount = children.filter(child => child.gender === 'F').length;
      
      doc.setFontSize(12);
      doc.text(`Total: ${children.length} enfants (${maleCount} garçons, ${femaleCount} filles)`, 25, yPosition);
      yPosition += 15;
      
      children.forEach((child: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(child.full_name, 25, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        const genderText = child.gender === 'M' ? 'Garçon' : 'Fille';
        doc.text(`Genre: ${genderText}`, 25, yPosition);
        yPosition += 5;
        
        if (child.birth_date) {
          const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
          doc.text(`Âge: ${age} ans`, 25, yPosition);
          yPosition += 5;
        }
        
        doc.text(`Statut parental: ${child.parent_status}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Orphelinat: ${child.orphanages?.name || 'Non spécifié'}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Date d'entrée: ${new Date(child.entry_date).toLocaleDateString('fr-FR')}`, 25, yPosition);
        yPosition += 10;
      });
    } else {
      doc.text('Aucun enfant trouvé pour cette période', 25, yPosition);
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
    doc.text('Erreur lors du chargement des données', 20, yPosition);
  }
  
  return yPosition;
};

const addNutritionReportContent = async (doc: jsPDF, startY: number, dateFrom?: Date, dateTo?: Date) => {
  let yPosition = startY;
  
  try {
    let query = supabase
      .from('nutrition_records')
      .select(`
        *,
        children!inner(full_name)
      `)
      .order('date', { ascending: false });
    
    if (dateFrom) {
      query = query.gte('date', dateFrom.toISOString().split('T')[0]);
    }
    if (dateTo) {
      query = query.lte('date', dateTo.toISOString().split('T')[0]);
    }
    
    const { data: nutritionRecords } = await query;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport nutritionnel', 20, yPosition);
    yPosition += 15;
    
    if (nutritionRecords && nutritionRecords.length > 0) {
      // Statistiques nutritionnelles
      const wellNourished = nutritionRecords.filter(record => record.nutrition_status === 'normal').length;
      const malnourished = nutritionRecords.filter(record => record.nutrition_status !== 'normal').length;
      
      doc.setFontSize(12);
      doc.text(`Total mesures: ${nutritionRecords.length}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Bien nourris: ${wellNourished}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Malnutris: ${malnourished}`, 25, yPosition);
      yPosition += 15;
      
      nutritionRecords.slice(0, 50).forEach((record: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.text(`${record.children?.full_name || 'Nom inconnu'} - ${record.nutrition_status}`, 25, yPosition);
        yPosition += 5;
        doc.text(`  Poids: ${record.weight_kg}kg, Taille: ${record.height_cm}cm, IMC: ${record.bmi?.toFixed(1) || 'N/A'}`, 25, yPosition);
        yPosition += 5;
        doc.text(`  Date: ${new Date(record.date).toLocaleDateString('fr-FR')}`, 25, yPosition);
        yPosition += 8;
      });
      
      if (nutritionRecords.length > 50) {
        doc.text(`... et ${nutritionRecords.length - 50} autres mesures`, 25, yPosition);
      }
    } else {
      doc.text('Aucune donnée nutritionnelle trouvée pour cette période', 25, yPosition);
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des données nutritionnelles:', error);
    doc.text('Erreur lors du chargement des données', 20, yPosition);
  }
  
  return yPosition;
};

const addProvincesReportContent = async (doc: jsPDF, startY: number, dateFrom?: Date, dateTo?: Date) => {
  let yPosition = startY;
  
  try {
    const { data: provinceStats } = await supabase
      .from('province_stats')
      .select('*')
      .order('orphanages_count', { ascending: false });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport par province', 20, yPosition);
    yPosition += 15;
    
    if (provinceStats && provinceStats.length > 0) {
      provinceStats.forEach((province: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(province.province, 25, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Orphelinats: ${province.orphanages_count || 0}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Enfants: ${province.children_count || 0}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Bien nourris: ${province.well_nourished || 0}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Malnutris: ${province.malnourished || 0}`, 25, yPosition);
        yPosition += 12;
      });
    } else {
      doc.text('Aucune donnée provinciale disponible', 25, yPosition);
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques provinciales:', error);
    doc.text('Erreur lors du chargement des données', 20, yPosition);
  }
  
  return yPosition;
};
