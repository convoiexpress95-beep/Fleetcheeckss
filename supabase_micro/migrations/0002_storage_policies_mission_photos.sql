alter table if exists storage.objects enable row level security;

drop policy if exists "mission-photos read" on storage.objects;
create policy "mission-photos read"
  on storage.objects
  for select
  to authenticated
  using ( bucket_id = 'mission-photos' );

drop policy if exists "mission-photos insert" on storage.objects;
create policy "mission-photos insert"
  on storage.objects
  for insert
  to authenticated
  with check ( bucket_id = 'mission-photos' );

drop policy if exists "mission-photos update" on storage.objects;
create policy "mission-photos update"
  on storage.objects
  for update
  to authenticated
  using ( bucket_id = 'mission-photos' and (owner = auth.uid()) )
  with check ( bucket_id = 'mission-photos' and (owner = auth.uid()) );

drop policy if exists "mission-photos delete" on storage.objects;
create policy "mission-photos delete"
  on storage.objects
  for delete
  to authenticated
  using ( bucket_id = 'mission-photos' and (owner = auth.uid()) );
