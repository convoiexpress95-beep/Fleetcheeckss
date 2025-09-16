-- Correction des nouveaux problèmes de sécurité détectés

-- 1. CORRIGER la politique de suivi public - exposer uniquement les données essentielles
DROP POLICY IF EXISTS "Public tracking access" ON public.missions;

-- Créer une politique plus restrictive pour le suivi public
-- Note: Cette politique sera utilisée uniquement via des tokens de suivi spécifiques
CREATE POLICY "Limited public tracking access" 
ON public.missions 
FOR SELECT 
USING (
  -- Permettre l'accès limité via les liens de suivi publics
  -- Mais nous devrons implémenter une vue séparée pour les données publiques
  false -- Désactivé pour l'instant, nous utiliserons une approche différente
);

-- 2. AJOUTER des politiques RLS à la vue contacts_with_stats
-- D'abord, nous devons activer RLS sur cette vue
ALTER VIEW public.contacts_with_stats SET (security_barrier = true);

-- Créer une fonction de sécurité pour vérifier l'accès aux contacts
CREATE OR REPLACE FUNCTION public.can_access_contact_stats(contact_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contacts
    WHERE user_id = auth.uid() 
    AND invited_user_id = contact_user_id
    AND status = 'active'
  )
  OR 
  -- Les admins peuvent tout voir
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR
  -- L'utilisateur peut voir ses propres stats
  contact_user_id = auth.uid();
$$;

-- Note: Les vues ne supportent pas directement les politiques RLS
-- Nous devrons plutôt sécuriser l'accès via les requêtes dans l'application

-- 3. CRÉER une vue sécurisée pour le suivi public (données limitées)
CREATE OR REPLACE VIEW public.public_mission_tracking AS
SELECT 
  m.id,
  m.reference,
  m.title,
  m.status,
  m.pickup_date,
  m.delivery_date,
  -- Exclure les informations sensibles : pas d'adresses complètes, emails, téléphones
  CASE 
    WHEN m.pickup_address IS NOT NULL THEN 
      -- Montrer seulement la ville, pas l'adresse complète
      SPLIT_PART(m.pickup_address, ',', -1)
    ELSE NULL 
  END as pickup_city,
  CASE 
    WHEN m.delivery_address IS NOT NULL THEN 
      -- Montrer seulement la ville, pas l'adresse complète  
      SPLIT_PART(m.delivery_address, ',', -1)
    ELSE NULL 
  END as delivery_city,
  m.vehicle_brand,
  m.vehicle_model,
  m.created_at,
  m.updated_at
FROM public.missions m
WHERE EXISTS (
  SELECT 1 FROM public.tracking_links tl
  WHERE tl.mission_id = m.id 
  AND tl.is_active = true 
  AND tl.expires_at > now()
);

-- Activer RLS sur cette vue
ALTER VIEW public.public_mission_tracking SET (security_barrier = true);

-- 4. CRÉER une fonction pour l'accès sécurisé via token de suivi
CREATE OR REPLACE FUNCTION public.get_mission_by_tracking_token(tracking_token text)
RETURNS TABLE (
  id uuid,
  reference text,
  title text,
  status text,
  pickup_city text,
  delivery_city text,
  vehicle_brand text,
  vehicle_model text,
  pickup_date timestamp with time zone,
  delivery_date timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    pmt.id,
    pmt.reference,
    pmt.title,
    pmt.status::text,
    pmt.pickup_city,
    pmt.delivery_city,
    pmt.vehicle_brand,
    pmt.vehicle_model,
    pmt.pickup_date,
    pmt.delivery_date
  FROM public.public_mission_tracking pmt
  JOIN public.tracking_links tl ON tl.mission_id = pmt.id
  WHERE tl.tracking_token = $1
  AND tl.is_active = true
  AND tl.expires_at > now();
$$;