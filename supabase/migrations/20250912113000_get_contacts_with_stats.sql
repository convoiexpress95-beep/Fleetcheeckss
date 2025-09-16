-- Migration: créer ou remplacer la fonction get_contacts_with_stats (sécurisée)
CREATE OR REPLACE FUNCTION public.get_contacts_with_stats()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    email text,
    name text,
    status contact_status,
    invited_user_id uuid,
    invited_at timestamp with time zone,
    accepted_at timestamp with time zone,
    declined_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    missions_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.user_id,
    c.email,
    c.name,
    c.status,
    c.invited_user_id,
    c.invited_at,
    c.accepted_at,
    c.declined_at,
    c.created_at,
    c.updated_at,
    COALESCE(public.get_contact_mission_count(c.invited_user_id), 0) as missions_count
  FROM public.contacts c
  WHERE c.user_id = auth.uid()
     OR c.invited_user_id = auth.uid()
     OR public.is_admin();
$$;

-- Optionnel: permissions d'exécution pour authenticated/ service role
GRANT EXECUTE ON FUNCTION public.get_contacts_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_contacts_with_stats() TO service_role;
