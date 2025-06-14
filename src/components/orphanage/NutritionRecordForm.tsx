
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const nutritionRecordSchema = z.object({
  date: z.date({
    required_error: "La date est requise",
  }),
  weight_kg: z.number({
    required_error: "Le poids est requis",
  }).min(0.1, "Le poids doit être supérieur à 0").max(200, "Le poids ne peut pas dépasser 200kg"),
  height_cm: z.number({
    required_error: "La taille est requise",
  }).min(10, "La taille doit être supérieure à 10cm").max(250, "La taille ne peut pas dépasser 250cm"),
  nutrition_status: z.enum(['severely_malnourished', 'malnourished', 'normal'], {
    required_error: "Le statut nutritionnel est requis",
  }),
});

type NutritionRecordFormData = z.infer<typeof nutritionRecordSchema>;

interface NutritionRecordFormProps {
  childId: string;
  childName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const NutritionRecordForm = ({ childId, childName, onSuccess, onCancel }: NutritionRecordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NutritionRecordFormData>({
    resolver: zodResolver(nutritionRecordSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const selectedDate = watch('date');
  const weight = watch('weight_kg');
  const height = watch('height_cm');

  // Calculer l'IMC automatiquement
  const calculateBMI = (weight: number, height: number) => {
    if (weight && height) {
      return (weight / Math.pow(height / 100, 2)).toFixed(2);
    }
    return null;
  };

  const bmi = weight && height ? calculateBMI(weight, height) : null;

  const onSubmit = async (data: NutritionRecordFormData) => {
    setIsSubmitting(true);
    try {
      const bmiValue = calculateBMI(data.weight_kg, data.height_cm);
      
      const { error } = await supabase
        .from('nutrition_records')
        .insert({
          child_id: childId,
          date: format(data.date, 'yyyy-MM-dd'),
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          bmi: bmiValue ? parseFloat(bmiValue) : null,
          nutrition_status: data.nutrition_status,
        });

      if (error) throw error;

      toast({
        title: "Données nutritionnelles enregistrées",
        description: `Les données de ${childName} ont été mises à jour avec succès.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les données nutritionnelles.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nutritionStatusOptions = [
    { value: 'severely_malnourished', label: 'Malnutrition sévère' },
    { value: 'malnourished', label: 'Malnutrition modérée' },
    { value: 'normal', label: 'Normal' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Nouvelles données nutritionnelles - {childName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date de mesure</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Poids (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                placeholder="Ex: 15.5"
                {...register('weight_kg', { valueAsNumber: true })}
              />
              {errors.weight_kg && (
                <p className="text-sm text-red-500">{errors.weight_kg.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height_cm">Taille (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                step="0.1"
                placeholder="Ex: 120.5"
                {...register('height_cm', { valueAsNumber: true })}
              />
              {errors.height_cm && (
                <p className="text-sm text-red-500">{errors.height_cm.message}</p>
              )}
            </div>
          </div>

          {bmi && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">IMC calculé</Label>
              <p className="text-lg font-semibold">{bmi}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nutrition_status">Statut nutritionnel</Label>
            <Select onValueChange={(value) => setValue('nutrition_status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut nutritionnel" />
              </SelectTrigger>
              <SelectContent>
                {nutritionStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.nutrition_status && (
              <p className="text-sm text-red-500">{errors.nutrition_status.message}</p>
            )}
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

export default NutritionRecordForm;
