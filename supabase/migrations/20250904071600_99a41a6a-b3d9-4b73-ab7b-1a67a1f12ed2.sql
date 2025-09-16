-- Supprimer temporairement la vue qui utilise la colonne status
DROP VIEW IF EXISTS public.public_mission_tracking CASCADE;

-- Extension des statuts de mission pour le système FleetCheck
ALTER TABLE public.missions 
DROP CONSTRAINT IF EXISTS missions_status_check;

-- Création d'un nouveau type enum pour les statuts étendus
DROP TYPE IF EXISTS mission_status_extended CASCADE;
CREATE TYPE mission_status_extended AS ENUM (
  'pending',           -- En attente
  'inspection_start',  -- Inspection départ 
  'in_progress',       -- En cours (convoyage)
  'inspection_end',    -- Inspection arrivée
  'cost_validation',   -- Validation frais et documents
  'completed',         -- Terminée
  'cancelled'          -- Annulée
);

-- Mise à jour de la colonne status avec le nouveau type
ALTER TABLE public.missions 
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE mission_status_extended USING status::text::mission_status_extended,
ALTER COLUMN status SET DEFAULT 'pending'::mission_status_extended;

-- Recréer la vue public_mission_tracking avec les colonnes qui existent
CREATE VIEW public.public_mission_tracking AS
SELECT 
  id,
  title,
  reference,
  status::text as status,
  pickup_address,
  delivery_address,
  vehicle_brand,
  vehicle_model,
  pickup_date,
  delivery_date,
  created_at,
  updated_at
FROM public.missions
WHERE status IN ('in_progress', 'inspection_end', 'cost_validation');

-- Table pour les inspections de départ
CREATE TABLE public.inspection_departures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  
  -- Données techniques
  initial_mileage NUMERIC NOT NULL,
  initial_fuel TEXT NOT NULL CHECK (initial_fuel IN ('full', 'three_quarters', 'half', 'quarter', 'empty')),
  
  -- Photos (stockées dans Supabase Storage)
  photos JSONB NOT NULL DEFAULT '[]', -- Array d'URLs des photos
  
  -- Notes et observations
  internal_notes TEXT,
  
  -- Signature client
  client_signature_url TEXT,
  client_email TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les inspections d'arrivée
CREATE TABLE public.inspection_arrivals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  
  -- Données techniques
  final_mileage NUMERIC NOT NULL,
  final_fuel TEXT NOT NULL CHECK (final_fuel IN ('full', 'three_quarters', 'half', 'quarter', 'empty')),
  
  -- Photos (stockées dans Supabase Storage)
  photos JSONB NOT NULL DEFAULT '[]', -- Array d'URLs des photos
  
  -- Notes et observations
  client_notes TEXT,
  driver_notes TEXT,
  
  -- Signature client
  client_signature_url TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les frais de mission
CREATE TABLE public.mission_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  
  -- Types de frais
  fuel_costs NUMERIC DEFAULT 0,
  toll_costs NUMERIC DEFAULT 0,
  parking_costs NUMERIC DEFAULT 0,
  hotel_costs NUMERIC DEFAULT 0,
  meal_costs NUMERIC DEFAULT 0,
  other_costs NUMERIC DEFAULT 0,
  
  -- Justificatifs (URLs vers Supabase Storage)
  receipts JSONB NOT NULL DEFAULT '[]', -- Array d'URLs des justificatifs
  
  -- Notes sur les frais
  cost_notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les documents scannés
CREATE TABLE public.mission_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  
  -- Type de document
  document_type TEXT NOT NULL, -- 'PV', 'delivery_note', 'other'
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  
  -- OCR optionnel
  ocr_text TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les rapports générés
CREATE TABLE public.mission_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  
  -- Types de rapports
  main_report_url TEXT, -- Rapport principal (départ + arrivée + signatures)
  documents_report_url TEXT, -- Rapport documents annexes
  costs_report_url TEXT, -- Rapport justificatifs frais
  
  -- Statut d'envoi
  sent_to_client BOOLEAN DEFAULT false,
  sent_to_donor BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activation RLS sur toutes les tables
ALTER TABLE public.inspection_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_arrivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_reports ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can manage departure inspections for their missions" 
ON public.inspection_departures 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.missions 
  WHERE id = inspection_departures.mission_id 
  AND (created_by = auth.uid() OR donor_id = auth.uid() OR driver_id = auth.uid())
));

CREATE POLICY "Users can manage arrival inspections for their missions" 
ON public.inspection_arrivals 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.missions 
  WHERE id = inspection_arrivals.mission_id 
  AND (created_by = auth.uid() OR donor_id = auth.uid() OR driver_id = auth.uid())
));

CREATE POLICY "Users can manage costs for their missions" 
ON public.mission_costs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.missions 
  WHERE id = mission_costs.mission_id 
  AND (created_by = auth.uid() OR donor_id = auth.uid() OR driver_id = auth.uid())
));

CREATE POLICY "Users can manage documents for their missions" 
ON public.mission_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.missions 
  WHERE id = mission_documents.mission_id 
  AND (created_by = auth.uid() OR donor_id = auth.uid() OR driver_id = auth.uid())
));

CREATE POLICY "Users can view reports for their missions" 
ON public.mission_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.missions 
  WHERE id = mission_reports.mission_id 
  AND (created_by = auth.uid() OR donor_id = auth.uid() OR driver_id = auth.uid())
));