-- Migration complémentaire: RLS & policies pour trajet_join_requests
-- Horodatage: 2025-09-14 16:05:00
-- Objectifs:
-- 1. Activer RLS sur la table
-- 2. Policies lecture: passager ou convoyeur impliqué
-- 3. Policies insertion: le passager peut créer une demande ciblant un trajet (vérif basic)
-- 4. Policies update:
--    - Le convoyeur peut accepter/refuser (changement status + decided_at)
--    - Le système (future RPC / service role) pourra marquer expired + refund_done
-- 5. Index partiel pour accélérer expiration sur les pending
-- 6. Trigger pour timestamp decided_at quand status passe de pending -> (accepted|refused|expired)

begin;

-- Activer RLS si pas déjà
alter table public.trajet_join_requests enable row level security;

-- Supprimer policies précédentes si re-exécution
drop policy if exists "trajet_join_requests_select" on public.trajet_join_requests;
drop policy if exists "trajet_join_requests_insert" on public.trajet_join_requests;
drop policy if exists "trajet_join_requests_update_convoyeur" on public.trajet_join_requests;
drop policy if exists "trajet_join_requests_update_system" on public.trajet_join_requests;

-- Lecture: passager ou convoyeur
create policy "trajet_join_requests_select" on public.trajet_join_requests
  for select
  using (auth.uid() = passenger_id or auth.uid() = convoyeur_id);

-- Insertion: l'utilisateur ne peut insérer qu'en tant que passenger_id = auth.uid()
create policy "trajet_join_requests_insert" on public.trajet_join_requests
  for insert
  with check (auth.uid() = passenger_id);

-- Update par le convoyeur: seulement status et refund_done false->true bloqué ici (refund_done non modifiable par convoyeur)
create policy "trajet_join_requests_update_convoyeur" on public.trajet_join_requests
  for update
  using (auth.uid() = convoyeur_id)
  with check (
    auth.uid() = convoyeur_id
    and (status in ('pending','accepted','refused','expired'))
  );

-- Update "système" (edge function ou service role) : on autorise tout via service role bypass RLS.
-- (Pas de policy nécessaire pour service role; sinon prévoir une policy spécifique sur role claim.)

-- Index partiel pour pending (si pas déjà existant)
create index if not exists idx_trajet_join_requests_pending on public.trajet_join_requests(trajet_id)
  where status = 'pending';

-- Trigger pour decided_at automatique
create or replace function public.trajet_join_requests_set_decided_at() returns trigger as $$
begin
  if TG_OP = 'UPDATE' then
    if (OLD.status = 'pending' and NEW.status in ('accepted','refused','expired') and NEW.decided_at is null) then
      NEW.decided_at = now();
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_trajet_join_requests_decided_at on public.trajet_join_requests;
create trigger trg_trajet_join_requests_decided_at
  before update on public.trajet_join_requests
  for each row execute function public.trajet_join_requests_set_decided_at();

commit;
