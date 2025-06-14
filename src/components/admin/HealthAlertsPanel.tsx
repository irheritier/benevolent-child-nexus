import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Heart, Shield, Activity, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HealthAlert {
  id: string;
  type: 'disease_outbreak' | 'vaccination_gap' | 'chronic_condition' | 'medication_alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  orphanage_name: string;
  child_count: number;
  created_at: string;
}

interface OutbreakData {
  orphanage_name: string;
  disease_name: string;
  count: number;
}

const HealthAlertsPanel = () => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthAlerts();
  }, []);

  const loadHealthAlerts = async () => {
    try {
      // Charger les alertes de santé basées sur les données actuelles
      const alerts: HealthAlert[] = [];

      // 1. Détection d'épidémies potentielles (même maladie dans plusieurs enfants d'un orphelinat)
      const { data: diseaseOutbreaks, error: diseaseError } = await supabase
        .from('child_diseases')
        .select(`
          disease_id,
          severity,
          diseases!inner (
            name
          ),
          health_records!inner (
            child_id,
            children!inner (
              orphanage_id,
              orphanages!inner (
                name
              )
            )
          )
        `)
        .gte('diagnosed_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (diseaseError) throw diseaseError;

      // Analyser les épidémies potentielles
      const outbreakMap = new Map<string, OutbreakData>();
      
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

        const currentData = outbreakMap.get(key)!;
        currentData.count++;
      });

      // Créer des alertes pour les épidémies (seuil: 3+ cas)
      outbreakMap.forEach((data) => {
        const count = data.count;
        const orphanageName = data.orphanage_name;
        const diseaseName = data.disease_name;

        if (count >= 3) {
          alerts.push({
            id: `outbreak-${orphanageName}-${diseaseName}`,
            type: 'disease_outbreak',
            title: 'Épidémie Potentielle Détectée',
            description: `${count} cas de ${diseaseName} signalés à ${orphanageName} ce mois-ci`,
            severity: count >= 5 ? 'critical' : 'high',
            orphanage_name: orphanageName,
            child_count: count,
            created_at: new Date().toISOString()
          });
        }
      });

      // 2. Écarts de vaccination (orphelinats avec beaucoup d'enfants non vaccinés)
      const { data: vaccinationGaps, error: vaccinationError } = await supabase
        .from('health_records')
        .select(`
          vaccination_status_structured,
          children!inner (
            orphanage_id,
            orphanages!inner (
              name
            )
          )
        `)
        .not('vaccination_status_structured', 'is', null);

      if (vaccinationError) throw vaccinationError;

      const vaccinationMap = new Map<string, { 
        orphanage_name: string; 
        total: number; 
        not_vaccinated: number; 
      }>();

      vaccinationGaps?.forEach((record) => {
        const orphanageId = record.children.orphanage_id;
        const orphanageName = record.children.orphanages.name;
        const vaccinationData = record.vaccination_status_structured as any;

        if (!vaccinationMap.has(orphanageId)) {
          vaccinationMap.set(orphanageId, {
            orphanage_name: orphanageName,
            total: 0,
            not_vaccinated: 0
          });
        }

        const data = vaccinationMap.get(orphanageId)!;
        data.total++;

        if (vaccinationData?.status === 'not_vaccinated') {
          data.not_vaccinated++;
        }
      });

      // Créer des alertes pour les écarts de vaccination (seuil: >30% non vaccinés)
      vaccinationMap.forEach((data, orphanageId) => {
        const percentage = (data.not_vaccinated / data.total) * 100;
        
        if (percentage > 30 && data.not_vaccinated >= 3) {
          alerts.push({
            id: `vaccination-${orphanageId}`,
            type: 'vaccination_gap',
            title: 'Écart de Vaccination Important',
            description: `${Math.round(percentage)}% des enfants (${data.not_vaccinated}/${data.total}) ne sont pas vaccinés à ${data.orphanage_name}`,
            severity: percentage > 50 ? 'critical' : 'high',
            orphanage_name: data.orphanage_name,
            child_count: data.not_vaccinated,
            created_at: new Date().toISOString()
          });
        }
      });

      // Trier les alertes par sévérité
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setAlerts(alerts);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes de santé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes de santé.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critique</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Élevé</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Moyen</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Faible</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'disease_outbreak':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'vaccination_gap':
        return <Shield className="w-5 h-5 text-orange-600" />;
      case 'chronic_condition':
        return <Heart className="w-5 h-5 text-purple-600" />;
      case 'medication_alert':
        return <Activity className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Chargement des alertes de santé...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertes de Santé ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune alerte de santé</h3>
              <p className="text-muted-foreground">
                Tous les indicateurs de santé sont dans les normes acceptables.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.orphanage_name}</p>
                      </div>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  
                  <p className="text-sm mb-3">{alert.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {alert.child_count} enfant{alert.child_count > 1 ? 's' : ''} concerné{alert.child_count > 1 ? 's' : ''}
                    </span>
                    <span>
                      {format(new Date(alert.created_at), 'PPp', { locale: fr })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={loadHealthAlerts} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Actualiser les alertes
        </Button>
      </div>
    </div>
  );
};

export default HealthAlertsPanel;
