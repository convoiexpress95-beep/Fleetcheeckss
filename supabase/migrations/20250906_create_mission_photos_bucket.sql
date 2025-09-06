-- Create storage bucket mission-photos if it doesn't exist
insert into storage.buckets (id, name, public)
select 'mission-photos', 'mission-photos', false
where not exists (select 1 from storage.buckets where id = 'mission-photos');

-- Policies: allow authenticated users to upload/read their content; read by signed URL otherwise
-- Upload (authenticated)
create policy if not exists "upload mission photos (auth)"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'mission-photos');

-- Read (authenticated)
create policy if not exists "read mission photos (auth)"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'mission-photos');

-- Update/Delete only by owner (optional; adapt if you track owner via metadata)
-- Here we restrict updates/deletes to service role typically; skip end-user ops for safety.
