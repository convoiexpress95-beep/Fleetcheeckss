-- Corriger les problèmes de sécurité liés aux vues SECURITY DEFINER
-- D'abord, supprimer la vue existante contacts_with_stats si elle existe
DROP VIEW IF EXISTS public.contacts_with_stats;

-- Recréer la vue sans SECURITY DEFINER 
CREATE VIEW public.contacts_with_stats AS
SELECT 
  c.*,
  COALESCE(mission_stats.missions_count, 0) as missions_count
FROM public.contacts c
LEFT JOIN (
  SELECT 
    driver_id,
    COUNT(*) as missions_count
  FROM public.missions 
  GROUP BY driver_id
) mission_stats ON mission_stats.driver_id = c.invited_user_id;

-- Vérifier et corriger les autres vues si nécessaires
-- (Les erreurs indiquent 2 vues avec SECURITY DEFINER, cherchons les autres)

-- Créer une fonction pour obtenir les statistiques de contact de manière sécurisée
CREATE OR REPLACE FUNCTION public.get_contact_mission_count(contact_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.missions
  WHERE driver_id = contact_user_id
    AND (
      -- L'utilisateur peut voir les stats de ses contacts
      EXISTS (
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
      contact_user_id = auth.uid()
    );
$$;