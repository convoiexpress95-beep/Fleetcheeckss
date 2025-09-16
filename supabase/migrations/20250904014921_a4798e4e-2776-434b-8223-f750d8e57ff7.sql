-- Update missions table to use simplified status enum
ALTER TABLE public.missions 
ALTER COLUMN status DROP DEFAULT;

-- Update existing status values to match new enum
UPDATE public.missions 
SET status = CASE 
  WHEN status IN ('draft', 'published') THEN 'pending'
  WHEN status IN ('assigned', 'picked_up', 'in_transit', 'delivered') THEN 'in_progress'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'cancelled' THEN 'cancelled'
  ELSE 'pending'
END;

-- Recreate the mission_status enum with simplified values
DROP TYPE IF EXISTS mission_status CASCADE;
CREATE TYPE mission_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Update the column to use the new enum
ALTER TABLE public.missions 
ALTER COLUMN status TYPE mission_status USING status::mission_status;

-- Set the default value
ALTER TABLE public.missions 
ALTER COLUMN status SET DEFAULT 'pending';