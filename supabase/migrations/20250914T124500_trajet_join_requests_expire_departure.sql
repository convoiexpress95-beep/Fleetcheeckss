-- Expiration automatique des demandes au moment du départ du trajet

-- Index sur date_heure des trajets pour accélérer la sélection
create index if not exists idx_trajets_partages_date_heure on public.trajets_partages(date_heure);

-- Fonction RPC: expire les demandes encore pending dont le trajet est parti (date_heure <= now())
create or replace function public.expire_requests_at_departure()
returns int language plpgsql security definer as $$
declare v_req record; v_count int := 0; begin
  for v_req in
    select r.* from trajet_join_requests r
    join trajets_partages t on t.id = r.trajet_id
    where r.status = 'pending'
      and t.date_heure <= now()
    for update skip locked
  loop
    perform public._credit_wallet(v_req.passenger_id, 2, 'refund_departure_expire', 'trajet', v_req.trajet_id);
    update trajet_join_requests set status='expired', decided_at = now(), refund_done = true where id = v_req.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end; $$;

grant execute on function public.expire_requests_at_departure() to service_role;