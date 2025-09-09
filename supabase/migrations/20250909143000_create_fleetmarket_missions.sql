-- FleetMarket missions dedicated table
-- Creates isolated table instead of reusing legacy marketplace_missions (which is absent)
-- Safe to apply: no name collision detected.

create table if not exists public.fleetmarket_missions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  titre text not null,
  description text,
  ville_depart text not null,
  ville_arrivee text not null,
  date_depart timestamptz not null,
  prix_propose numeric,
  statut text not null default 'ouverte' check (statut in ('ouverte','en_negociation','attribuee','terminee','annulee')),
  vehicule_requis text,
  contact_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger (idempotent)
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- Attach trigger if missing
create trigger fleetmarket_missions_set_updated_at
  before update on public.fleetmarket_missions
  for each row execute function public.set_updated_at();

alter table public.fleetmarket_missions enable row level security;

-- Policies
-- Public (authenticated) can read open missions
drop policy if exists "fleetmarket: public read open" on public.fleetmarket_missions;
create policy "fleetmarket: public read open" on public.fleetmarket_missions
for select using (statut = 'ouverte');

-- Owner full access (select/update/delete)
drop policy if exists "fleetmarket: owner full" on public.fleetmarket_missions;
create policy "fleetmarket: owner full" on public.fleetmarket_missions
for all using (created_by = auth.uid()) with check (created_by = auth.uid());

-- Authenticated insert (must set created_by = auth.uid())
drop policy if exists "fleetmarket: auth insert" on public.fleetmarket_missions;
create policy "fleetmarket: auth insert" on public.fleetmarket_missions
for insert with check (created_by = auth.uid());

-- Helpful indexes
create index if not exists fleetmarket_missions_status_date_idx on public.fleetmarket_missions (statut, date_depart);
create index if not exists fleetmarket_missions_created_by_idx on public.fleetmarket_missions (created_by);
