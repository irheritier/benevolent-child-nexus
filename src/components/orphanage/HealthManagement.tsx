
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, UserPlus, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HealthRecordForm from './HealthRecordForm';
import HealthHistory from './HealthHistory';

interface Child {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  estimated_age: number | null;
}

interface HealthManagementProps {
  children: Child[];
}

const HealthManagement = ({ children }: HealthManagementProps) => {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedChild = children.find(child => child.id === selectedChildId);

  const handleAddRecord = () => {
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    // Forcer le rechargement du composant HealthHistory
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Gestion de la santé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sélectionner un enfant
              </label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un enfant..." />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.full_name} ({child.gender === 'M' ? 'Garçon' : 'Fille'}, {child.estimated_age || 'Âge inconnu'} ans)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedChildId && children.length === 0 && (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun enfant enregistré</h3>
                <p className="text-muted-foreground">
                  Vous devez d'abord enregistrer des enfants pour pouvoir gérer leur santé.
                </p>
              </div>
            )}

            {!selectedChildId && children.length > 0 && (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sélectionnez un enfant</h3>
                <p className="text-muted-foreground">
                  Choisissez un enfant dans la liste pour voir son historique médical.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <HealthHistory
          key={`${selectedChild.id}-${refreshKey}`}
          childId={selectedChild.id}
          childName={selectedChild.full_name}
          onAddRecord={handleAddRecord}
        />
      )}

      {/* Add Health Record Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {/* <DialogHeader>
            <DialogTitle>Nouveau dossier médical</DialogTitle>
          </DialogHeader> */}
          {selectedChild && (
            <HealthRecordForm
              childId={selectedChild.id}
              childName={selectedChild.full_name}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthManagement;
