
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle } from 'lucide-react';
import { useDiseases } from '@/hooks/useDiseases';

interface SelectedDisease {
  disease_id: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

interface DiseaseSelectorProps {
  selectedDiseases: SelectedDisease[];
  onDiseasesChange: (diseases: SelectedDisease[]) => void;
}

const DiseaseSelector = ({ selectedDiseases, onDiseasesChange }: DiseaseSelectorProps) => {
  const { diseases, isLoading } = useDiseases();

  const handleDiseaseToggle = (diseaseId: string, checked: boolean) => {
    if (checked) {
      const newDisease: SelectedDisease = {
        disease_id: diseaseId,
        severity: 'mild',
        notes: ''
      };
      onDiseasesChange([...selectedDiseases, newDisease]);
    } else {
      onDiseasesChange(selectedDiseases.filter(d => d.disease_id !== diseaseId));
    }
  };

  const handleSeverityChange = (diseaseId: string, severity: 'mild' | 'moderate' | 'severe') => {
    onDiseasesChange(
      selectedDiseases.map(d => 
        d.disease_id === diseaseId ? { ...d, severity } : d
      )
    );
  };

  const handleNotesChange = (diseaseId: string, notes: string) => {
    onDiseasesChange(
      selectedDiseases.map(d => 
        d.disease_id === diseaseId ? { ...d, notes } : d
      )
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'moderate':
        return <Activity className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Maladies diagnostiquées</Label>
        <div className="p-4 text-center text-muted-foreground">
          Chargement des maladies...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Maladies diagnostiquées</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
        {diseases.map((disease) => {
          const isSelected = selectedDiseases.some(d => d.disease_id === disease.id);
          
          return (
            <div key={disease.id} className="flex items-center space-x-2">
              <Checkbox
                id={disease.id}
                checked={isSelected}
                onCheckedChange={(checked) => handleDiseaseToggle(disease.id, !!checked)}
              />
              <Label htmlFor={disease.id} className="text-sm cursor-pointer">
                {disease.name}
              </Label>
            </div>
          );
        })}
      </div>

      {selectedDiseases.length > 0 && (
        <div className="space-y-4">
          <Label>Détails des maladies sélectionnées</Label>
          {selectedDiseases.map((selectedDisease) => {
            const disease = diseases.find(d => d.id === selectedDisease.disease_id);
            
            return (
              <Card key={selectedDisease.disease_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getSeverityIcon(selectedDisease.severity)}
                    {disease?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`severity-${selectedDisease.disease_id}`}>Sévérité</Label>
                    <Select
                      value={selectedDisease.severity}
                      onValueChange={(value) => handleSeverityChange(selectedDisease.disease_id, value as 'mild' | 'moderate' | 'severe')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Léger</SelectItem>
                        <SelectItem value="moderate">Modéré</SelectItem>
                        <SelectItem value="severe">Sévère</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${selectedDisease.disease_id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${selectedDisease.disease_id}`}
                      placeholder="Notes spécifiques à cette maladie..."
                      value={selectedDisease.notes}
                      onChange={(e) => handleNotesChange(selectedDisease.disease_id, e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiseaseSelector;
