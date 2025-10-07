
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Edit, X } from 'lucide-react';
import { childSchema, type ChildFormData } from './schemas/childSchema';
import { useEditChild } from './hooks/useEditChild';
import ChildFormFields from './ChildFormFields';

interface Child {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  estimated_age: number | null;
  entry_date: string | null;
  parent_status: string;
  internal_code: string | null;
  created_at: string;
}

interface EditChildFormProps {
  child: Child;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditChildForm = ({ child, onSuccess, onCancel }: EditChildFormProps) => {
  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      full_name: child.full_name,
      gender: child.gender as 'M' | 'F',
      birth_date: child.birth_date ? new Date(child.birth_date) : undefined,
      estimated_age: child.estimated_age || undefined,
      entry_date: child.entry_date ? new Date(child.entry_date) : new Date(),
      parent_status: child.parent_status as 'total_orphan' | 'partial_orphan' | 'abandoned',
      internal_code: child.internal_code || '',
    },
  });

  const { editChild, isEditing } = useEditChild(child.id, () => {
    onSuccess();
  });

  const onSubmit = async (data: ChildFormData) => {
    await editChild(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Modifier l'enfant
            </CardTitle>
            <CardDescription>
              Mettre à jour les informations de {child.full_name}
            </CardDescription>
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

            <div className="flex space-x-4">
              <Button className=" w-1/2 " type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button className=" w-1/2 " type="submit" disabled={isEditing}>
                {isEditing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier l'enfant
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

export default EditChildForm;
