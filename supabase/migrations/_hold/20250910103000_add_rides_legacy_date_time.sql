-- Add legacy date/time columns to rides if missing (idempotent)
-- Use this only if your app expects separate date & time columns on public.rides.

alter table if exists public.rides
  add column if not exists date date,
  add column if not exists time time;

-- Optional: simple index helpers
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='date') THEN
    EXECUTE 'create index if not exists idx_rides_date on public.rides (date)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='time') THEN
    EXECUTE 'create index if not exists idx_rides_time on public.rides (time)';
  END IF;
END $$;
