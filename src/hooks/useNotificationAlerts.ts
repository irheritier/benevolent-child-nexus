import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationContext';

export const useNotificationAlerts = () => {
  const { createNotification } = useNotifications();

  const checkOrphanagePendingAlerts = async () => {
    try {
      const { data: pendingOrphanages, error } = await supabase
        .from('orphanages')
        .select('*')
        .eq('legal_status', 'pending');

      if (error) {
        console.error('Erreur lors de la vérification des orphelinats en attente:', error);
        return;
      }

      // Créer une notification pour chaque nouvel orphelinat en attente
      for (const orphanage of pendingOrphanages || []) {
        // Vérifier si on a déjà envoyé une notification pour cet orphelinat
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'orphanage_pending')
          .eq('entity_id', orphanage.id)
          .single();

        if (!existingNotif) {
          await createNotification({
            type: 'orphanage_pending',
            title: 'Nouvelle demande d\'inscription',
            message: `${orphanage.name} a soumis une demande d'inscription et attend validation.`,
            entity_id: orphanage.id,
            entity_type: 'orphanage',
            priority: 'high'
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes orphelinats:', error);
    }
  };

  const checkPartnerRequestAlerts = async () => {
    try {
      const { data: pendingRequests, error } = await supabase
        .from('partner_requests')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.error('Erreur lors de la vérification des demandes partenaires:', error);
        return;
      }

      // Créer une notification pour chaque nouvelle demande partenaire
      for (const request of pendingRequests || []) {
        // Vérifier si on a déjà envoyé une notification pour cette demande
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'partner_request_pending')
          .eq('entity_id', request.id)
          .single();

        if (!existingNotif) {
          await createNotification({
            type: 'partner_request_pending',
            title: 'Nouvelle demande partenaire',
            message: `${request.organization_name} a soumis une demande d'accès partenaire et attend validation.`,
            entity_id: request.id,
            entity_type: 'partner_request',
            priority: 'high'
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des demandes partenaires:', error);
    }
  };

  const checkMalnutritionAlerts = async () => {
    try {
      // Récupérer les enfants avec un statut nutritionnel critique
      const { data: malnourishedChildren, error } = await supabase
        .from('nutrition_records')
        .select(`
          *,
          children!inner (
            id,
            full_name,
            orphanage_id,
            orphanages!inner (
              name
            )
          )
        `)
        .eq('nutrition_status', 'severely_malnourished')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la vérification de la malnutrition:', error);
        return;
      }

      // Créer des alertes pour les cas critiques récents
      for (const record of malnourishedChildren || []) {
        const recordDate = new Date(record.date);
        const daysSinceRecord = Math.floor((new Date().getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Alerter seulement pour les enregistrements récents (moins de 7 jours)
        if (daysSinceRecord <= 7) {
          // Vérifier si on a déjà envoyé une notification pour cet enregistrement
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('type', 'malnutrition_alert')
            .eq('entity_id', record.child_id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .single();

          if (!existingNotif) {
            await createNotification({
              type: 'malnutrition_alert',
              title: 'Alerte malnutrition critique',
              message: `${record.children.full_name} de ${record.children.orphanages.name} présente une malnutrition sévère.`,
              entity_id: record.child_id,
              entity_type: 'child',
              priority: 'critical'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes malnutrition:', error);
    }
  };

  const checkDocumentExpiryAlerts = async () => {
    try {
      const { data: thresholds } = await supabase
        .from('alert_thresholds')
        .select('document_expiry_warning_days, document_expiry_critical_days')
        .single();

      if (!thresholds) return;

      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + thresholds.document_expiry_warning_days);

      const criticalDate = new Date();
      criticalDate.setDate(criticalDate.getDate() + thresholds.document_expiry_critical_days);

      const { data: expiringDocs, error } = await supabase
        .from('orphanage_documents')
        .select(`
          *,
          orphanages!inner (
            name
          )
        `)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', warningDate.toISOString());

      if (error) {
        console.error('Erreur lors de la vérification des documents:', error);
        return;
      }

      for (const doc of expiringDocs || []) {
        const expiryDate = new Date(doc.expiry_date);
        const isCritical = expiryDate <= criticalDate;
        
        // Vérifier si on a déjà envoyé une notification récente pour ce document
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'document_expiry')
          .eq('entity_id', doc.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (!existingNotif) {
          await createNotification({
            type: 'document_expiry',
            title: `Document ${isCritical ? 'expire bientôt' : 'à renouveler'}`,
            message: `Le document "${doc.title}" de ${doc.orphanages.name} expire le ${expiryDate.toLocaleDateString('fr-FR')}.`,
            entity_id: doc.id,
            entity_type: 'document',
            priority: isCritical ? 'critical' : 'high'
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des documents:', error);
    }
  };

  const checkCapacityAlerts = async () => {
    try {
      const { data: thresholds } = await supabase
        .from('alert_thresholds')
        .select('capacity_warning_percentage, capacity_critical_percentage')
        .single();

      if (!thresholds) return;

      const { data: orphanagesWithCounts, error } = await supabase
        .from('orphanages')
        .select(`
          id,
          name,
          child_capacity,
          children(count)
        `)
        .not('child_capacity', 'is', null)
        .gt('child_capacity', 0);

      if (error) {
        console.error('Erreur lors de la vérification des capacités:', error);
        return;
      }

      for (const orphanage of orphanagesWithCounts || []) {
        const currentCount = orphanage.children?.[0]?.count || 0;
        const capacity = orphanage.child_capacity;
        const occupancyRate = (currentCount / capacity) * 100;

        if (occupancyRate >= thresholds.capacity_warning_percentage) {
          const isCritical = occupancyRate >= thresholds.capacity_critical_percentage;
          
          // Vérifier si on a déjà envoyé une notification récente
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('type', 'capacity_alert')
            .eq('entity_id', orphanage.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .single();

          if (!existingNotif) {
            await createNotification({
              type: 'capacity_alert',
              title: `Capacité ${isCritical ? 'critique' : 'élevée'}`,
              message: `${orphanage.name} atteint ${Math.round(occupancyRate)}% de sa capacité (${currentCount}/${capacity} enfants).`,
              entity_id: orphanage.id,
              entity_type: 'orphanage',
              priority: isCritical ? 'critical' : 'high'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des capacités:', error);
    }
  };

  const runAllChecks = async () => {
    await Promise.all([
      checkOrphanagePendingAlerts(),
      checkPartnerRequestAlerts(),
      checkMalnutritionAlerts(),
      checkDocumentExpiryAlerts(),
      checkCapacityAlerts()
    ]);
  };

  useEffect(() => {
    // Exécuter les vérifications au montage
    runAllChecks();

    // Puis toutes les 30 minutes
    const interval = setInterval(runAllChecks, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { runAllChecks };
};
