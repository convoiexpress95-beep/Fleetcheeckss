-- Fix infinite recursion in marketplace_devis RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Mission creators can view devis for their missions" ON public.marketplace_devis;
DROP POLICY IF EXISTS "Mission creators can update devis status" ON public.marketplace_devis;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_mission_owner(_mission_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM marketplace_missions
    WHERE id = _mission_id AND created_by = auth.uid()
  );
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Mission creators can view devis for their missions" 
ON public.marketplace_devis 
FOR SELECT 
USING (public.is_mission_owner(mission_id));

CREATE POLICY "Mission creators can update devis status" 
ON public.marketplace_devis 
FOR UPDATE 
USING (public.is_mission_owner(mission_id));