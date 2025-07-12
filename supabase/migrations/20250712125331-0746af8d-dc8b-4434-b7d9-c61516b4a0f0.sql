
-- Supprimer la politique existante et la recréer avec les bonnes permissions
DROP POLICY IF EXISTS "Anyone can submit partner requests" ON public.partner_requests;

-- Créer une nouvelle politique qui permet vraiment à tout le monde de soumettre des demandes
CREATE POLICY "Public can submit partner requests" 
ON public.partner_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- S'assurer que la table permet l'accès anonyme pour les insertions
GRANT INSERT ON public.partner_requests TO anon;
