-- Marketplace messaging: conversations, messages, policies, triggers, realtime, storage bucket
create extension if not exists pgcrypto;

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.marketplace_missions(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,       -- donneur d'ordre
  convoyeur_id uuid not null references auth.users(id) on delete cascade,   -- convoyeur
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade, -- FK to profiles.id (1-1 auth.users)
  content text not null,
  message_type text not null default 'text' check (message_type in ('text','attachment')),
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Indexes
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at);

-- Policies: conversations
drop policy if exists conversations_select_participants on public.conversations;
create policy conversations_select_participants
  on public.conversations for select
  using (
    owner_id = auth.uid() or convoyeur_id = auth.uid() or public.is_admin()
  );

drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants
  on public.conversations for insert
  with check (
    auth.uid() = owner_id or auth.uid() = convoyeur_id or public.is_admin()
  );

drop policy if exists conversations_update_participants on public.conversations;
create policy conversations_update_participants
  on public.conversations for update
  using (
    owner_id = auth.uid() or convoyeur_id = auth.uid() or public.is_admin()
  );

-- Policies: messages
drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.owner_id = auth.uid() or c.convoyeur_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists messages_insert_sender_and_participant on public.messages;
create policy messages_insert_sender_and_participant
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.owner_id = auth.uid() or c.convoyeur_id = auth.uid() or public.is_admin())
    )
  );

-- Allow receiver to mark as read
drop policy if exists messages_update_receiver_can_mark_read on public.messages;
create policy messages_update_receiver_can_mark_read
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.owner_id = auth.uid() or c.convoyeur_id = auth.uid() or public.is_admin())
    )
    and sender_id <> auth.uid()
  );

-- Trigger to auto update updated_at on conversations
do $$ begin
  execute 'drop trigger if exists set_updated_at_conversations on public.conversations';
  execute 'create trigger set_updated_at_conversations before update on public.conversations for each row execute function public.update_updated_at_column()';
exception when undefined_function then
  -- fallback simple trigger function if update_updated_at_column doesn't exist
  perform 1;
end $$;

-- Trigger to update conversations on new message
create or replace function public.tg_messages_after_insert()
returns trigger language plpgsql as $$
begin
  update public.conversations
     set last_message = left(new.content, 120),
         updated_at = now()
   where id = new.conversation_id;
  return new;
end; $$;

drop trigger if exists trg_messages_after_insert on public.messages;
create trigger trg_messages_after_insert
  after insert on public.messages
  for each row execute function public.tg_messages_after_insert();

-- Realtime publication for messages (manual step)
-- Note: L'ajout à la publication supabase_realtime peut nécessiter des privilèges d'owner.
-- Activez Realtime pour public.messages via le Dashboard Supabase (Database -> Replication)
-- ou exécutez ces commandes avec un rôle propriétaire:
--   alter table public.messages replica identity full;
--   alter publication supabase_realtime add table public.messages;

-- Storage bucket for message attachments (public read)
insert into storage.buckets (id, name, public)
  values ('message-attachments','message-attachments', true)
on conflict (id) do nothing;

-- Public read
drop policy if exists "message-attachments: public read" on storage.objects;
create policy "message-attachments: public read" on storage.objects
  for select using (bucket_id = 'message-attachments');

-- Authenticated upload under any path (keep simple)
drop policy if exists "message-attachments: authenticated upload" on storage.objects;
create policy "message-attachments: authenticated upload" on storage.objects
  for insert with check (bucket_id = 'message-attachments' and auth.role() = 'authenticated');

-- Optional: restrict updates/deletes (disabled by omission)
