-- Conversations between mission owner and convoyeur (marketplace)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.marketplace_missions(id) on delete cascade,
  owner_id uuid not null,
  convoyeur_id uuid not null,
  created_at timestamptz not null default now(),
  unique (mission_id, owner_id, convoyeur_id)
);

alter table if exists public.conversations enable row level security;

drop policy if exists "conversations select participants" on public.conversations;
drop policy if exists "conversations insert participants" on public.conversations;

create policy "conversations select participants"
  on public.conversations
  for select
  to authenticated
  using (auth.uid() in (owner_id, convoyeur_id));

create policy "conversations insert participants"
  on public.conversations
  for insert
  to authenticated
  with check (auth.uid() in (owner_id, convoyeur_id));

-- Messages within a conversation
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table if exists public.messages enable row level security;

drop policy if exists "messages select participants" on public.messages;
drop policy if exists "messages insert participants" on public.messages;

create policy "messages select participants"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.owner_id, c.convoyeur_id)
    )
  );

create policy "messages insert participants"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.owner_id, c.convoyeur_id)
    )
  );

-- Reviews/ratings for convoyeurs by mission owners
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null,
  author_user_id uuid not null,
  mission_id uuid not null references public.marketplace_missions(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (author_user_id, mission_id)
);

alter table if exists public.reviews enable row level security;

drop policy if exists "reviews select public" on public.reviews;
drop policy if exists "reviews insert eligible" on public.reviews;

create policy "reviews select public"
  on public.reviews
  for select
  to public
  using (true);

create policy "reviews insert eligible"
  on public.reviews
  for insert
  to authenticated
  with check (
    author_user_id = auth.uid() and
    exists (
      select 1 from public.marketplace_missions m
      where m.id = reviews.mission_id
        and m.created_by = auth.uid()
        and m.convoyeur_id = reviews.target_user_id
    )
  );

-- Verification documents
create table if not exists public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  doc_type text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table if exists public.verification_documents enable row level security;

drop policy if exists "verification_documents select owner or public" on public.verification_documents;
drop policy if exists "verification_documents insert owner" on public.verification_documents;
drop policy if exists "verification_documents delete owner" on public.verification_documents;

create policy "verification_documents select owner or public"
  on public.verification_documents
  for select
  to authenticated
  using (true);

create policy "verification_documents insert owner"
  on public.verification_documents
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "verification_documents delete owner"
  on public.verification_documents
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Enhance trajets with coordinates to enable proximity search
do $$ begin
  alter table public.trajets_partages add column if not exists start_lat double precision;
  alter table public.trajets_partages add column if not exists start_lng double precision;
  alter table public.trajets_partages add column if not exists end_lat double precision;
  alter table public.trajets_partages add column if not exists end_lng double precision;
exception when others then null; end $$;

-- Storage policies for profile-gallery bucket (must create bucket manually)
alter table if exists storage.objects enable row level security;

drop policy if exists "profile-gallery public read" on storage.objects;
drop policy if exists "profile-gallery insert owner" on storage.objects;
drop policy if exists "profile-gallery delete owner" on storage.objects;

create policy "profile-gallery public read"
  on storage.objects
  for select
  to public
  using (
    bucket_id = 'profile-gallery'
  );

create policy "profile-gallery insert owner"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-gallery'
    and split_part(name, '/', 1) = 'users'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "profile-gallery delete owner"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-gallery'
    and split_part(name, '/', 1) = 'users'
    and split_part(name, '/', 2) = auth.uid()::text
  );
