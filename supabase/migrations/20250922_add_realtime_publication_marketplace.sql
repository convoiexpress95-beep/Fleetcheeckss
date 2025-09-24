-- Ensure marketplace tables are part of the realtime publication
DO $$
BEGIN
  -- Add base table
  BEGIN
    EXECUTE 'alter publication supabase_realtime add table public.fleetmarket_missions';
  EXCEPTION WHEN duplicate_object THEN
    -- already present
    NULL;
  END;

  -- Add marketplace_missions only if it's a BASE TABLE (not a view)
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'marketplace_missions' AND c.relkind = 'r' -- 'r' = ordinary table
  ) THEN
    BEGIN
      EXECUTE 'alter publication supabase_realtime add table public.marketplace_missions';
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END$$;