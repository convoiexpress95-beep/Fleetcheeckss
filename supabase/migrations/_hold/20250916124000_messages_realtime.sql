-- Configure Realtime support for public.messages
-- Note: Adding to publication supabase_realtime may require owner privileges.

begin;

-- Ensure full row data is available to Realtime
alter table if exists public.messages replica identity full;

-- If you have owner privileges, uncomment the next line or run it manually in the Dashboard SQL editor:
-- alter publication supabase_realtime add table public.messages;

commit;
