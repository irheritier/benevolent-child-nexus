-- Ajouter le champ rejection_reason à la table orphanages
ALTER TABLE public.orphanages 
ADD COLUMN rejection_reason text NULL;

-- Ajouter les champs reviewed_by et reviewed_at pour la traçabilité
ALTER TABLE public.orphanages 
ADD COLUMN reviewed_by uuid NULL,
ADD COLUMN reviewed_at timestamp with time zone NULL;

-- Ajouter la contrainte de clé étrangère pour reviewed_by
ALTER TABLE public.orphanages 
ADD CONSTRAINT orphanages_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES users(id);