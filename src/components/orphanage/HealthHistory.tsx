
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, Calendar, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HealthRecord {
  id: string;
  date: string;
  vaccination_status: string;
  chronic_conditions: string;
  medications: string;
  remarks: string;
  created_at: string;
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
        .select('*')
        .eq('child_id', childId)
        .order('date', { ascending: false });

      if (error) throw error;
      setHealthRecords(data || []);
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
                  <div className="flex items-center justify-between mb-2">
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
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {record.vaccination_status && (
                      <div>
                        <span className="font-medium text-muted-foreground">Vaccins:</span>
                        <p className="text-sm line-clamp-2">{record.vaccination_status}</p>
                      </div>
                    )}
                    {record.medications && (
                      <div>
                        <span className="font-medium text-muted-foreground">Médicaments:</span>
                        <p className="text-sm line-clamp-2">{record.medications}</p>
                      </div>
                    )}
                  </div>
                  
                  {record.remarks && (
                    <div className="mt-2">
                      <span className="font-medium text-muted-foreground">Remarques:</span>
                      <p className="text-sm line-clamp-2 mt-1">{record.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Dossier médical du {selectedRecord && format(new Date(selectedRecord.date), 'PPP', { locale: fr })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
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
              
              {selectedRecord.vaccination_status && (
                <div>
                  <h4 className="font-medium mb-2">Statut vaccinal</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedRecord.vaccination_status}</p>
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
