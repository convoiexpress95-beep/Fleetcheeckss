-- Ensure missions table has status column
begin;

-- Check if status column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'missions'
          AND column_name = 'status'
    ) THEN
        -- Add status column with default value
        ALTER TABLE public.missions 
        ADD COLUMN status mission_status_extended DEFAULT 'pending'::mission_status_extended;
    END IF;
END $$;

commit;