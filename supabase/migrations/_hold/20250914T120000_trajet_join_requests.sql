-- Migration: table des demandes de jointure de trajets
-- Horodatage approximatif: 2025-09-14

create table if not exists public.trajet_join_requests (
  id uuid primary key default gen_random_uuid(),
  trajet_id uuid not null references public.trajets_partages(id) on delete cascade,
  passenger_id uuid not null references auth.users(id) on delete cascade,
  convoyeur_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','accepted','refused','expired')) default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  refund_done boolean default false,
  meta jsonb,
  constraint unique_request_per_passenger unique(trajet_id, passenger_id) -- empêche doublon
);

create index if not exists idx_trajet_join_requests_trajet on public.trajet_join_requests(trajet_id);
create index if not exists idx_trajet_join_requests_convoyeur_status on public.trajet_join_requests(convoyeur_id, status);
create index if not exists idx_trajet_join_requests_passenger_status on public.trajet_join_requests(passenger_id, status);

-- Vue simple (optionnel): demandes en attente par conducteur
-- create or replace view public.v_trajet_join_pending as
-- select * from public.trajet_join_requests where status = 'pending';

-- Notes:
-- - Ajouter éventuellement une policy RLS pour restreindre lecture/écriture.
-- - Prévoir une edge function pour accept/refuse atomique + mise à jour participants.
