-- Assurer un schéma stable pour les upserts sur public.profiles via user_id
begin;

-- 1) Ajouter la colonne user_id si manquante
alter table if exists public.profiles
  add column if not exists user_id uuid;

-- 2) Renseigner user_id à partir de id si vide (cohérence 1-1 auth.users)
update public.profiles
  set user_id = coalesce(user_id, id)
where user_id is null;

-- 3) Optionnel: référencer auth.users(id) pour la cohérence (ignore si déjà présent)
do $$ begin
  alter table public.profiles
    add constraint profiles_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;

-- 4) Dédupliquer d’éventuels doublons de user_id (garder la plus récente)
with ranked as (
  select ctid, user_id,
         row_number() over (partition by user_id order by updated_at desc nulls last, created_at desc nulls last, ctid desc) rn
  from public.profiles
  where user_id is not null
)
delete from public.profiles p using ranked r
where p.ctid = r.ctid and r.rn > 1;

-- 5) Rendre user_id NOT NULL si possible
do $$ begin
  alter table public.profiles alter column user_id set not null;
exception when others then null; end $$;

-- 6) Ajouter contrainte UNIQUE(user_id) nécessaire pour ON CONFLICT (upsert)
do $$ begin
  alter table public.profiles add constraint profiles_user_id_key unique (user_id);
exception when duplicate_object then null; end $$;

-- 7) Index de confort si non créé ailleurs
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- 8) Assouplir/compléter les policies RLS pour autoriser auth.uid() = user_id
-- Insert: autoriser l’upsert par user_id également
create policy if not exists profiles_insert_own_user_id on public.profiles
  for insert with check (auth.uid() = coalesce(user_id, id));

-- Update: autoriser la MAJ si on est le propriétaire via user_id ou id
create policy if not exists profiles_update_own_user_id on public.profiles
  for update using (auth.uid() = coalesce(user_id, id));

commit;
