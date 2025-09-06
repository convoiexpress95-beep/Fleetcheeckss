-- Relax insert policy on inspection_departures to allow mission creator OR driver

alter table if exists public.inspection_departures enable row level security;

drop policy if exists "insert_departures_driver_or_creator" on public.inspection_departures;
create policy "insert_departures_involved"
  on public.inspection_departures
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.missions m
      where m.id = inspection_departures.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );
