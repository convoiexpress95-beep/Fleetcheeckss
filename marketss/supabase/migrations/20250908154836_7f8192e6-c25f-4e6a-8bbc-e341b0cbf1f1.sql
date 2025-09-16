-- Fix foreign key constraint for conversations table
-- Drop the existing foreign key constraint
ALTER TABLE public.conversations 
DROP CONSTRAINT IF EXISTS conversations_mission_id_fkey;

-- Add the correct foreign key constraint pointing to marketplace_missions
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_mission_id_fkey 
FOREIGN KEY (mission_id) REFERENCES public.marketplace_missions(id) ON DELETE CASCADE;