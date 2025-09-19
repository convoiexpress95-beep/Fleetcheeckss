-- Fix Security Definer View issues by replacing problematic views with secure alternatives

-- Drop the existing problematic views
DROP VIEW IF EXISTS public.contacts_with_stats;
DROP VIEW IF EXISTS public.public_mission_tracking;

-- Recreate contacts_with_stats as a secure function that respects RLS
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
  WHERE c.user_id = auth.uid()  -- Enforce RLS: only show user's own contacts
     OR c.invited_user_id = auth.uid()  -- Or contacts where user is invited
     OR public.is_admin();  -- Or if user is admin
$$;

-- Create a secure function for public mission tracking that only shows appropriate data
CREATE OR REPLACE FUNCTION public.get_public_mission_tracking(tracking_token text DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    title text,
    reference text,
    status text,
    pickup_address text,
    delivery_address text,
    vehicle_brand text,
    vehicle_model text,
    pickup_date timestamp with time zone,
    delivery_date timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id,
    m.title,
    m.reference,
    m.status::text,
    m.pickup_address,
    m.delivery_address,
    m.vehicle_brand,
    m.vehicle_model,
    m.pickup_date,
    m.delivery_date,
    m.created_at,
    m.updated_at
  FROM public.missions m
  WHERE 
    CASE 
      WHEN tracking_token IS NOT NULL THEN
        -- If tracking token provided, use the existing secure function
        m.id IN (SELECT mission_id FROM public.get_mission_by_tracking_token(tracking_token))
      ELSE
        -- Otherwise, only show missions in progress that user has access to
        m.status IN ('in_progress', 'inspection_end', 'cost_validation')
        AND (m.created_by = auth.uid() OR m.donor_id = auth.uid() OR m.driver_id = auth.uid() OR public.is_admin())
    END;
$$;