-- First, add a temporary column with text type
ALTER TABLE public.missions ADD COLUMN temp_status TEXT;

-- Copy current status values to temp column, mapping to new values
UPDATE public.missions 
SET temp_status = CASE 
  WHEN status::text IN ('draft', 'published') THEN 'pending'
  WHEN status::text IN ('assigned', 'picked_up', 'in_transit', 'delivered') THEN 'in_progress'
  WHEN status::text = 'completed' THEN 'completed'
  WHEN status::text = 'cancelled' THEN 'cancelled'
  ELSE 'pending'
END;

-- Drop the old status column
ALTER TABLE public.missions DROP COLUMN status;

-- Recreate the mission_status enum with simplified values
DROP TYPE IF EXISTS mission_status CASCADE;
CREATE TYPE mission_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Add the new status column with the correct type
ALTER TABLE public.missions ADD COLUMN status mission_status DEFAULT 'pending';

-- Copy values from temp column to new status column
UPDATE public.missions SET status = temp_status::mission_status;

-- Drop the temporary column
ALTER TABLE public.missions DROP COLUMN temp_status;

-- Make status not null
ALTER TABLE public.missions ALTER COLUMN status SET NOT NULL;