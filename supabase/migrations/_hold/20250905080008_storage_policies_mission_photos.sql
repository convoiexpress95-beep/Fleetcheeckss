-- Storage RLS policies for mission-photos bucket
-- Note: We do not ALTER TABLE storage.objects here to avoid ownership issues.

-- READ: choose your audience (public or authenticated)
-- Public read (uncomment to allow anonymous reads)
-- drop policy if exists "mission-photos read" on storage.objects;
-- create policy "mission-photos read"
--   on storage.objects for select to public
--   using (bucket_id = 'mission-photos');

-- Authenticated read (default safer)
drop policy if exists "mission-photos read" on storage.objects;
create policy "mission-photos read"
	on storage.objects for select to authenticated
	using (bucket_id = 'mission-photos');

-- INSERT: authenticated users can upload
drop policy if exists "mission-photos insert" on storage.objects;
create policy "mission-photos insert"
	on storage.objects for insert to authenticated
	with check (bucket_id = 'mission-photos');

-- UPDATE: only owner can modify their own objects
drop policy if exists "mission-photos update" on storage.objects;
create policy "mission-photos update"
	on storage.objects for update to authenticated
	using (bucket_id = 'mission-photos' and owner = auth.uid())
	with check (bucket_id = 'mission-photos' and owner = auth.uid());

-- DELETE: only owner can delete their own objects
drop policy if exists "mission-photos delete" on storage.objects;
create policy "mission-photos delete"
	on storage.objects for delete to authenticated
	using (bucket_id = 'mission-photos' and owner = auth.uid());
