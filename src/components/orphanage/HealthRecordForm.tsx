
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarIcon, Stethoscope } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const healthRecordSchema = z.object({
  date: z.date({
    required_error: "La date est requise",
  }),
  vaccination_status: z.string().default(''),
  chronic_conditions: z.string().default(''),
  medications: z.string().default(''),
  remarks: z.string().default(''),
});

type HealthRecordFormData = z.infer<typeof healthRecordSchema>;

interface HealthRecordFormProps {
  childId: string;
  childName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const HealthRecordForm = ({ childId, childName, onSuccess, onCancel }: HealthRecordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      chronic_conditions: '',
      medications: '',
      remarks: '',
    },
  });

  const selectedDate = watch('date');

  const onSubmit = async (data: HealthRecordFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('health_records')
        .insert({
          child_id: childId,
          date: format(data.date, 'yyyy-MM-dd'),
          vaccination_status: data.vaccination_status,
          chronic_conditions: data.chronic_conditions,
          medications: data.medications,
          remarks: data.remarks,
        });

      if (error) throw error;

      toast({
        title: "Dossier médical enregistré",
        description: `Le dossier médical de ${childName} a été mis à jour avec succès.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le dossier médical.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          Nouveau dossier médical - {childName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="vaccination_status">Statut vaccinal</Label>
            <Textarea
              id="vaccination_status"
              placeholder="Ex: BCG à jour, DTC-HepB-Hib reçu à 2 mois, Rougeole prévue à 9 mois, En attente du carnet vaccinal..."
              {...register('vaccination_status')}
              className="min-h-[80px]"
            />
          </div>

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
              className="flex-1"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
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
