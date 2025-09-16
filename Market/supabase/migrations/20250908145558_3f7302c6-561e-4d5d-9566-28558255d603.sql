-- Créer des profils pour les utilisateurs existants qui n'en ont pas
INSERT INTO public.profiles (user_id, full_name, email, user_type)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'first_name' || ' ' || au.raw_user_meta_data ->> 'last_name', 'Utilisateur'),
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'user_type', 'convoyeur')
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;

-- Mettre à jour les politiques RLS pour permettre l'accès aux profils dans les devis
CREATE POLICY "Profiles visible in devis context" ON public.profiles
FOR SELECT USING (
  -- Permettre de voir le profil si on a un devis sur la même mission
  EXISTS (
    SELECT 1 FROM public.marketplace_devis md
    WHERE md.convoyeur_id = profiles.user_id
    AND EXISTS (
      SELECT 1 FROM public.marketplace_missions mm
      WHERE mm.id = md.mission_id
      AND (mm.created_by = auth.uid() OR md.convoyeur_id = auth.uid())
    )
  )
);