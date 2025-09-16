-- Créer un type pour les rôles utilisateurs
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Créer une table pour les rôles utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.user_role NOT NULL DEFAULT 'user',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier si un utilisateur a un rôle spécifique (SECURITY DEFINER pour éviter la récursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction pour vérifier si l'utilisateur actuel est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.user_role)
$$;

-- Politiques RLS pour user_roles
CREATE POLICY "Les utilisateurs peuvent voir leurs propres rôles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Les admins peuvent gérer tous les rôles"
ON public.user_roles
FOR ALL
USING (public.is_admin());

-- Politique RLS admin pour profiles (voir tous les profils)
CREATE POLICY "Les admins peuvent voir tous les profils"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Politique RLS admin pour missions (voir toutes les missions)
CREATE POLICY "Les admins peuvent voir toutes les missions"
ON public.missions
FOR SELECT
USING (public.is_admin());

-- Politique RLS admin pour notifications
CREATE POLICY "Les admins peuvent voir toutes les notifications"
ON public.notifications
FOR SELECT
USING (public.is_admin());

-- Fonction pour assigner le rôle admin au premier utilisateur
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Compter le nombre d'utilisateurs existants
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Si c'est le premier utilisateur, le rendre admin
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Sinon, utilisateur normal
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::public.user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour assigner automatiquement les rôles
DROP TRIGGER IF EXISTS auto_assign_role_trigger ON auth.users;
CREATE TRIGGER auto_assign_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_role();