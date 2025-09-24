-- Crée le bucket de stockage pour les documents de vérification utilisés par /verification
insert into storage.buckets (id, name, public)
values ('verification', 'verification', false)
on conflict (id) do nothing;

-- Politiques RLS pour autoriser les utilisateurs à gérer leurs propres fichiers dans le bucket
-- Lecture/écriture uniquement par le propriétaire (dossier prefixé par son user id)
create policy if not exists "verification: user insert own" on storage.objects
  for insert with check (
    bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "verification: user update own" on storage.objects
  for update using (
    bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "verification: user delete own" on storage.objects
  for delete using (
    bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "verification: user select own" on storage.objects
  for select using (
    bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Optionnel: permettre aux admins de lire tout le bucket
create policy if not exists "verification: admin select all" on storage.objects
  for select using (bucket_id = 'verification' and is_admin());
