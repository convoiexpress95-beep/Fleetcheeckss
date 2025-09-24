-- Fix Convoiturage schema/policies for compatibility and idempotency
-- Align columns, policies, indexes, triggers, and realtime publication.

-- Ensure pgcrypto
create extension if not exists pgcrypto;

-- Rides: ensure columns exist (kept nullable for safe alteration)
alter table if exists public.rides add column if not exists driver_id uuid;
alter table if exists public.rides add column if not exists departure text;
alter table if exists public.rides add column if not exists destination text;
alter table if exists public.rides add column if not exists departure_time timestamptz;
alter table if exists public.rides add column if not exists duration_minutes int;
alter table if exists public.rides add column if not exists price numeric(8,2);
alter table if exists public.rides add column if not exists seats_total int;
-- seats_available may already exist with/without generation; don't force replace here
alter table if exists public.rides add column if not exists route text[] default '{}';
alter table if exists public.rides add column if not exists description text;
alter table if exists public.rides add column if not exists vehicle_model text;
alter table if exists public.rides add column if not exists options text[] default '{}';
alter table if exists public.rides add column if not exists status text default 'active';
alter table if exists public.rides add column if not exists created_at timestamptz default now();
alter table if exists public.rides add column if not exists updated_at timestamptz default now();

-- Rides: ensure FKs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='driver_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = 'rides' AND c.conname = 'rides_driver_id_fkey') THEN
      ALTER TABLE public.rides
        ADD CONSTRAINT rides_driver_id_fkey FOREIGN KEY (driver_id)
        REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Reservations: ensure columns exist
alter table if exists public.ride_reservations add column if not exists ride_id uuid;
alter table if exists public.ride_reservations add column if not exists passenger_id uuid;
alter table if exists public.ride_reservations add column if not exists seats int;
alter table if exists public.ride_reservations add column if not exists status text default 'pending';
alter table if exists public.ride_reservations add column if not exists price_at_booking numeric(8,2);
alter table if exists public.ride_reservations add column if not exists message text;
alter table if exists public.ride_reservations add column if not exists created_at timestamptz default now();
alter table if exists public.ride_reservations add column if not exists updated_at timestamptz default now();

-- Reservations: ensure FKs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_reservations' AND column_name='ride_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
      WHERE t.relname='ride_reservations' AND c.conname='ride_reservations_ride_id_fkey') THEN
      ALTER TABLE public.ride_reservations
        ADD CONSTRAINT ride_reservations_ride_id_fkey FOREIGN KEY (ride_id)
        REFERENCES public.rides(id) ON DELETE CASCADE;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_reservations' AND column_name='passenger_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
      WHERE t.relname='ride_reservations' AND c.conname='ride_reservations_passenger_id_fkey') THEN
      ALTER TABLE public.ride_reservations
        ADD CONSTRAINT ride_reservations_passenger_id_fkey FOREIGN KEY (passenger_id)
        REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Messages: ensure columns exist
alter table if exists public.ride_messages add column if not exists ride_id uuid;
alter table if exists public.ride_messages add column if not exists sender_id uuid;
alter table if exists public.ride_messages add column if not exists content text;
alter table if exists public.ride_messages add column if not exists created_at timestamptz default now();

-- Message reads: ensure read_at exists
alter table if exists public.ride_message_reads add column if not exists read_at timestamptz default now();

-- Enable RLS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rides') THEN
    ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ride_reservations') THEN
    ALTER TABLE public.ride_reservations ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ride_messages') THEN
    ALTER TABLE public.ride_messages ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ride_message_reads') THEN
    ALTER TABLE public.ride_message_reads ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies: drop and recreate for deterministic state
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rides') THEN
    DROP POLICY IF EXISTS rides_select_all ON public.rides;
    DROP POLICY IF EXISTS rides_insert_own ON public.rides;
    DROP POLICY IF EXISTS rides_update_own ON public.rides;
    DROP POLICY IF EXISTS rides_delete_own ON public.rides;

    CREATE POLICY rides_select_all ON public.rides
      FOR SELECT USING (true);
    CREATE POLICY rides_insert_own ON public.rides
      FOR INSERT WITH CHECK (auth.uid() = driver_id);
    CREATE POLICY rides_update_own ON public.rides
      FOR UPDATE USING (auth.uid() = driver_id);
    CREATE POLICY rides_delete_own ON public.rides
      FOR DELETE USING (auth.uid() = driver_id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ride_reservations') THEN
    DROP POLICY IF EXISTS ride_reservations_select ON public.ride_reservations;
    DROP POLICY IF EXISTS ride_reservations_insert ON public.ride_reservations;
    DROP POLICY IF EXISTS ride_reservations_update ON public.ride_reservations;
    DROP POLICY IF EXISTS ride_reservations_delete ON public.ride_reservations;

    CREATE POLICY ride_reservations_select ON public.ride_reservations
      FOR SELECT USING (
        auth.uid() = passenger_id OR auth.uid() = (SELECT driver_id FROM public.rides r WHERE r.id = ride_id)
      );
    CREATE POLICY ride_reservations_insert ON public.ride_reservations
      FOR INSERT WITH CHECK (auth.uid() = passenger_id);
    CREATE POLICY ride_reservations_update ON public.ride_reservations
      FOR UPDATE USING (
        auth.uid() = passenger_id OR auth.uid() = (SELECT driver_id FROM public.rides r WHERE r.id = ride_id)
      );
    CREATE POLICY ride_reservations_delete ON public.ride_reservations
      FOR DELETE USING (
        auth.uid() = passenger_id OR auth.uid() = (SELECT driver_id FROM public.rides r WHERE r.id = ride_id)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ride_messages') THEN
    DROP POLICY IF EXISTS ride_messages_select ON public.ride_messages;
    DROP POLICY IF EXISTS ride_messages_insert ON public.ride_messages;

    CREATE POLICY ride_messages_select ON public.ride_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.rides r WHERE r.id = ride_id AND r.driver_id = auth.uid()
        ) OR EXISTS (
          SELECT 1 FROM public.ride_reservations rr WHERE rr.ride_id = ride_id AND rr.passenger_id = auth.uid()
        )
      );
    CREATE POLICY ride_messages_insert ON public.ride_messages
      FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND (
          EXISTS (SELECT 1 FROM public.rides r WHERE r.id = ride_id AND r.driver_id = auth.uid()) OR
          EXISTS (SELECT 1 FROM public.ride_reservations rr WHERE rr.ride_id = ride_id AND rr.passenger_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ride_message_reads') THEN
    DROP POLICY IF EXISTS ride_message_reads_select ON public.ride_message_reads;
    DROP POLICY IF EXISTS ride_message_reads_insert ON public.ride_message_reads;

    CREATE POLICY ride_message_reads_select ON public.ride_message_reads
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY ride_message_reads_insert ON public.ride_message_reads
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Triggers for updated_at
create or replace function public.tg_set_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end; $$ language plpgsql;

drop trigger if exists set_updated_at_rides on public.rides;
create trigger set_updated_at_rides before update on public.rides
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at_reservations on public.ride_reservations;
create trigger set_updated_at_reservations before update on public.ride_reservations
for each row execute function public.tg_set_updated_at();

-- Indexes guarded by column checks
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='departure')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='destination') THEN
    EXECUTE 'create index if not exists idx_rides_route on public.rides (departure, destination)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='departure_time') THEN
    EXECUTE 'create index if not exists idx_rides_times on public.rides (departure_time desc)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='rides' AND column_name='driver_id') THEN
    EXECUTE 'create index if not exists idx_rides_driver on public.rides (driver_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_reservations' AND column_name='ride_id') THEN
    EXECUTE 'create index if not exists idx_reservations_ride on public.ride_reservations (ride_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_reservations' AND column_name='passenger_id') THEN
    EXECUTE 'create index if not exists idx_reservations_passenger on public.ride_reservations (passenger_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_messages' AND column_name='ride_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_messages' AND column_name='created_at') THEN
    EXECUTE 'create index if not exists idx_ride_messages_ride_created on public.ride_messages (ride_id, created_at desc)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_messages' AND column_name='sender_id') THEN
    EXECUTE 'create index if not exists idx_ride_messages_sender on public.ride_messages (sender_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_message_reads' AND column_name='user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ride_message_reads' AND column_name='read_at') THEN
    EXECUTE 'create index if not exists idx_ride_message_reads_user on public.ride_message_reads (user_id, read_at desc)';
  END IF;
END $$;

-- Realtime publication additions
DO $$ BEGIN
  BEGIN
    EXECUTE 'alter publication supabase_realtime add table public.rides';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'alter publication supabase_realtime add table public.ride_reservations';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'alter publication supabase_realtime add table public.ride_messages';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'alter publication supabase_realtime add table public.ride_message_reads';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
