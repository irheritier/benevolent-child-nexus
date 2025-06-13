
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const childSchema = z.object({
  full_name: z.string().min(2, 'Le nom complet est requis'),
  gender: z.enum(['M', 'F'], { required_error: 'Le genre est requis' }),
  birth_date: z.date().optional(),
  estimated_age: z.number().min(0).max(25).optional(),
  entry_date: z.date({ required_error: 'La date d\'entrée est requise' }),
  parent_status: z.enum(['total_orphan', 'partial_orphan', 'abandoned'], {
    required_error: 'Le statut parental est requis'
  }),
  internal_code: z.string().optional(),
});

type ChildFormData = z.infer<typeof childSchema>;

interface AddChildFormProps {
  orphanageId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddChildForm = ({ orphanageId, onSuccess, onCancel }: AddChildFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      entry_date: new Date(),
    },
  });

  const onSubmit = async (data: ChildFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('children')
        .insert([{
          ...data,
          orphanage_id: orphanageId,
        }]);

      if (error) throw error;

      toast({
        title: "Enfant ajouté avec succès",
        description: `${data.full_name} a été enregistré dans votre centre.`,
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'enfant:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'enfant.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentStatusText = (status: string) => {
    const statusMap = {
      'total_orphan': 'Orphelin total',
      'partial_orphan': 'Orphelin partiel',
      'abandoned': 'Abandonné'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Ajouter un enfant
            </CardTitle>
            <CardDescription>
              Enregistrer un nouvel enfant dans votre centre d'accueil
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nom complet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom et nom de l'enfant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Garçon</SelectItem>
                        <SelectItem value="F">Fille</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âge estimé</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Âge en années"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'entrée *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_status"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Statut parental *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut parental" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="total_orphan">
                          {getParentStatusText('total_orphan')}
                        </SelectItem>
                        <SelectItem value="partial_orphan">
                          {getParentStatusText('partial_orphan')}
                        </SelectItem>
                        <SelectItem value="abandoned">
                          {getParentStatusText('abandoned')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internal_code"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Code interne (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Code d'identification interne du centre" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter l'enfant
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddChildForm;
