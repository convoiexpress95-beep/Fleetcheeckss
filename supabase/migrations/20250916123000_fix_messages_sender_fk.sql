-- Fix messages.sender_id to reference auth.users(id) instead of profiles(id)
-- and migrate existing rows accordingly.

begin;

-- 1) Drop existing FK if present (likely auto-named)
alter table if exists public.messages
  drop constraint if exists messages_sender_id_fkey;

-- 2) If previous data used profiles.id, convert to profiles.user_id (auth.users.id)
--    This is safe if messages.sender_id currently matches profiles.id.
update public.messages m
set sender_id = p.user_id
from public.profiles p
where m.sender_id = p.id
  and p.user_id is not null;

-- 3) Add new FK referencing auth.users
alter table public.messages
  add constraint messages_sender_id_fkey
  foreign key (sender_id) references auth.users(id)
  on delete cascade;

commit;
