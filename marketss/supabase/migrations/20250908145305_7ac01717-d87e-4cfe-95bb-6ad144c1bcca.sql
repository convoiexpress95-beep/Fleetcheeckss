-- Créer la table profiles pour stocker les données utilisateur étendues
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  user_type TEXT CHECK (user_type IN ('convoyeur', 'donneur_ordre')),
  avatar_url TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  verification_notes TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view profiles in conversations"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.owner_id = auth.uid() OR c.convoyeur_id = auth.uid())
    AND (c.owner_id = profiles.user_id OR c.convoyeur_id = profiles.user_id)
  )
);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'first_name' || ' ' || NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'convoyeur')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();