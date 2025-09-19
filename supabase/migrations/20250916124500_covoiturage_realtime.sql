-- Covoiturage Realtime configuration: ensure full row replication and try to add to publication
-- This enables richer UPDATE/DELETE payloads and improves stability of Supabase Realtime.

-- 1) Ensure FULL replica identity for all involved tables
alter table if exists public.rides replica identity full;
alter table if exists public.ride_reservations replica identity full;
alter table if exists public.ride_messages replica identity full;
alter table if exists public.ride_message_reads replica identity full;

-- 2) Try to add to Realtime publication (safe/no-op if insufficient privileges)
do $$
begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime add table public.rides';
    exception when others then
      -- ignore (likely requires owner privileges or already added)
      null;
    end;
    begin
      execute 'alter publication supabase_realtime add table public.ride_reservations';
    exception when others then
      null;
    end;
    begin
      execute 'alter publication supabase_realtime add table public.ride_messages';
    exception when others then
      null;
    end;
    begin
      execute 'alter publication supabase_realtime add table public.ride_message_reads';
    exception when others then
      null;
    end;
  end if;
end$$;

-- Note: If your role cannot modify publications, finish in Dashboard:
-- Database → Replication → supabase_realtime → Add tables:
--   public.rides, public.ride_reservations, public.ride_messages, public.ride_message_reads
