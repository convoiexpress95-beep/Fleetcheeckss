-- Migration: RLS + policies + cron job (si disponible) pour trajet_join_requests
-- Horodatage: 2025-09-14 15:05:00

-- Activer RLS
alter table public.trajet_join_requests enable row level security;

-- Supprimer policies existantes si ré-exécution (idempotent)
DO $$ BEGIN
  DROP POLICY IF EXISTS select_trajet_join_requests ON public.trajet_join_requests;
  DROP POLICY IF EXISTS insert_trajet_join_requests ON public.trajet_join_requests;
  DROP POLICY IF EXISTS update_trajet_join_requests ON public.trajet_join_requests;
  DROP POLICY IF EXISTS delete_trajet_join_requests ON public.trajet_join_requests;
END $$;

-- Lecture: passager ou convoyeur de la demande
create policy select_trajet_join_requests on public.trajet_join_requests
  for select using (
    auth.uid() = passenger_id OR auth.uid() = convoyeur_id
  );

-- Insertion: seul le passager peut créer sa propre demande (avec cohérence trajet)
create policy insert_trajet_join_requests on public.trajet_join_requests
  for insert with check (
    auth.uid() = passenger_id
  );

-- Update/Delete direct bloqués (on force passage par RPC) sauf marquage refund_done par fonctions securisées
create policy update_trajet_join_requests on public.trajet_join_requests
  for update using (false) with check (false);
create policy delete_trajet_join_requests on public.trajet_join_requests
  for delete using (false);

-- Optionnel: si vous souhaitez permettre au passager d'annuler tant que pending, décommenter ci-dessous
-- create policy cancel_pending_by_passenger on public.trajet_join_requests
--   for update using (
--     auth.uid() = passenger_id AND status = 'pending'
--   ) with check (
--     auth.uid() = passenger_id AND status = 'pending'
--   );

-- Tâche planifiée pg_cron (si extension disponible) pour expirer périodiquement
-- Vérifie présence de l'extension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Crée ou remplace le job (cron.schedule replace pas natif, donc on supprime si existe)
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire_trajet_join_requests_every_minute';
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire_trajet_join_requests_at_departure_every_minute';

    -- Expires génériques (pending timeout internal logic inside function if any)
    PERFORM cron.schedule('expire_trajet_join_requests_every_minute', '* * * * *', $$select public.expire_requests()$$);
    -- Expires à l'heure de départ
    PERFORM cron.schedule('expire_trajet_join_requests_at_departure_every_minute', '* * * * *', $$select public.expire_requests_at_departure()$$);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Environnements sans pg_cron -> ignorer silencieusement
  NULL;
END $$;
