-- Add assigned convoyeur to fleetmarket_missions
alter table public.fleetmarket_missions add column if not exists convoyeur_id uuid references auth.users(id);
create index if not exists fleetmarket_missions_convoyeur_id_idx on public.fleetmarket_missions(convoyeur_id);

-- RLS: allow assigned convoyeur to read its missions even if not ouverte
drop policy if exists "fleetmarket: convoyeur read assigned" on public.fleetmarket_missions;
create policy "fleetmarket: convoyeur read assigned" on public.fleetmarket_missions
for select using (convoyeur_id = auth.uid());

-- RLS: allow creator to still read after status change (already covered by owner full select, but ensure select separate)
drop policy if exists "fleetmarket: owner read" on public.fleetmarket_missions;
create policy "fleetmarket: owner read" on public.fleetmarket_missions
for select using (created_by = auth.uid());
