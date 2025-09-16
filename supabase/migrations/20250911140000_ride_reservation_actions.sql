-- Actions sur les réservations de covoiturage (accept / reject / cancel)
-- Généré automatiquement pour aligner la logique front avec le schéma existant

-- NOTE: Les règles métier appliquées ici suivent les principes:
--  * Le passager est débité de 1 crédit par réservation (déjà via reserve_ride_with_credits)
--  * Le conducteur est débité de 2 crédits par voyageur uniquement lors de l'acceptation
--  * Rejet par le conducteur: remboursement passager
--  * Annulation par le passager avant acceptation: remboursement passager
--  * Annulation après acceptation: remboursement passager + remboursement conducteur (crédits débités)
--  * Annulation par le conducteur après acceptation: remboursement passager + remboursement conducteur
--  * Les écritures passent par credits_wallets + credits_ledger

-- Helper: ajuste le wallet et écrit dans le ledger
create or replace function public._adjust_credits(p_user uuid, p_amount int, p_reason text, p_ref_type text default 'ride_reservation', p_ref_id uuid default null)
returns void as $$
begin
  update credits_wallets set balance = balance + p_amount, updated_at = now() where user_id = p_user;
  if not found then
    insert into credits_wallets(user_id, balance) values (p_user, p_amount);
  end if;
  insert into credits_ledger(user_id, amount, reason, ref_type, ref_id) values (p_user, p_amount, p_reason, p_ref_type, p_ref_id);
end; $$ language plpgsql security definer set search_path = public;

-- Acceptation d'une réservation par le conducteur
create or replace function public.accept_ride_reservation(p_reservation_id uuid, p_driver uuid)
returns json as $$
declare
  r record;
  seats_used int;
  driver_debit int;
begin
  select rr.*, ri.driver_id as ride_driver, ri.seats_available, ri.seats, ri.id as ride_pk
    into r
    from ride_reservations rr
    join rides ri on ri.id = rr.ride_id
   where rr.id = p_reservation_id;

  if not found then
    raise exception 'Reservation introuvable';
  end if;
  if r.ride_driver is null then
    raise exception 'Trajet sans conducteur défini';
  end if;
  if r.ride_driver <> p_driver then
    raise exception 'Accès refusé: pas le conducteur';
  end if;
  if r.status <> 'pending' then
    raise exception 'Statut invalide (doit être pending)';
  end if;
  seats_used := r.seats;
  if r.seats_available < seats_used then
    raise exception 'Places insuffisantes';
  end if;
  -- Débit conducteur: 2 crédits * places
  driver_debit := seats_used * 2;
  perform 1 from credits_wallets where user_id = p_driver and balance >= driver_debit;
  if not found then
    raise exception 'Crédits insuffisants conducteur';
  end if;
  update ride_reservations set status = 'accepted', updated_at = now() where id = r.id;
  update rides set seats_available = seats_available - seats_used, updated_at = now() where id = r.ride_pk;
  perform _adjust_credits(p_driver, -driver_debit, 'ride_driver_accept', 'ride_reservation', r.id);
  return json_build_object('status','accepted','reservation_id', r.id);
end; $$ language plpgsql security definer set search_path = public;

-- Rejet par le conducteur
create or replace function public.reject_ride_reservation(p_reservation_id uuid, p_driver uuid)
returns json as $$
declare r record; begin
  select rr.*, ri.driver_id as ride_driver
    into r from ride_reservations rr join rides ri on ri.id = rr.ride_id
   where rr.id = p_reservation_id;
  if not found then raise exception 'Reservation introuvable'; end if;
  if r.ride_driver <> p_driver then raise exception 'Accès refusé'; end if;
  if r.status <> 'pending' then raise exception 'Statut invalide'; end if;
  update ride_reservations set status = 'rejected', updated_at = now() where id = r.id;
  -- Rembourse passager (1 crédit * seats) si déjà prélevé (assume reserve_ride_with_credits l'a fait)
  perform _adjust_credits(r.passenger_id, r.seats * 1, 'ride_reject_refund', 'ride_reservation', r.id);
  return json_build_object('status','rejected','reservation_id', r.id);
end; $$ language plpgsql security definer set search_path = public;

-- Annulation (passager ou conducteur)
create or replace function public.cancel_ride_reservation(p_reservation_id uuid, p_actor uuid)
returns json as $$
declare r record; driver_debit int; begin
  select rr.*, ri.driver_id as ride_driver, ri.id as ride_pk
    into r from ride_reservations rr join rides ri on ri.id = rr.ride_id
   where rr.id = p_reservation_id;
  if not found then raise exception 'Reservation introuvable'; end if;
  if r.passenger_id <> p_actor and r.ride_driver <> p_actor then
    raise exception 'Accès refusé';
  end if;
  if r.status in ('rejected','cancelled') then
    return json_build_object('status', r.status, 'reservation_id', r.id);
  end if;
  -- Si acceptée, restituer sièges
  if r.status = 'accepted' then
    update rides set seats_available = seats_available + r.seats, updated_at = now() where id = r.ride_pk;
  end if;
  update ride_reservations set status = 'cancelled', updated_at = now() where id = r.id;
  -- Remboursement passager toujours (crédit consommé à la réservation)
  perform _adjust_credits(r.passenger_id, r.seats * 1, 'ride_cancel_refund', 'ride_reservation', r.id);
  -- Si déjà accepte => rembourser conducteur (2 crédits * seats)
  if r.status = 'accepted' then
    driver_debit := r.seats * 2;
    perform _adjust_credits(r.ride_driver, driver_debit, 'ride_cancel_driver_refund', 'ride_reservation', r.id);
  end if;
  return json_build_object('status','cancelled','reservation_id', r.id);
end; $$ language plpgsql security definer set search_path = public;

-- Permissions simples (RLS suppose exécution via SECURITY DEFINER)
comment on function public.accept_ride_reservation is 'Accepte une réservation (driver débité)';
comment on function public.reject_ride_reservation is 'Rejette une réservation (rembourse passager)';
comment on function public.cancel_ride_reservation is 'Annule une réservation (rembourse passager et éventuellement conducteur)';

