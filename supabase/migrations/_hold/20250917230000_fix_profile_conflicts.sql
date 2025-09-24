-- Disable automatic profile trigger to prevent conflicts with manual upserts
-- This migration temporarily disables the automatic profile creation trigger
-- to resolve 409 conflicts between trigger and manual profile operations

-- Supprimer le trigger automatique qui cause les conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Modifier la fonction handle_new_user pour être plus défensive
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne créer un profil que si il n'existe pas déjà
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING; -- Ignore les conflits
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Optionnel: recréer le trigger mais avec une logique plus défensive
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Améliorer la fonction upsert_profile pour gérer plus de champs
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
    email = EXCLUDED.email,
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

-- Commentaire explicatif
COMMENT ON FUNCTION public.upsert_profile IS 'Fonction sécurisée pour créer ou mettre à jour un profil utilisateur sans conflit';