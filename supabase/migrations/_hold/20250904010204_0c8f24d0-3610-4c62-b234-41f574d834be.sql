-- Vérification et correction des vues SECURITY DEFINER
-- La vue contacts_with_stats pourrait être problématique, la recréer sans SECURITY DEFINER

DROP VIEW IF EXISTS public.contacts_with_stats;

-- Recréation de la vue contacts_with_stats sans SECURITY DEFINER
CREATE VIEW public.contacts_with_stats AS
SELECT 
  c.*,
  COALESCE(m.missions_count, 0) as missions_count
FROM public.contacts c
LEFT JOIN (
  SELECT 
    CASE 
      WHEN driver_id IS NOT NULL THEN driver_id
      WHEN donor_id IS NOT NULL THEN donor_id
      ELSE created_by
    END as user_id,
    COUNT(*) as missions_count
  FROM public.missions
  GROUP BY 
    CASE 
      WHEN driver_id IS NOT NULL THEN driver_id
      WHEN donor_id IS NOT NULL THEN donor_id
      ELSE created_by
    END
) m ON c.invited_user_id = m.user_id;