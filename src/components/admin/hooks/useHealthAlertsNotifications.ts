
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

export const useHealthAlertsNotifications = () => {
  const { createNotification } = useNotifications();
  const { toast } = useToast();

  const createHealthNotification = async (
    type: 'disease_outbreak' | 'vaccination_gap',
    title: string,
    message: string,
    orphanageName: string,
    childCount: number,
    severity: 'high' | 'critical'
  ) => {
    try {
      await createNotification({
        type: `health_${type}`,
        title,
        message,
        priority: severity,
        entity_type: 'health_alert'
      });
    } catch (error) {
      console.error('Erreur lors de la création de notification de santé:', error);
    }
  };

  const checkAndNotifyDiseaseOutbreaks = async () => {
    try {
      const { data: diseaseOutbreaks, error } = await supabase
        .from('child_diseases')
        .select(`
          disease_id,
          diseases!inner (name),
          health_records!inner (
            child_id,
            children!inner (
              orphanage_id,
              orphanages!inner (name)
            )
          )
        `)
        .gte('diagnosed_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Dernières 24h

      if (error) throw error;

      const outbreakMap = new Map<string, { orphanage_name: string; disease_name: string; count: number; }>();
      
      diseaseOutbreaks?.forEach((record) => {
        const orphanageId = record.health_records.children.orphanage_id;
        const orphanageName = record.health_records.children.orphanages.name;
        const diseaseName = record.diseases.name;
        const key = `${orphanageId}-${diseaseName}`;

        if (!outbreakMap.has(key)) {
          outbreakMap.set(key, {
            orphanage_name: orphanageName,
            disease_name: diseaseName,
            count: 0
          });
        }
        outbreakMap.get(key)!.count++;
      });

      // Créer des notifications pour les épidémies détectées
      for (const [key, data] of outbreakMap) {
        if (data.count >= 3) {
          // Vérifier si on a déjà notifié cette épidémie récemment
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('type', 'health_disease_outbreak')
            .ilike('message', `%${data.disease_name}%${data.orphanage_name}%`)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (!existingNotif) {
            await createHealthNotification(
              'disease_outbreak',
              'Épidémie Potentielle Détectée',
              `${data.count} cas de ${data.disease_name} signalés à ${data.orphanage_name} dans les dernières 24h`,
              data.orphanage_name,
              data.count,
              data.count >= 5 ? 'critical' : 'high'
            );
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des épidémies:', error);
    }
  };

  const checkAndNotifyVaccinationGaps = async () => {
    try {
      const { data: vaccinationData, error } = await supabase
        .from('health_records')
        .select(`
          vaccination_status_structured,
          children!inner (
            orphanage_id,
            orphanages!inner (name)
          )
        `)
        .not('vaccination_status_structured', 'is', null);

      if (error) throw error;

      const vaccinationMap = new Map<string, { 
        orphanage_name: string; 
        total: number; 
        not_vaccinated: number; 
      }>();

      vaccinationData?.forEach((record) => {
        const orphanageId = record.children.orphanage_id;
        const orphanageName = record.children.orphanages.name;
        const vaccinationStatus = record.vaccination_status_structured as any;

        if (!vaccinationMap.has(orphanageId)) {
          vaccinationMap.set(orphanageId, {
            orphanage_name: orphanageName,
            total: 0,
            not_vaccinated: 0
          });
        }

        const data = vaccinationMap.get(orphanageId)!;
        data.total++;

        if (vaccinationStatus?.status === 'not_vaccinated') {
          data.not_vaccinated++;
        }
      });

      // Créer des notifications pour les écarts de vaccination
      for (const [orphanageId, data] of vaccinationMap) {
        const percentage = (data.not_vaccinated / data.total) * 100;
        
        if (percentage > 30 && data.not_vaccinated >= 3) {
          // Vérifier si on a déjà notifié cet écart récemment
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('type', 'health_vaccination_gap')
            .ilike('message', `%${data.orphanage_name}%`)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (!existingNotif) {
            await createHealthNotification(
              'vaccination_gap',
              'Écart de Vaccination Important',
              `${Math.round(percentage)}% des enfants (${data.not_vaccinated}/${data.total}) ne sont pas vaccinés à ${data.orphanage_name}`,
              data.orphanage_name,
              data.not_vaccinated,
              percentage > 50 ? 'critical' : 'high'
            );
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des vaccinations:', error);
    }
  };

  const runHealthAlertsCheck = async () => {
    await Promise.all([
      checkAndNotifyDiseaseOutbreaks(),
      checkAndNotifyVaccinationGaps()
    ]);
  };

  useEffect(() => {
    // Exécuter les vérifications au montage
    runHealthAlertsCheck();

    // Puis toutes les heures
    const interval = setInterval(runHealthAlertsCheck, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { runHealthAlertsCheck };
};
