-- Storage RLS policies for mission-photos bucket
-- Allow authenticated users to insert into the mission-photos bucket

-- Ensure RLS is enabled on storage.objects (it is by default in Supabase projects)
alter table if exists storage.objects enable row level security;

-- READ: anyone authenticated (or even public, adjust as needed) can read mission-photos
drop policy if exists "mission-photos read" on storage.objects;
create policy "mission-photos read"
  on storage.objects
  for select
  to authenticated
  using ( bucket_id = 'mission-photos' );

-- INSERT: authenticated users can upload into mission-photos
-- (owner will be set automatically to auth.uid())
drop policy if exists "mission-photos insert" on storage.objects;
create policy "mission-photos insert"
  on storage.objects
  for insert
  to authenticated
  with check ( bucket_id = 'mission-photos' );

-- UPDATE: only owner can modify their own objects in mission-photos
-- (optional; required for upsert operations)
drop policy if exists "mission-photos update" on storage.objects;
create policy "mission-photos update"
  on storage.objects
  for update
  to authenticated
  using ( bucket_id = 'mission-photos' and (owner = auth.uid()) )
  with check ( bucket_id = 'mission-photos' and (owner = auth.uid()) );

-- DELETE: only owner can delete their own objects (optional)
drop policy if exists "mission-photos delete" on storage.objects;
create policy "mission-photos delete"
  on storage.objects
  for delete
  to authenticated
  using ( bucket_id = 'mission-photos' and (owner = auth.uid()) );
