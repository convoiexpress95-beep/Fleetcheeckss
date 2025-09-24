-- Create dedicated bucket for company logos with safe public-read and owner-managed writes
-- Enables cleaner separation from avatars and predictable public URLs for PDFs

-- Try to elevate privileges so we can manage storage policies on storage.objects (owned by supabase roles)
do $$ begin
  begin
    execute 'set role supabase_admin';
  exception when others then
    -- Role may not exist or current user may not have permission; continue without elevating
    null;
  end;
end $$;

-- Ensure RLS is enabled on storage.objects (ignore if current role is not owner)
do $$ begin
  begin
    alter table if exists storage.objects enable row level security;
  exception when insufficient_privilege then
    -- Not owner of storage.objects; skip enabling RLS (usually already enabled by Supabase)
    null;
  end;
end $$;

-- Create bucket if it doesn't exist yet
insert into storage.buckets (id, name, public)
select 'company-logos', 'company-logos', true
where not exists (select 1 from storage.buckets where id = 'company-logos');

-- Policies for 'company-logos'
do $$ begin
  -- Public read for all objects in this bucket (used by PDFs and app UIs)
  begin
    create policy "company-logos: public read" on storage.objects for select
      using (bucket_id = 'company-logos');
  exception when duplicate_object or insufficient_privilege then null; end;

  -- Authenticated users can upload into this bucket
  begin
    create policy "company-logos: authenticated upload" on storage.objects for insert
      with check (
        bucket_id = 'company-logos'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1] -- enforce user-owned first folder segment
      );
  exception when duplicate_object or insufficient_privilege then null; end;

  -- Owners (first folder segment equals their auth.uid) can update their own files
  begin
    create policy "company-logos: owner update" on storage.objects for update
      using (bucket_id = 'company-logos' and auth.uid()::text = (storage.foldername(name))[1])
      with check (bucket_id = 'company-logos' and auth.uid()::text = (storage.foldername(name))[1]);
  exception when duplicate_object or insufficient_privilege then null; end;

  -- Owners can delete their own files
  begin
    create policy "company-logos: owner delete" on storage.objects for delete
      using (bucket_id = 'company-logos' and auth.uid()::text = (storage.foldername(name))[1]);
  exception when duplicate_object or insufficient_privilege then null; end;
end $$;

-- Restore role if it was elevated above
do $$ begin
  begin
    execute 'reset role';
  exception when others then null; end;
end $$;
