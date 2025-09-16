-- Convoiturage: profils utilisateurs, avis et bucket avatars
create extension if not exists pgcrypto;

-- Table profiles (1-1 avec auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists profiles_select_all on public.profiles
  for select using (true);

create policy if not exists profiles_upsert_own on public.profiles
  for insert with check (auth.uid() = id);

create policy if not exists profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- Trigger updated_at
drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
for each row execute function public.tg_set_updated_at();

-- Table user_reviews (avis entre utilisateurs)
create table if not exists public.user_reviews (
  id uuid primary key default gen_random_uuid(),
  to_user_id uuid not null references auth.users(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (to_user_id, from_user_id)
);

alter table public.user_reviews enable row level security;

-- Lire les avis pour un utilisateur donné (public)
create policy if not exists user_reviews_select_public on public.user_reviews
  for select using (true);

-- Écrire un avis: l'auteur doit correspondre à auth.uid()
create policy if not exists user_reviews_insert_own on public.user_reviews
  for insert with check (auth.uid() = from_user_id);

-- Mettre à jour/supprimer son propre avis
create policy if not exists user_reviews_update_own on public.user_reviews
  for update using (auth.uid() = from_user_id);

create policy if not exists user_reviews_delete_own on public.user_reviews
  for delete using (auth.uid() = from_user_id);

-- Bucket avatars (public read)
insert into storage.buckets (id, name, public)
  values ('avatars','avatars', true)
on conflict (id) do nothing;

-- Policies storage avatars
-- Public read
create policy if not exists "avatars: public read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Authenticated can upload/update their own files under folder userId/
create policy if not exists "avatars: user upsert own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy if not exists "avatars: user update own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy if not exists "avatars: user delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Realtime publication (optional)
do $$ begin
  execute 'alter publication supabase_realtime add table public.profiles';
exception when duplicate_object then null; end $$;
do $$ begin
  execute 'alter publication supabase_realtime add table public.user_reviews';
exception when duplicate_object then null; end $$;
