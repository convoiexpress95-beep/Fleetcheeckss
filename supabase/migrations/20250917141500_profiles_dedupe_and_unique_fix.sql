-- Dédoublonnage et contrainte UNIQUE(user_id) pour public.profiles
-- Date: 2025-09-17

begin;

-- 1) Dédupliquer les profils par user_id en gardant l'enregistrement le plus récent
with ranked as (
  select ctid, user_id,
         row_number() over (partition by user_id order by updated_at desc nulls last, created_at desc nulls last, ctid desc) rn
  from public.profiles
  where user_id is not null
)
delete from public.profiles p using ranked r
where p.ctid = r.ctid and r.rn > 1;

-- 2) S'assurer que user_id est NOT NULL si possible
do $$ begin
  alter table public.profiles alter column user_id set not null;
exception when others then null; end $$;

-- 3) Ajouter la contrainte UNIQUE(user_id) si absente (vérification explicite dans pg_constraint)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_user_id_key'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_user_id_key unique (user_id);
  end if;
end $$;

-- 4) Index de confort si manquant
create index if not exists idx_profiles_user_id on public.profiles(user_id);

commit;