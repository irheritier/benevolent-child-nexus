
import * as z from 'zod';

export const childSchema = z.object({
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

export type ChildFormData = z.infer<typeof childSchema>;
