-- Set or refresh Storage RLS policies for mission-photos bucket only
-- Safe to run multiple times

-- Ensure RLS is enabled on storage.objects
alter table if exists storage.objects enable row level security;

-- READ: authenticated users can read mission-photos
drop policy if exists "mission-photos read" on storage.objects;
create policy "mission-photos read"
  on storage.objects
  for select
  to authenticated
  using ( bucket_id = 'mission-photos' );

-- INSERT: authenticated users can insert into mission-photos
drop policy if exists "mission-photos insert" on storage.objects;
create policy "mission-photos insert"
  on storage.objects
  for insert
  to authenticated
  with check ( bucket_id = 'mission-photos' );

-- UPDATE: only owner can update their own objects in mission-photos
drop policy if exists "mission-photos update" on storage.objects;
create policy "mission-photos update"
  on storage.objects
  for update
  to authenticated
  using ( bucket_id = 'mission-photos' and (owner = auth.uid()) )
  with check ( bucket_id = 'mission-photos' and (owner = auth.uid()) );

-- DELETE: only owner can delete their own objects
drop policy if exists "mission-photos delete" on storage.objects;
create policy "mission-photos delete"
  on storage.objects
  for delete
  to authenticated
  using ( bucket_id = 'mission-photos' and (owner = auth.uid()) );
