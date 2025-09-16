-- Activation RLS et policies + RPC atomicité pour les demandes de trajets

-- 1. Activer RLS
alter table public.trajet_join_requests enable row level security;

-- 2. Policies
create policy if not exists "read_own_requests"
on public.trajet_join_requests
for select using ( auth.uid() = passenger_id or auth.uid() = convoyeur_id );

create policy if not exists "insert_passenger_only"
on public.trajet_join_requests
for insert with check ( auth.uid() = passenger_id );

create policy if not exists "update_driver_only"
on public.trajet_join_requests
for update using ( auth.uid() = convoyeur_id ) with check ( auth.uid() = convoyeur_id );

-- (Optionnel) empêcher delete pour préserver historique
create policy if not exists "no_delete" on public.trajet_join_requests for delete using ( false );

-- 3. Fonctions utilitaires internes (non exposées) pour débit/crédit
-- Supposent tables: credits_wallets(user_id, balance), credits_ledger(id, user_id, amount, reason, ref_type, ref_id, created_at)

create or replace function public._debit_wallet(p_user uuid, p_amount int, p_reason text, p_ref_type text, p_ref_id uuid)
returns void language plpgsql security definer as $$
declare v_balance int; begin
  if p_amount <= 0 then raise exception 'AMOUNT_INVALID'; end if;
  select balance into v_balance from credits_wallets where user_id = p_user for update;
  if not found then
    v_balance := 0;
    insert into credits_wallets(user_id, balance) values (p_user, 0);
  end if;
  if v_balance < p_amount then raise exception 'INSUFFICIENT_FUNDS'; end if;
  update credits_wallets set balance = balance - p_amount where user_id = p_user;
  insert into credits_ledger(user_id, amount, reason, ref_type, ref_id) values (p_user, -p_amount, p_reason, p_ref_type, p_ref_id);
end; $$;

create or replace function public._credit_wallet(p_user uuid, p_amount int, p_reason text, p_ref_type text, p_ref_id uuid)
returns void language plpgsql security definer as $$
begin
  if p_amount <= 0 then raise exception 'AMOUNT_INVALID'; end if;
  insert into credits_wallets(user_id, balance) values (p_user, p_amount)
    on conflict (user_id) do update set balance = credits_wallets.balance + excluded.balance;
  insert into credits_ledger(user_id, amount, reason, ref_type, ref_id) values (p_user, p_amount, p_reason, p_ref_type, p_ref_id);
end; $$;

-- 4. RPC request_join : crée une demande et débite passager atomiquement
create or replace function public.request_join(p_trajet uuid)
returns json language plpgsql security definer as $$
declare v_trajet record; v_existing uuid; v_passenger uuid := auth.uid();
begin
  if v_passenger is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select id, convoyeur_id, nb_places, participants, statut into v_trajet from trajets_partages where id = p_trajet for update;
  if not found then raise exception 'TRAJET_NOT_FOUND'; end if;
  if v_trajet.statut in ('complet','termine','annule') then raise exception 'TRAJET_CLOSED'; end if;
  if coalesce(jsonb_array_length(to_jsonb(v_trajet.participants)), array_length(v_trajet.participants,1)) >= v_trajet.nb_places then raise exception 'TRAJET_FULL'; end if;
  select id into v_existing from trajet_join_requests where trajet_id = p_trajet and passenger_id = v_passenger;
  if found then raise exception 'ALREADY_REQUESTED'; end if;
  perform public._debit_wallet(v_passenger, 2, 'reservation_trajet', 'trajet', p_trajet);
  insert into trajet_join_requests(trajet_id, passenger_id, convoyeur_id, status) values (p_trajet, v_trajet.convoyeur_id, v_trajet.convoyeur_id, 'pending');
  return json_build_object('status','pending');
end; $$;

-- 5. RPC accept_join : conducteur accepte et est débité, passager ajouté
create or replace function public.accept_join(p_request uuid)
returns json language plpgsql security definer as $$
declare v_req record; v_trajet record; v_driver uuid := auth.uid(); v_participants text[]; v_new_count int; v_statut text; begin
  select * into v_req from trajet_join_requests where id = p_request for update;
  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  if v_req.status <> 'pending' then raise exception 'INVALID_STATUS'; end if;
  if v_driver is null or v_driver <> v_req.convoyeur_id then raise exception 'NOT_OWNER'; end if;
  select * into v_trajet from trajets_partages where id = v_req.trajet_id for update;
  if not found then raise exception 'TRAJET_NOT_FOUND'; end if;
  v_participants := coalesce(v_trajet.participants, '{}');
  if v_req.passenger_id = any(v_participants) then raise exception 'ALREADY_PARTICIPANT'; end if;
  perform public._debit_wallet(v_driver, 2, 'passager_trajet', 'trajet', v_trajet.id);
  v_participants := array_append(v_participants, v_req.passenger_id);
  v_new_count := array_length(v_participants,1);
  v_statut := case when v_new_count >= v_trajet.nb_places then 'complet' else coalesce(v_trajet.statut,'ouvert') end;
  update trajets_partages set participants = v_participants, statut = v_statut where id = v_trajet.id;
  update trajet_join_requests set status='accepted', decided_at = now() where id = v_req.id;
  return json_build_object('status','accepted','participants',v_participants,'statut',v_statut);
end; $$;

-- 6. RPC refuse_join : remboursement passager si pending
create or replace function public.refuse_join(p_request uuid)
returns json language plpgsql security definer as $$
declare v_req record; v_driver uuid := auth.uid(); begin
  select * into v_req from trajet_join_requests where id = p_request for update;
  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  if v_req.status <> 'pending' then raise exception 'INVALID_STATUS'; end if;
  if v_driver is null or v_driver <> v_req.convoyeur_id then raise exception 'NOT_OWNER'; end if;
  perform public._credit_wallet(v_req.passenger_id, 2, 'refund_reservation', 'trajet', v_req.trajet_id);
  update trajet_join_requests set status='refused', decided_at = now(), refund_done = true where id = v_req.id;
  return json_build_object('status','refused');
end; $$;

-- 7. RPC expire_requests : pour cron
create or replace function public.expire_requests(p_max_minutes int default 60)
returns int language plpgsql security definer as $$
declare v_cutoff timestamptz := now() - make_interval(mins => p_max_minutes); v_req record; v_count int := 0; begin
  for v_req in select * from trajet_join_requests where status='pending' and created_at < v_cutoff for update skip locked loop
    perform public._credit_wallet(v_req.passenger_id, 2, 'refund_expire', 'trajet', v_req.trajet_id);
    update trajet_join_requests set status='expired', decided_at = now(), refund_done = true where id = v_req.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end; $$;

-- GRANT: S'assurer que role authenticated peut exécuter les RPC
grant execute on function public.request_join(uuid) to authenticated;
grant execute on function public.accept_join(uuid) to authenticated;
grant execute on function public.refuse_join(uuid) to authenticated;
grant execute on function public.expire_requests(int) to service_role; -- potentiellement cron côté serveur
