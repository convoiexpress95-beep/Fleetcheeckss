-- Ajoute des colonnes de compatibilité cross-app sur public.profiles
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='display_name'
  ) then
    alter table public.profiles add column display_name text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='bio'
  ) then
    alter table public.profiles add column bio text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='location'
  ) then
    alter table public.profiles add column location text;
  end if;
end $$;
