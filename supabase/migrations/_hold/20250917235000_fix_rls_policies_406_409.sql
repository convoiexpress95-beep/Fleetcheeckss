-- Fix RLS policies for profiles table to resolve 406/409 conflicts
-- This migration cleans up conflicting policies and establishes consistent RLS rules

-- 1. Supprimer toutes les anciennes politiques conflictuelles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_upsert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_user_id" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_user_id" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON public.profiles;

-- 2. S'assurer que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer des politiques RLS claires et cohérentes
-- SELECT: Tous peuvent voir tous les profils (pour les contacts et recherche)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT 
  USING (true);

-- INSERT: Seuls les utilisateurs peuvent créer leur propre profil via user_id
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Seuls les propriétaires peuvent modifier leur profil via user_id
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- DELETE: Pas d'autorisation de suppression pour les utilisateurs normaux
CREATE POLICY "profiles_no_delete" ON public.profiles
  FOR DELETE 
  USING (false);

-- 4. Ajouter une politique spéciale pour les service_role (pour les migrations et triggers)
-- Permettre toutes les opérations pour service_role
CREATE POLICY "profiles_service_role_all" ON public.profiles
  FOR ALL
  USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

-- 5. Vérifier et corriger les contraintes
-- S'assurer que user_id est unique et non null
ALTER TABLE public.profiles 
  ALTER COLUMN user_id SET NOT NULL,
  DROP CONSTRAINT IF EXISTS profiles_user_id_unique,
  ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 6. Index de performance si pas déjà créé
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 7. Améliorer la fonction upsert_profile pour être compatible RLS
CREATE OR REPLACE FUNCTION public.upsert_profile(
  _user_id uuid, 
  _email text, 
  _full_name text,
  _phone text DEFAULT NULL,
  _avatar_url text DEFAULT NULL,
  _display_name text DEFAULT NULL,
  _bio text DEFAULT NULL,
  _location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Important : SECURITY DEFINER pour outrepasser RLS
SET search_path = public
AS $$
DECLARE
  result_id uuid;
BEGIN
  -- Vérifier que l'utilisateur est autorisé (seulement son propre profil)
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Non autorisé à modifier ce profil';
  END IF;

  INSERT INTO profiles (
    user_id, 
    email, 
    full_name,
    phone,
    avatar_url,
    display_name,
    bio,
    location,
    created_at, 
    updated_at
  ) VALUES (
    _user_id, 
    _email, 
    _full_name,
    _phone,
    _avatar_url,
    _display_name,
    _bio,
    _location,
    now(), 
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    bio = COALESCE(EXCLUDED.bio, profiles.bio),
    location = COALESCE(EXCLUDED.location, profiles.location),
    updated_at = now()
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;

-- 8. Commentaires explicatifs
COMMENT ON POLICY "profiles_select_public" ON public.profiles IS 'Tous les utilisateurs peuvent voir tous les profils publics';
COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'Les utilisateurs ne peuvent créer que leur propre profil';
COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'Les utilisateurs ne peuvent modifier que leur propre profil';
COMMENT ON FUNCTION public.upsert_profile IS 'Fonction sécurisée pour upsert de profil avec vérifications d''autorisation';