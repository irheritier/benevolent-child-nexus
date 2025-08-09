
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarIcon, Stethoscope } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DiseaseSelector from './DiseaseSelector';
import { useHealthRecordSubmit } from './hooks/useHealthRecordSubmit';

const healthRecordSchema = z.object({
  date: z.date({
    required_error: "La date est requise",
  }),
  vaccination_status: z.string().default(''),
  vaccination_status_structured: z.object({
    status: z.enum(['vaccinated', 'partially_vaccinated', 'not_vaccinated', 'unknown']),
    vaccines: z.array(z.string()),
    last_updated: z.string(),
  }),
  chronic_conditions: z.string().default(''),
  medications: z.string().default(''),
  remarks: z.string().default(''),
});

type HealthRecordFormData = z.infer<typeof healthRecordSchema>;

interface SelectedDisease {
  disease_id: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

interface HealthRecordFormProps {
  childId: string;
  childName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const HealthRecordForm = ({ childId, childName, onSuccess, onCancel }: HealthRecordFormProps) => {
  const [selectedDiseases, setSelectedDiseases] = useState<SelectedDisease[]>([]);
  const { submitHealthRecord, isSubmitting } = useHealthRecordSubmit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      date: new Date(),
      vaccination_status: '',
      vaccination_status_structured: {
        status: 'unknown',
        vaccines: [],
        last_updated: new Date().toISOString(),
      },
      chronic_conditions: '',
      medications: '',
      remarks: '',
    },
  });

  const selectedDate = watch('date');
  const vaccinationStatusStructured = watch('vaccination_status_structured');

  const onSubmit = async (data: HealthRecordFormData) => {
    // Ensure all required properties are present
    const submissionData = {
      date: data.date,
      vaccination_status: data.vaccination_status,
      vaccination_status_structured: {
        status: data.vaccination_status_structured.status,
        vaccines: data.vaccination_status_structured.vaccines,
        last_updated: data.vaccination_status_structured.last_updated,
      },
      chronic_conditions: data.chronic_conditions,
      medications: data.medications,
      remarks: data.remarks,
      selectedDiseases,
    };

    await submitHealthRecord(
      childId,
      childName,
      submissionData,
      onSuccess
    );
  };

  const handleVaccinationStatusChange = (status: string) => {
    setValue('vaccination_status_structured', {
      status: status as 'vaccinated' | 'partially_vaccinated' | 'not_vaccinated' | 'unknown',
      vaccines: vaccinationStatusStructured.vaccines,
      last_updated: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-center">
          {/* <Stethoscope className="w-5 h-5" /> */}
          Nouveau dossier médical <br /> {childName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date de consultation</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccination_status_select">Statut vaccinal</Label>
            <Select
              value={vaccinationStatusStructured.status}
              onValueChange={handleVaccinationStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut vaccinal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccinated">Vacciné</SelectItem>
                <SelectItem value="partially_vaccinated">Partiellement vacciné</SelectItem>
                <SelectItem value="not_vaccinated">Non vacciné</SelectItem>
                <SelectItem value="unknown">Inconnu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccination_status">Détails du statut vaccinal</Label>
            <Textarea
              id="vaccination_status"
              placeholder="Ex: BCG à jour, DTC-HepB-Hib reçu à 2 mois, Rougeole prévue à 9 mois, En attente du carnet vaccinal..."
              {...register('vaccination_status')}
              className="min-h-[80px]"
            />
          </div>

          <DiseaseSelector
            selectedDiseases={selectedDiseases}
            onDiseasesChange={setSelectedDiseases}
          />

          <div className="space-y-2">
            <Label htmlFor="chronic_conditions">Conditions chroniques</Label>
            <Textarea
              id="chronic_conditions"
              placeholder="Ex: Antécédents d'otites fréquentes, Allergie aux arachides, Asthme léger, Eczéma atopique, Aucune condition particulière..."
              {...register('chronic_conditions')}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Médicaments</Label>
            <Textarea
              id="medications"
              placeholder="Ex: Amoxicilline 250mg 3x/jour pendant 7 jours, Paracétamol si fièvre >38.5°C, Sérum physiologique 2x/jour, Aucun médicament..."
              {...register('medications')}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarques médicales</Label>
            <Textarea
              id="remarks"
              placeholder="Ex: Éviter l'eau dans les oreilles, Surveiller la température, Contrôle dans 1 semaine, Bon état général, Référer si aggravation..."
              {...register('remarks')}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-1/2"
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthRecordForm;
