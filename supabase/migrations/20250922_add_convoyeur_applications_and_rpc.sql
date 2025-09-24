-- Migration: Convoyeur applications + documents bucket + RPC
-- Safe to run multiple times; uses IF NOT EXISTS guards where possible

begin;

-- 1) Table: convoyeur_applications
create table if not exists public.convoyeur_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  driving_license text,
  driving_experience int,
  vehicle_types text,
  motivation text,
  siret text,
  company_name text,
  kbis_document_url text,
  license_document_url text,
  vigilance_document_url text,
  garage_document_url text,
  status text default 'submitted',
  admin_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FKs to profiles by user_id if the table exists
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='profiles'
  ) then
    begin
      alter table public.convoyeur_applications
        add constraint convoyeur_applications_user_id_fkey
        foreign key (user_id) references public.profiles(user_id) on delete cascade;
    exception when duplicate_object then null; end;
    begin
      alter table public.convoyeur_applications
        add constraint convoyeur_applications_reviewed_by_fkey
        foreign key (reviewed_by) references public.profiles(user_id) on delete set null;
    exception when duplicate_object then null; end;
  end if;
end $$;

-- RLS
alter table public.convoyeur_applications enable row level security;

-- Policies: owner can crud their application rows
do $$ begin
  begin
    create policy convoyeur_apps_select_owner on public.convoyeur_applications
      for select using (auth.uid() = user_id or public.is_admin());
  exception when duplicate_object then null; end;
  begin
    create policy convoyeur_apps_insert_owner on public.convoyeur_applications
      for insert with check (auth.uid() = user_id or public.is_admin());
  exception when duplicate_object then null; end;
  begin
    create policy convoyeur_apps_update_owner on public.convoyeur_applications
      for update using (auth.uid() = user_id or public.is_admin())
      with check (auth.uid() = user_id or public.is_admin());
  exception when duplicate_object then null; end;
  begin
    create policy convoyeur_apps_delete_owner on public.convoyeur_applications
      for delete using (auth.uid() = user_id or public.is_admin());
  exception when duplicate_object then null; end;
end $$;

-- 2) Ensure documents bucket exists with sane policies (private)
insert into storage.buckets (id, name, public)
select 'documents','documents', false
where not exists (select 1 from storage.buckets where id = 'documents');

-- Storage policies for 'documents' bucket
-- Try to elevate role for policy creation on storage.objects (owned by Supabase)
do $$ begin
  begin
    execute 'set role supabase_admin';
  exception when others then null; end;
end $$;

do $$ begin
  begin
    create policy "documents: owner read" on storage.objects for select
      using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
  exception when duplicate_object or insufficient_privilege then null; end;
  begin
    create policy "documents: owner upload" on storage.objects for insert
      with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
  exception when duplicate_object or insufficient_privilege then null; end;
  begin
    create policy "documents: owner update" on storage.objects for update
      using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1])
      with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
  exception when duplicate_object or insufficient_privilege then null; end;
  begin
    create policy "documents: owner delete" on storage.objects for delete
      using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
  exception when duplicate_object or insufficient_privilege then null; end;
end $$;

-- Restore role if elevated
do $$ begin
  begin
    execute 'reset role';
  exception when others then null; end;
end $$;

-- 3) RPC: submit_convoyeur_application
create or replace function public.submit_convoyeur_application(
  _driving_license text,
  _driving_experience int,
  _vehicle_types text,
  _siret text default null,
  _company_name text default null,
  _motivation text default null,
  _kbis_url text default null,
  _license_url text default null,
  _vigilance_url text default null,
  _garage_url text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- upsert into convoyeur_applications (one active per user; keep history by insert new row)
  insert into public.convoyeur_applications (
    user_id, driving_license, driving_experience, vehicle_types,
    motivation, siret, company_name,
    kbis_document_url, license_document_url, vigilance_document_url, garage_document_url,
    status
  ) values (
    v_user, _driving_license, _driving_experience, _vehicle_types,
    _motivation, _siret, _company_name,
    _kbis_url, _license_url, _vigilance_url, _garage_url,
    'submitted'
  ) returning id into v_id;

  -- Mirror a few fields onto profiles for convenience if columns exist
  begin
    update public.profiles p
      set driving_license = coalesce(_driving_license, p.driving_license),
          driving_experience = coalesce(_driving_experience, p.driving_experience),
          vehicle_types = coalesce(_vehicle_types, p.vehicle_types),
          kbis_document_url = coalesce(_kbis_url, p.kbis_document_url),
          license_document_url = coalesce(_license_url, p.license_document_url),
          vigilance_document_url = coalesce(_vigilance_url, p.vigilance_document_url),
          garage_document_url = coalesce(_garage_url, p.garage_document_url),
          company_name = coalesce(_company_name, p.company_name),
          siret = coalesce(_siret, p.siret),
          updated_at = now()
    where p.user_id = v_user;
  exception when undefined_column then
    -- If some columns don't exist in profiles, ignore
    null;
  end;

  return v_id;
end $$;

grant execute on function public.submit_convoyeur_application(
  text, int, text, text, text, text, text, text, text, text
) to authenticated;

-- 4) Useful grants
grant usage, select on all sequences in schema public to authenticated;
grant select, insert, update, delete on public.convoyeur_applications to authenticated;

commit;
