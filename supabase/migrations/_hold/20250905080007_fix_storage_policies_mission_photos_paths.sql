-- Fix storage policies for mission-photos to match paths like
-- missions/<mission_id>/... and allow mission participants (creator, donor, driver)
-- to read and insert. This supersedes earlier broad or mismatched policies.

-- Note: We do not ALTER TABLE storage.objects here to avoid ownership issues.

-- Drop any previous policies that may conflict
drop policy if exists "mission-photos read" on storage.objects;
drop policy if exists "mission-photos insert" on storage.objects;
drop policy if exists "mission-photos update" on storage.objects;
drop policy if exists "mission-photos delete" on storage.objects;

drop policy if exists "Mission participants can view photos" on storage.objects;
drop policy if exists "Drivers can upload mission photos" on storage.objects;

-- SELECT for participants on paths missions/<mission_id>/...
create policy "mission-photos select participants"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'mission-photos'
    and split_part(name, '/', 1) = 'missions'
    and exists (
      select 1 from public.missions m
      where m.id::text = split_part(name, '/', 2)
        and (
          m.created_by = auth.uid()
          or m.driver_id = auth.uid()
          or m.donor_id = auth.uid()
        )
    )
  );

-- INSERT for participants on paths missions/<mission_id>/...
create policy "mission-photos insert participants"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'mission-photos'
    and split_part(name, '/', 1) = 'missions'
    and exists (
      select 1 from public.missions m
      where m.id::text = split_part(name, '/', 2)
        and (
          m.created_by = auth.uid()
          or m.driver_id = auth.uid()
          or m.donor_id = auth.uid()
        )
    )
  );

-- Note: UPDATE policy is intentionally omitted; client uses upsert: false.
--       DELETE can be added later if needed.
