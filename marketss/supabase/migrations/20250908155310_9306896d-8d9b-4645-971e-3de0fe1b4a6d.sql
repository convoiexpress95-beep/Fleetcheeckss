-- Check and fix potential issues with devis creation and messaging

-- First, let's check if there are any unique constraints causing conflicts
-- Drop and recreate the trigger for conversation creation more safely

DROP TRIGGER IF EXISTS create_conversation_for_devis_trigger ON public.marketplace_devis;
DROP FUNCTION IF EXISTS public.create_conversation_for_devis();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.create_conversation_for_devis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mission_owner UUID;
  conversation_exists BOOLEAN;
BEGIN
  -- Get the mission owner
  SELECT created_by INTO mission_owner 
  FROM public.marketplace_missions 
  WHERE id = NEW.mission_id;
  
  -- Check if conversation already exists
  SELECT EXISTS(
    SELECT 1 FROM public.conversations 
    WHERE mission_id = NEW.mission_id 
    AND ((owner_id = mission_owner AND convoyeur_id = NEW.convoyeur_id) 
         OR (owner_id = NEW.convoyeur_id AND convoyeur_id = mission_owner))
  ) INTO conversation_exists;
  
  -- Create conversation only if it doesn't exist
  IF NOT conversation_exists AND mission_owner IS NOT NULL THEN
    INSERT INTO public.conversations (mission_id, owner_id, convoyeur_id)
    VALUES (NEW.mission_id, mission_owner, NEW.convoyeur_id)
    ON CONFLICT DO NOTHING; -- Ignore conflicts
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the devis creation
    RAISE WARNING 'Failed to create conversation: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER create_conversation_for_devis_trigger
  AFTER INSERT ON public.marketplace_devis
  FOR EACH ROW
  EXECUTE FUNCTION public.create_conversation_for_devis();

-- Also ensure there's no duplicate constraint that could cause 409 errors
-- Add a unique constraint to prevent duplicate devis from same convoyeur for same mission
ALTER TABLE public.marketplace_devis 
DROP CONSTRAINT IF EXISTS unique_devis_per_mission_convoyeur;

-- Add the constraint back with ON CONFLICT handling in mind
ALTER TABLE public.marketplace_devis 
ADD CONSTRAINT unique_devis_per_mission_convoyeur 
UNIQUE (mission_id, convoyeur_id);