-- Ajouter les colonnes manquantes à la table profiles existante
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('convoyeur', 'donneur_ordre'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Créer des profils pour les utilisateurs existants qui n'en ont pas
INSERT INTO public.profiles (user_id, full_name, email, user_type)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data ->> 'full_name',
    CONCAT(au.raw_user_meta_data ->> 'first_name', ' ', au.raw_user_meta_data ->> 'last_name'),
    'Utilisateur'
  ),
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'user_type', 'convoyeur')
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Profiles visible in devis context" ON public.profiles;

-- Créer la nouvelle politique RLS pour permettre l'accès aux profils dans les devis
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