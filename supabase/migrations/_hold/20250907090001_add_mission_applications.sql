-- Mission applications (candidatures convoyeur)
create table if not exists public.mission_applications (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  applicant_user_id uuid not null,
  message text,
  price_offer numeric,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamp with time zone not null default now()
);

-- Empêcher doublons: un utilisateur ne peut candidater qu'une fois par mission
create unique index if not exists mission_applications_unique_applicant on public.mission_applications (mission_id, applicant_user_id);

alter table public.mission_applications enable row level security;

-- Politique: l'utilisateur peut voir ses propres candidatures
drop policy if exists "mission-apps applicant can read own" on public.mission_applications;
create policy "mission-apps applicant can read own" on public.mission_applications
for select
using (applicant_user_id = auth.uid());

-- Politique: le donneur (créateur) de la mission voit toutes les candidatures de sa mission
drop policy if exists "mission-apps donor can read" on public.mission_applications;
create policy "mission-apps donor can read" on public.mission_applications
for select
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid())
  )
);

-- Politique: un utilisateur authentifié peut créer une candidature pour une mission
drop policy if exists "mission-apps applicant can insert" on public.mission_applications;
create policy "mission-apps applicant can insert" on public.mission_applications
for insert
with check (applicant_user_id = auth.uid());

-- Politique: le donneur peut mettre à jour le statut des candidatures de sa mission
drop policy if exists "mission-apps donor can update status" on public.mission_applications;
create policy "mission-apps donor can update status" on public.mission_applications
for update
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid())
  )
) with check (true);

-- Politique: l'auteur peut supprimer sa candidature tant qu'elle est en attente (optionnel)
drop policy if exists "mission-apps applicant can delete pending" on public.mission_applications;
create policy "mission-apps applicant can delete pending" on public.mission_applications
for delete
using (applicant_user_id = auth.uid() and status = 'pending');

-- Index pour filtrage par mission
create index if not exists mission_applications_mission_id_idx on public.mission_applications (mission_id);
