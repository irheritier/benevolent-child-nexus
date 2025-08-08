
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, Calendar, Plus, Eye, Activity, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChildDisease {
  id: string;
  severity: string;
  notes: string;
  diseases: {
    name: string;
  };
}

interface VaccinationStatusStructured {
  status: string;
  vaccines: string[];
  last_updated: string;
}

interface HealthRecord {
  id: string;
  date: string;
  vaccination_status: string;
  vaccination_status_structured: VaccinationStatusStructured | null;
  chronic_conditions: string;
  medications: string;
  remarks: string;
  created_at: string;
  child_diseases: ChildDisease[];
}

interface HealthHistoryProps {
  childId: string;
  childName: string;
  onAddRecord: () => void;
}

const HealthHistory = ({ childId, childName, onAddRecord }: HealthHistoryProps) => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthRecords();
  }, [childId]);

  const loadHealthRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select(`
          *,
          child_diseases (
            id,
            severity,
            notes,
            diseases (
              name
            )
          )
        `)
        .eq('child_id', childId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper type safety
      const transformedData: HealthRecord[] = (data || []).map(record => ({
        ...record,
        vaccination_status_structured: record.vaccination_status_structured 
          ? (record.vaccination_status_structured as unknown as VaccinationStatusStructured)
          : null
      }));
      
      setHealthRecords(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique médical.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVaccinationStatusBadge = (record: HealthRecord) => {
    const status = record.vaccination_status_structured?.status || 'unknown';
    
    switch (status) {
      case 'vaccinated':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Vacciné</Badge>;
      case 'partially_vaccinated':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partiellement vacciné</Badge>;
      case 'not_vaccinated':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Non vacciné</Badge>;
      default:
        return <Badge variant="outline">Statut inconnu</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Sévère</Badge>;
      case 'moderate':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Modéré</Badge>;
      case 'mild':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Léger</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Chargement de l'historique médical...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Historique médical - {childName}
            </CardTitle>
            <Button onClick={onAddRecord} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau dossier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthRecords.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun dossier médical</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer le premier dossier médical de {childName}.
              </p>
              <Button onClick={onAddRecord}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un dossier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {healthRecords.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(record.date), 'PPP', { locale: fr })}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir détails
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Statut vaccinal */}
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Vaccination:</span>
                      {getVaccinationStatusBadge(record)}
                    </div>

                    {/* Maladies diagnostiquées */}
                    {record.child_diseases && record.child_diseases.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Maladies diagnostiquées:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {record.child_diseases.map((childDisease) => (
                            <div key={childDisease.id} className="flex items-center gap-1">
                              <span className="text-sm">{childDisease.diseases.name}</span>
                              {getSeverityBadge(childDisease.severity)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Autres informations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {record.medications && (
                        <div>
                          <span className="font-medium text-muted-foreground">Médicaments:</span>
                          <p className="text-sm line-clamp-2">{record.medications}</p>
                        </div>
                      )}
                      {record.chronic_conditions && (
                        <div>
                          <span className="font-medium text-muted-foreground">Conditions chroniques:</span>
                          <p className="text-sm line-clamp-2">{record.chronic_conditions}</p>
                        </div>
                      )}
                    </div>
                    
                    {record.remarks && (
                      <div>
                        <span className="font-medium text-muted-foreground">Remarques:</span>
                        <p className="text-sm line-clamp-2 mt-1">{record.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Dossier médical du {selectedRecord && format(new Date(selectedRecord.date), 'PPP', { locale: fr })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span>
                  <p>{format(new Date(selectedRecord.date), 'PPP', { locale: fr })}</p>
                </div>
                <div>
                  <span className="font-medium">Enregistré le:</span>
                  <p>{format(new Date(selectedRecord.created_at), 'PPp', { locale: fr })}</p>
                </div>
              </div>

              {/* Statut vaccinal détaillé */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Statut vaccinal
                </h4>
                <div className="bg-muted p-3 rounded space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut:</span>
                    {getVaccinationStatusBadge(selectedRecord)}
                  </div>
                  {selectedRecord.vaccination_status && (
                    <p className="text-sm">{selectedRecord.vaccination_status}</p>
                  )}
                </div>
              </div>

              {/* Maladies diagnostiquées détaillées */}
              {selectedRecord.child_diseases && selectedRecord.child_diseases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Maladies diagnostiquées
                  </h4>
                  <div className="space-y-3">
                    {selectedRecord.child_diseases.map((childDisease) => (
                      <div key={childDisease.id} className="bg-muted p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{childDisease.diseases.name}</span>
                          {getSeverityBadge(childDisease.severity)}
                        </div>
                        {childDisease.notes && (
                          <p className="text-sm text-muted-foreground">{childDisease.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRecord.chronic_conditions && (
                <div>
                  <h4 className="font-medium mb-2">Conditions chroniques</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedRecord.chronic_conditions}</p>
                </div>
              )}
              
              {selectedRecord.medications && (
                <div>
                  <h4 className="font-medium mb-2">Médicaments</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedRecord.medications}</p>
                </div>
              )}
              
              {selectedRecord.remarks && (
                <div>
                  <h4 className="font-medium mb-2">Remarques médicales</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedRecord.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HealthHistory;
