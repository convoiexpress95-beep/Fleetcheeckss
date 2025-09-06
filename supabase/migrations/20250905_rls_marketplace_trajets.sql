-- RLS policies for marketplace and shared trips tables
-- This migration enables RLS and defines policies for:
-- - marketplace_missions: public read, authenticated insert, owner update/delete
-- - marketplace_devis: visible to convoyeur and mission owner; insert by convoyeur; updates by convoyeur or mission owner
-- - trajets_partages: public read, insert/update/delete by owner, and join/leave by any authenticated user (with check)

-- Enable RLS on target tables
alter table if exists public.marketplace_missions enable row level security;
alter table if exists public.marketplace_devis enable row level security;
alter table if exists public.trajets_partages enable row level security;

-- Clean up any existing policies to avoid conflicts
drop policy if exists "marketplace_missions select public" on public.marketplace_missions;
drop policy if exists "marketplace_missions insert by owner" on public.marketplace_missions;
drop policy if exists "marketplace_missions update by owner" on public.marketplace_missions;
drop policy if exists "marketplace_missions delete by owner" on public.marketplace_missions;

drop policy if exists "marketplace_devis select visible" on public.marketplace_devis;
drop policy if exists "marketplace_devis insert by convoyeur" on public.marketplace_devis;
drop policy if exists "marketplace_devis update by owner or convoyeur" on public.marketplace_devis;
drop policy if exists "marketplace_devis delete by owner or convoyeur" on public.marketplace_devis;

drop policy if exists "trajets_partages select public" on public.trajets_partages;
drop policy if exists "trajets_partages insert by owner" on public.trajets_partages;
drop policy if exists "trajets_partages update by owner" on public.trajets_partages;
drop policy if exists "trajets_partages update join/leave" on public.trajets_partages;
drop policy if exists "trajets_partages delete by owner" on public.trajets_partages;

-- marketplace_missions
create policy "marketplace_missions select public"
  on public.marketplace_missions
  for select
  to public
  using (true);

create policy "marketplace_missions insert by owner"
  on public.marketplace_missions
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "marketplace_missions update by owner"
  on public.marketplace_missions
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "marketplace_missions delete by owner"
  on public.marketplace_missions
  for delete
  to authenticated
  using (created_by = auth.uid());

-- marketplace_devis
create policy "marketplace_devis select visible"
  on public.marketplace_devis
  for select
  to authenticated
  using (
    convoyeur_id = auth.uid()
    or exists (
      select 1
      from public.marketplace_missions mm
      where mm.id = marketplace_devis.mission_id
        and mm.created_by = auth.uid()
    )
  );

create policy "marketplace_devis insert by convoyeur"
  on public.marketplace_devis
  for insert
  to authenticated
  with check (convoyeur_id = auth.uid());

create policy "marketplace_devis update by owner or convoyeur"
  on public.marketplace_devis
  for update
  to authenticated
  using (
    convoyeur_id = auth.uid()
    or exists (
      select 1 from public.marketplace_missions mm
      where mm.id = marketplace_devis.mission_id
        and mm.created_by = auth.uid()
    )
  )
  with check (
    convoyeur_id = auth.uid()
    or exists (
      select 1 from public.marketplace_missions mm
      where mm.id = marketplace_devis.mission_id
        and mm.created_by = auth.uid()
    )
  );

create policy "marketplace_devis delete by owner or convoyeur"
  on public.marketplace_devis
  for delete
  to authenticated
  using (
    convoyeur_id = auth.uid()
    or exists (
      select 1 from public.marketplace_missions mm
      where mm.id = marketplace_devis.mission_id
        and mm.created_by = auth.uid()
    )
  );

-- trajets_partages
create policy "trajets_partages select public"
  on public.trajets_partages
  for select
  to public
  using (true);

create policy "trajets_partages insert by owner"
  on public.trajets_partages
  for insert
  to authenticated
  with check (convoyeur_id = auth.uid());

create policy "trajets_partages update by owner"
  on public.trajets_partages
  for update
  to authenticated
  using (convoyeur_id = auth.uid())
  with check (convoyeur_id = auth.uid());

-- Allow any authenticated user to join/leave by ensuring their uid is present in the new row's participants
create policy "trajets_partages update join/leave"
  on public.trajets_partages
  for update
  to authenticated
  using (true)
  with check (
    (
      -- join: new row includes the user
      participants @> ARRAY[auth.uid()]::uuid[]
      -- leave: old row included user and new one does not
      or exists (
        select 1 from public.trajets_partages t_old
        where t_old.id = trajets_partages.id
          and t_old.participants @> ARRAY[auth.uid()]::uuid[]
          and not (trajets_partages.participants @> ARRAY[auth.uid()]::uuid[])
      )
    )
    and exists (
      select 1 from public.trajets_partages t
      where t.id = trajets_partages.id
        and t.ville_depart = trajets_partages.ville_depart
        and t.ville_arrivee = trajets_partages.ville_arrivee
        and t.date_heure = trajets_partages.date_heure
        and t.nb_places = trajets_partages.nb_places
        and t.prix_par_place = trajets_partages.prix_par_place
        and t.convoyeur_id = trajets_partages.convoyeur_id
        and t.statut = trajets_partages.statut
        and t.description is not distinct from trajets_partages.description
    )
  );

create policy "trajets_partages delete by owner"
  on public.trajets_partages
  for delete
  to authenticated
  using (convoyeur_id = auth.uid());
