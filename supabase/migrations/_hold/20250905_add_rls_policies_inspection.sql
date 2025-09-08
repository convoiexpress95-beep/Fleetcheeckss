-- archived placeholder-- RLS policies for inspection-related tables and missions updates
-- Allows users who are involved in a mission (creator or driver) to read/insert/update related rows

-- Missions
alter table if exists public.missions enable row level security;

drop policy if exists "select_missions_involved" on public.missions;
create policy "select_missions_involved"
  on public.missions
  for select
  to authenticated
  using ( created_by = auth.uid() or driver_id = auth.uid() );

-- Allow involved users to update missions (e.g., status changes from mobile)
drop policy if exists "update_missions_status_involved" on public.missions;
create policy "update_missions_status_involved"
  on public.missions
  for update
  to authenticated
  using ( created_by = auth.uid() or driver_id = auth.uid() )
  with check ( created_by = auth.uid() or driver_id = auth.uid() );

-- inspection_departures
alter table if exists public.inspection_departures enable row level security;

drop policy if exists "select_departures_involved" on public.inspection_departures;
create policy "select_departures_involved"
  on public.inspection_departures
  for select
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = inspection_departures.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

drop policy if exists "insert_departures_driver_or_creator" on public.inspection_departures;
create policy "insert_departures_driver_or_creator"
  on public.inspection_departures
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = inspection_departures.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

-- inspection_arrivals
alter table if exists public.inspection_arrivals enable row level security;

drop policy if exists "select_arrivals_involved" on public.inspection_arrivals;
create policy "select_arrivals_involved"
  on public.inspection_arrivals
  for select
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = inspection_arrivals.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

drop policy if exists "insert_arrivals_driver_or_creator" on public.inspection_arrivals;
create policy "insert_arrivals_driver_or_creator"
  on public.inspection_arrivals
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = inspection_arrivals.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

-- mission_tracking
alter table if exists public.mission_tracking enable row level security;

drop policy if exists "select_tracking_involved" on public.mission_tracking;
create policy "select_tracking_involved"
  on public.mission_tracking
  for select
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_tracking.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

drop policy if exists "insert_tracking_driver" on public.mission_tracking;
create policy "insert_tracking_driver"
  on public.mission_tracking
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = mission_tracking.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

-- mission_costs
alter table if exists public.mission_costs enable row level security;

drop policy if exists "select_costs_involved" on public.mission_costs;
create policy "select_costs_involved"
  on public.mission_costs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_costs.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

drop policy if exists "insert_costs_driver" on public.mission_costs;
create policy "insert_costs_driver"
  on public.mission_costs
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = mission_costs.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

drop policy if exists "update_costs_driver" on public.mission_costs;
create policy "update_costs_driver"
  on public.mission_costs
  for update
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_costs.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  )
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = mission_costs.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

-- mission_documents
alter table if exists public.mission_documents enable row level security;

drop policy if exists "select_documents_involved" on public.mission_documents;
create policy "select_documents_involved"
  on public.mission_documents
  for select
  to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_documents.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );

drop policy if exists "insert_documents_driver" on public.mission_documents;
create policy "insert_documents_driver"
  on public.mission_documents
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = mission_documents.mission_id
        and (m.created_by = auth.uid() or m.driver_id = auth.uid())
    )
  );
