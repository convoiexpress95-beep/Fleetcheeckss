-- Ajouter des colonnes pour les informations du convoyeur dans la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS driving_license TEXT,
ADD COLUMN IF NOT EXISTS driving_experience INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_types TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS kbis_document_url TEXT,
ADD COLUMN IF NOT EXISTS license_document_url TEXT,
ADD COLUMN IF NOT EXISTS vigilance_document_url TEXT,
ADD COLUMN IF NOT EXISTS garage_document_url TEXT,
ADD COLUMN IF NOT EXISTS convoyeur_status TEXT DEFAULT 'pending';

-- Créer une table pour les demandes de convoyeur avec plus de détails
CREATE TABLE IF NOT EXISTS public.convoyeur_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  siret TEXT,
  company_name TEXT,
  driving_license TEXT,
  driving_experience INTEGER,
  vehicle_types TEXT,
  motivation TEXT,
  kbis_document_url TEXT,
  license_document_url TEXT,
  vigilance_document_url TEXT,
  garage_document_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS sur la table convoyeur_applications
ALTER TABLE public.convoyeur_applications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient seulement leurs propres demandes
CREATE POLICY "Users can view their own applications" 
ON public.convoyeur_applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent créer leur propre demande
CREATE POLICY "Users can create their own application" 
ON public.convoyeur_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leur demande en attente
CREATE POLICY "Users can update their pending application" 
ON public.convoyeur_applications 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Politique pour que les admins puissent tout voir et modifier
CREATE POLICY "Admins can manage all applications" 
ON public.convoyeur_applications 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_convoyeur_applications_updated_at
  BEFORE UPDATE ON public.convoyeur_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_convoyeur_applications_user_id 
ON public.convoyeur_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_convoyeur_applications_status 
ON public.convoyeur_applications(status);

-- Fonction pour soumettre une demande de convoyeur
CREATE OR REPLACE FUNCTION public.submit_convoyeur_application(
  _driving_license TEXT,
  _driving_experience INTEGER,
  _vehicle_types TEXT,
  _siret TEXT DEFAULT NULL,
  _company_name TEXT DEFAULT NULL,
  _motivation TEXT DEFAULT NULL,
  _kbis_url TEXT DEFAULT NULL,
  _license_url TEXT DEFAULT NULL,
  _vigilance_url TEXT DEFAULT NULL,
  _garage_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Créer la demande
  INSERT INTO public.convoyeur_applications (
    user_id, siret, company_name, driving_license, driving_experience,
    vehicle_types, motivation, kbis_document_url, license_document_url,
    vigilance_document_url, garage_document_url
  )
  VALUES (
    auth.uid(), _siret, _company_name, _driving_license, _driving_experience,
    _vehicle_types, _motivation, _kbis_url, _license_url, _vigilance_url, _garage_url
  )
  RETURNING id INTO application_id;
  
  -- Créer une notification pour les admins
  PERFORM create_notification(
    auth.uid(),
    'Nouvelle demande de convoyeur',
    'Une nouvelle demande de convoyeur a été soumise et attend votre validation.',
    'info'
  );
  
  RETURN application_id;
END;
$$;