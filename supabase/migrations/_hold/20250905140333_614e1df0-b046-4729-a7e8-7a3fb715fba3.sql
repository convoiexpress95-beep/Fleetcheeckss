-- Ajouter des colonnes à la table profiles pour la vérification des convoyeurs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Créer la table verification_documents pour stocker les documents des convoyeurs
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('kbis', 'permis', 'assurance', 'urssaf')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table marketplace_missions
CREATE TABLE public.marketplace_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  convoyeur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  description TEXT,
  ville_depart TEXT NOT NULL,
  ville_arrivee TEXT NOT NULL,
  date_depart TIMESTAMP WITH TIME ZONE NOT NULL,
  prix_propose NUMERIC(10,2),
  statut TEXT DEFAULT 'ouverte' CHECK (statut IN ('ouverte', 'en_negociation', 'attribuee', 'terminee')),
  vehicule_requis TEXT,
  contact_visible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table marketplace_devis pour les devis des convoyeurs
CREATE TABLE public.marketplace_devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.marketplace_missions(id) ON DELETE CASCADE,
  convoyeur_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prix_propose NUMERIC(10,2) NOT NULL,
  message TEXT,
  statut TEXT DEFAULT 'envoye' CHECK (statut IN ('envoye', 'accepte', 'refuse')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mission_id, convoyeur_id)
);

-- Créer la table trajets_partages
CREATE TABLE public.trajets_partages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convoyeur_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ville_depart TEXT NOT NULL,
  ville_arrivee TEXT NOT NULL,
  date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
  nb_places INTEGER NOT NULL DEFAULT 1,
  prix_par_place NUMERIC(8,2),
  description TEXT,
  participants UUID[] DEFAULT '{}',
  statut TEXT DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'complet', 'termine', 'annule')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trajets_partages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour verification_documents
CREATE POLICY "Users can manage their own verification documents" 
ON public.verification_documents 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification documents" 
ON public.verification_documents 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update verification documents" 
ON public.verification_documents 
FOR UPDATE 
USING (is_admin());

-- Politiques RLS pour marketplace_missions  
CREATE POLICY "Everyone can view marketplace missions" 
ON public.marketplace_missions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create marketplace missions" 
ON public.marketplace_missions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Mission creators can update their missions" 
ON public.marketplace_missions 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all marketplace missions" 
ON public.marketplace_missions 
FOR ALL 
USING (is_admin());

-- Politiques RLS pour marketplace_devis
CREATE POLICY "Mission creators can view devis for their missions" 
ON public.marketplace_devis 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.marketplace_missions 
  WHERE id = marketplace_devis.mission_id 
  AND created_by = auth.uid()
));

CREATE POLICY "Convoyeurs can view their own devis" 
ON public.marketplace_devis 
FOR SELECT 
USING (auth.uid() = convoyeur_id);

CREATE POLICY "Verified convoyeurs can create devis" 
ON public.marketplace_devis 
FOR INSERT 
WITH CHECK (
  auth.uid() = convoyeur_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_verified = true
  )
);

CREATE POLICY "Mission creators can update devis status" 
ON public.marketplace_devis 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.marketplace_missions 
  WHERE id = marketplace_devis.mission_id 
  AND created_by = auth.uid()
));

-- Politiques RLS pour trajets_partages
CREATE POLICY "Everyone can view trajets partages" 
ON public.trajets_partages 
FOR SELECT 
USING (true);

CREATE POLICY "Convoyeurs can create trajets partages" 
ON public.trajets_partages 
FOR INSERT 
WITH CHECK (auth.uid() = convoyeur_id);

CREATE POLICY "Convoyeurs can update their own trajets" 
ON public.trajets_partages 
FOR UPDATE 
USING (auth.uid() = convoyeur_id);

CREATE POLICY "Convoyeurs can delete their own trajets" 
ON public.trajets_partages 
FOR DELETE 
USING (auth.uid() = convoyeur_id);

-- Créer des triggers pour les timestamps
CREATE TRIGGER update_verification_documents_updated_at
BEFORE UPDATE ON public.verification_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_missions_updated_at
BEFORE UPDATE ON public.marketplace_missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_devis_updated_at
BEFORE UPDATE ON public.marketplace_devis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trajets_partages_updated_at
BEFORE UPDATE ON public.trajets_partages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();