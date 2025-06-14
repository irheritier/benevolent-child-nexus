
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChildFormData } from './schemas/childSchema';
import { getParentStatusText } from './utils/parentStatusUtils';

interface ChildFormFieldsProps {
  control: Control<ChildFormData>;
}

const ChildFormFields = ({ control }: ChildFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
  );
};

export default ChildFormFields;
