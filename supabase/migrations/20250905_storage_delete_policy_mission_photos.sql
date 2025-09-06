-- Allow mission participants to DELETE objects under missions/<mission_id>/... in mission-photos
alter table if exists storage.objects enable row level security;

drop policy if exists "mission-photos delete participants" on storage.objects;

create policy "mission-photos delete participants"
  on storage.objects
  for delete
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
