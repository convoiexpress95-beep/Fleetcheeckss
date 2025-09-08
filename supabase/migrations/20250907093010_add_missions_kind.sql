-- Add mission kind to separate marketplace vs inspection
-- Idempotent creation of enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_kind') THEN
    CREATE TYPE public.mission_kind AS ENUM ('marketplace', 'inspection');
  END IF;
END$$;

-- Add column with default
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS kind public.mission_kind DEFAULT 'marketplace'::public.mission_kind;

-- Backfill nulls
UPDATE public.missions SET kind = 'marketplace'::public.mission_kind WHERE kind IS NULL;

-- Index for filtering
CREATE INDEX IF NOT EXISTS missions_kind_idx ON public.missions (kind);
