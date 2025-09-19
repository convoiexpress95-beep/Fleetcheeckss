-- Migration manuelle pour corriger les erreurs 404/406/409 sur les profils
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Créer la fonction upsert_profile manquante (erreur 404)
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
SECURITY DEFINER
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

-- 2. Nettoyer et simplifier les politiques RLS pour corriger les erreurs 406/409
-- Supprimer toutes les anciennes politiques conflictuelles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_upsert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_user_id" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_user_id" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON public.profiles;

-- S'assurer que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS simples et cohérentes
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT 
  USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3. S'assurer que user_id est unique
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_id_unique,
  ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 4. Index de performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);