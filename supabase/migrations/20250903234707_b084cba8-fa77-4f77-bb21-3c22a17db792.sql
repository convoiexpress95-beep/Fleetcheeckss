-- Créer le type enum pour les rôles
CREATE TYPE public.app_role as ENUM ('admin', 'donneur_d_ordre', 'convoyeur');

-- Créer le type enum pour les statuts utilisateur
CREATE TYPE public.user_status as ENUM ('active', 'inactive', 'banned');

-- Créer le type enum pour les statuts de contact
CREATE TYPE public.contact_status as ENUM ('pending', 'accepted', 'declined', 'active');

-- Créer le type enum pour les statuts de mission
CREATE TYPE public.mission_status as ENUM ('draft', 'published', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled');

-- Table des profils utilisateur
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'convoyeur',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  status contact_status NOT NULL DEFAULT 'pending',
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Table des missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  description TEXT,
  status mission_status NOT NULL DEFAULT 'draft',
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pickup_address TEXT,
  delivery_address TEXT,
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Les utilisateurs peuvent voir tous les profils" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leur propre profil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour contacts
CREATE POLICY "Les propriétaires peuvent gérer leurs contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Les invités peuvent voir et modifier leurs invitations" ON public.contacts
  FOR SELECT USING (auth.uid() = invited_user_id);

CREATE POLICY "Les invités peuvent accepter/refuser leurs invitations" ON public.contacts
  FOR UPDATE USING (auth.uid() = invited_user_id);

-- Politiques RLS pour missions
CREATE POLICY "Les utilisateurs peuvent voir toutes les missions" ON public.missions
  FOR SELECT USING (true);

CREATE POLICY "Les créateurs peuvent gérer leurs missions" ON public.missions
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Les donneurs d'ordre peuvent voir leurs missions" ON public.missions
  FOR SELECT USING (auth.uid() = donor_id);

CREATE POLICY "Les convoyeurs peuvent voir leurs missions assignées" ON public.missions
  FOR SELECT USING (auth.uid() = driver_id);

-- Vue pour les contacts avec statistiques
CREATE OR REPLACE VIEW public.contacts_with_stats AS
SELECT 
  c.*,
  COALESCE(m.missions_count, 0) as missions_count
FROM public.contacts c
LEFT JOIN (
  SELECT 
    CASE 
      WHEN c2.user_id = m2.created_by AND c2.invited_user_id = m2.donor_id THEN c2.id
      WHEN c2.user_id = m2.created_by AND c2.invited_user_id = m2.driver_id THEN c2.id
      WHEN c2.invited_user_id = m2.created_by AND c2.user_id = m2.donor_id THEN c2.id
      WHEN c2.invited_user_id = m2.created_by AND c2.user_id = m2.driver_id THEN c2.id
    END as contact_id,
    COUNT(*) as missions_count
  FROM public.contacts c2
  INNER JOIN public.missions m2 ON (
    (c2.user_id = m2.created_by AND c2.invited_user_id IN (m2.donor_id, m2.driver_id)) OR
    (c2.invited_user_id = m2.created_by AND c2.user_id IN (m2.donor_id, m2.driver_id))
  )
  GROUP BY contact_id
) m ON c.id = m.contact_id;

-- Fonction RPC pour rechercher des profils par email
CREATE OR REPLACE FUNCTION public.search_profiles_by_email(query TEXT)
RETURNS TABLE(id UUID, email TEXT, full_name TEXT) 
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.full_name
  FROM public.profiles p
  WHERE p.email ILIKE '%' || query || '%'
  ORDER BY p.full_name
  LIMIT 10;
$$;

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_invited_user_id ON public.contacts(invited_user_id);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_missions_created_by ON public.missions(created_by);
CREATE INDEX idx_missions_donor_id ON public.missions(donor_id);
CREATE INDEX idx_missions_driver_id ON public.missions(driver_id);
CREATE INDEX idx_missions_status ON public.missions(status);
CREATE INDEX idx_missions_reference ON public.missions(reference);