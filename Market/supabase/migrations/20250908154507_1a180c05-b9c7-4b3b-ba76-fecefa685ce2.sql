-- Complete fix for marketplace_devis RLS infinite recursion
-- Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "Convoyeurs can view their own devis" ON public.marketplace_devis;
DROP POLICY IF EXISTS "Mission creators can view devis for their missions" ON public.marketplace_devis;
DROP POLICY IF EXISTS "Mission creators can update devis status" ON public.marketplace_devis;
DROP POLICY IF EXISTS "Verified convoyeurs can create devis" ON public.marketplace_devis;
DROP POLICY IF EXISTS "marketplace_devis_insert" ON public.marketplace_devis;
DROP POLICY IF EXISTS "marketplace_devis_select" ON public.marketplace_devis;
DROP POLICY IF EXISTS "marketplace_devis_update" ON public.marketplace_devis;

-- Create simplified, non-recursive policies
CREATE POLICY "devis_insert_simple" 
ON public.marketplace_devis 
FOR INSERT 
WITH CHECK (convoyeur_id = auth.uid());

CREATE POLICY "devis_select_simple" 
ON public.marketplace_devis 
FOR SELECT 
USING (
  -- Convoyeur can see their own devis
  convoyeur_id = auth.uid() 
  OR 
  -- Mission owner can see devis for their missions
  EXISTS (
    SELECT 1 FROM public.marketplace_missions mm 
    WHERE mm.id = marketplace_devis.mission_id 
    AND mm.created_by = auth.uid()
  )
  OR
  -- Admins can see all
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

CREATE POLICY "devis_update_simple" 
ON public.marketplace_devis 
FOR UPDATE 
USING (
  -- Only convoyeur can update their own devis or mission owner can update status
  convoyeur_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.marketplace_missions mm 
    WHERE mm.id = marketplace_devis.mission_id 
    AND mm.created_by = auth.uid()
  )
);

-- Drop the security definer function as it's not needed with this approach
DROP FUNCTION IF EXISTS public.is_mission_owner(uuid);