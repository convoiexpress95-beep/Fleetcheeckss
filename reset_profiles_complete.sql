-- SCRIPT COMPLET DE REMISE À ZÉRO ET RECRÉATION PROPRE
-- Supprime tout et recrée la table profiles avec ses politiques RLS et fonction upsert
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. SUPPRESSION COMPLÈTE (faire table rase)
-- Supprimer la fonction si elle existe
DROP FUNCTION IF EXISTS public.upsert_profile(uuid, text, text, text, text, text, text, text);

-- Désactiver RLS temporairement
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques RLS existantes
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_upsert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_user_id" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_user_id" ON public.profiles;
DROP POLICY IF EXISTS "profiles_no_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON public.profiles;

-- Supprimer tous les index personnalisés
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_profiles_email;

-- Supprimer toutes les contraintes personnalisées
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_unique;

-- 2. RECRÉATION PROPRE DE LA TABLE
-- Supprimer et recréer la table complètement
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    avatar_url text,
    display_name text,
    bio text,
    location text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. RECRÉATION DES INDEX
CREATE INDEX idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX idx_profiles_email ON public.profiles (email);

-- 4. ACTIVATION DE RLS ET CRÉATION DES POLITIQUES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : Tous peuvent voir tous les profils (pour les contacts et recherche)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT 
  USING (true);

-- Politique INSERT : Seuls les utilisateurs peuvent créer leur propre profil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE : Seuls les propriétaires peuvent modifier leur profil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politique DELETE : Pas d'autorisation de suppression pour les utilisateurs normaux
CREATE POLICY "profiles_no_delete" ON public.profiles
  FOR DELETE 
  USING (false);

-- 5. CRÉATION DE LA FONCTION UPSERT SÉCURISÉE
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

-- 6. COMMENTAIRES ET PERMISSIONS
COMMENT ON TABLE public.profiles IS 'Profils utilisateur avec RLS sécurisé';
COMMENT ON FUNCTION public.upsert_profile IS 'Fonction sécurisée pour créer/modifier les profils utilisateur';

-- 7. TEST DE VÉRIFICATION
-- Vérifier que tout fonctionne
SELECT 'Table profiles créée' as status;
SELECT 'RLS activé: ' || rowsecurity as rls_status FROM pg_tables WHERE tablename = 'profiles';
SELECT 'Politiques RLS: ' || count(*)::text as policies_count FROM pg_policies WHERE tablename = 'profiles';
SELECT 'Fonction upsert_profile: ' || CASE WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'upsert_profile') THEN 'créée' ELSE 'manquante' END as function_status;