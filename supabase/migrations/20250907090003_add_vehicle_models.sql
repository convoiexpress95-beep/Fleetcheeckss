-- Vehicle models catalog and storage setup
-- Ensure pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;
create table if not exists public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  body_type text not null check (lower(body_type) in (
    'suv','berline','utilitaire','hatchback','break','monospace','pickup','camion','moto','autre'
  )),
  generation text null,
  image_path text null, -- path inside the 'vehicle-assets' bucket, e.g. models/peugeot/208.webp
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique index on normalized make/model/generation
create unique index if not exists vehicle_models_unique_idx
  on public.vehicle_models (lower(make), lower(model), coalesce(lower(generation), ''));

-- Enable RLS if table exists (it will, given the create above)
alter table public.vehicle_models enable row level security;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vehicle_models_updated_at on public.vehicle_models;
create trigger trg_vehicle_models_updated_at
before update on public.vehicle_models
for each row execute function public.set_updated_at();

-- RLS policies: read for authenticated; write for admins (user_roles.role='admin')
drop policy if exists vehicle_models_select_auth on public.vehicle_models;
create policy vehicle_models_select_auth
  on public.vehicle_models
  for select
  to authenticated
  using (true);

drop policy if exists vehicle_models_insert_admin on public.vehicle_models;
create policy vehicle_models_insert_admin
  on public.vehicle_models
  for insert
  to authenticated
  with check (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ));

drop policy if exists vehicle_models_update_admin on public.vehicle_models;
create policy vehicle_models_update_admin
  on public.vehicle_models
  for update
  to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ))
  with check (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ));

drop policy if exists vehicle_models_delete_admin on public.vehicle_models;
create policy vehicle_models_delete_admin
  on public.vehicle_models
  for delete
  to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ));

-- Create public storage bucket for vehicle assets (models and silhouettes)
do $$
begin
  perform storage.create_bucket('vehicle-assets', public => true);
exception when others then
  -- ignore if bucket already exists
  null;
end $$;

-- Storage RLS: public read, admin write for this bucket
-- Guarded creation of storage policies to avoid ownership errors on DROP
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'storage' and p.tablename = 'objects' and p.policyname = 'vehicle_assets_public_read'
  ) then
    create policy vehicle_assets_public_read on storage.objects
      for select to public
      using (bucket_id = 'vehicle-assets');
  end if;
exception when others then
  -- Ignore if insufficient privileges on storage schema
  null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'storage' and p.tablename = 'objects' and p.policyname = 'vehicle_assets_admin_all'
  ) then
    create policy vehicle_assets_admin_all on storage.objects
      for all to authenticated
      using (
        bucket_id = 'vehicle-assets' and exists (
          select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'
        )
      )
      with check (
        bucket_id = 'vehicle-assets' and exists (
          select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'
        )
      );
  end if;
exception when others then
  null;
end $$;
