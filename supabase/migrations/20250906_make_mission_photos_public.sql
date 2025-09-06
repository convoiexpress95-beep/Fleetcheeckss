-- Rendre le bucket mission-photos public et permettre la lecture anonyme
update storage.buckets set public = true where id = 'mission-photos';

-- Policy: lecture publique (ANON)
create policy if not exists "public read mission photos"
  on storage.objects for select
  to anon
  using (bucket_id = 'mission-photos');
