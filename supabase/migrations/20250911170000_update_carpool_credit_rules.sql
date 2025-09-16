-- Update carpool credit rules: passenger pays 1 credit per reservation (once per ride),
-- driver pays 2 credits per seat reserved. Also align contact reveal fallback charge to 1.
set search_path = public;

create or replace function public.reserve_ride_with_credits(
  p_ride_id uuid,
  p_seats int,
  p_price numeric,
  p_message text
) returns public.ride_reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_passenger uuid := auth.uid();
  v_driver uuid;
  v_res public.ride_reservations;
  v_already_paid boolean;
begin
  if v_passenger is null then
    raise exception 'not_authenticated';
  end if;
  if p_seats is null or p_seats <= 0 then
    raise exception 'invalid_seats';
  end if;

  select r.driver_id into v_driver from public.rides r where r.id = p_ride_id;
  if v_driver is null then
    raise exception 'ride_not_found';
  end if;

  -- Charge passenger 1 credit only once per (ride, passenger)
  select exists(
    select 1 from public.credits_ledger l
    where l.user_id = v_passenger and l.reason = 'reservation_fee' and l.ref_type = 'ride' and l.ref_id = p_ride_id
  ) into v_already_paid;
  if not v_already_paid then
    perform public.adjust_credits(v_passenger, -1, 'reservation_fee', 'ride', p_ride_id);
  end if;

  -- Charge driver 2 credits per seat reserved
  perform public.adjust_credits(v_driver, -(2 * p_seats), 'driver_fee', 'ride', p_ride_id);

  insert into public.ride_reservations(ride_id, passenger_id, seats, price_at_booking, message)
  values (p_ride_id, v_passenger, p_seats, p_price, p_message)
  returning * into v_res;

  return v_res;
exception when unique_violation then
  -- Already reserved: return existing row
  select * into v_res from public.ride_reservations
   where ride_id = p_ride_id and passenger_id = v_passenger;
  return v_res;
end;
$$;

-- Align contact reveal fallback to 1 credit (if not already paid by reservation)
create or replace function public.reveal_driver_contact(p_ride_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_driver uuid;
  v_phone text;
  v_already_paid boolean;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select r.driver_id into v_driver from public.rides r where r.id = p_ride_id;
  if v_driver is null then
    raise exception 'ride_not_found';
  end if;

  if not exists (
    select 1 from public.ride_reservations rr where rr.ride_id = p_ride_id and (rr.passenger_id = v_user)
  ) and v_user <> v_driver then
    raise exception 'not_allowed';
  end if;

  -- Charge 1 credit only once per ride if not already paid via reservation_fee
  select exists(
    select 1 from public.credits_ledger l
    where l.user_id = v_user and l.reason = 'reservation_fee' and l.ref_type = 'ride' and l.ref_id = p_ride_id
  ) into v_already_paid;
  if not v_already_paid then
    perform public.adjust_credits(v_user, -1, 'reservation_fee', 'ride', p_ride_id);
  end if;

  select phone into v_phone from public.profiles p where p.id = v_driver;
  return coalesce(v_phone, '');
end;
$$;
