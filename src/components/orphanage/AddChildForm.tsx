
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { UserPlus, X } from 'lucide-react';
import { childSchema, type ChildFormData } from './schemas/childSchema';
import { useChildSubmit } from './hooks/useChildSubmit';
import ChildFormFields from './ChildFormFields';

interface AddChildFormProps {
  orphanageId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddChildForm = ({ orphanageId, onSuccess, onCancel }: AddChildFormProps) => {
  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      entry_date: new Date(),
    },
  });

  const { submitChild, isSubmitting } = useChildSubmit(orphanageId, () => {
    form.reset();
    onSuccess();
  });

  const onSubmit = async (data: ChildFormData) => {
    await submitChild(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {/* <UserPlus className="w-5 h-5" /> */}
              Ajouter un enfant
            </CardTitle>
            {/* <CardDescription>
              Enregistrer un nouvel enfant dans votre centre d'accueil
            </CardDescription> */}
          </div>
          {/* <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button> */}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ChildFormFields control={form.control} />

            <div className="flex justify-end space-x-4">
              <Button className=" w-1/2 " type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button className=" w-1/2 " type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    {/* <UserPlus className="w-4 h-4 mr-2" /> */}
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
