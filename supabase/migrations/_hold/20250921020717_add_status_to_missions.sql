-- Add status column to missions table if it doesn't exist
DO $$
BEGIN
    -- Check if status column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'missions' 
        AND column_name = 'status'
    ) THEN
        -- Add the status column
        ALTER TABLE public.missions 
        ADD COLUMN status mission_status_extended DEFAULT 'pending'::mission_status_extended NOT NULL;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions (status);
    END IF;
END $$;