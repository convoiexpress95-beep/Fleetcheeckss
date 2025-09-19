-- Fix Function Search Path Mutable security warnings by setting search_path on functions

-- Update functions that are missing SET search_path parameter
-- Note: Only updating the ones that don't already have it properly set

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  NEW.updated_at = now();
  return NEW;
end; 
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
begin
  new.updated_at = now();
  return new;
end; 
$$;

CREATE OR REPLACE FUNCTION public.validate_mission_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if (tg_op = 'INSERT') then
    if (new.price_offer is null or new.price_offer < 50) then
      raise exception 'Le prix proposé est obligatoire et doit être supérieur ou égal à 50€';
    end if;
    if (new.message is null or length(btrim(new.message)) = 0) then
      raise exception 'Le message est obligatoire pour un devis';
    end if;
  elsif (tg_op = 'UPDATE') then
    -- Valider uniquement si l'on modifie message/prix
    if (new.price_offer is distinct from old.price_offer) then
      if (new.price_offer is null or new.price_offer < 50) then
        raise exception 'Le prix proposé est obligatoire et doit être supérieur ou égal à 50€';
      end if;
    end if;
    if (new.message is distinct from old.message) then
      if (new.message is null or length(btrim(new.message)) = 0) then
        raise exception 'Le message est obligatoire pour un devis';
      end if;
    end if;
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.generate_quote_number(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  y int := extract(year from now());
  current int;
  next_num int;
  pref text := 'Q' || y || '-';
begin
  select current_number into current from public.quote_sequence where user_id = _user_id and year = y;
  if current is null then
    insert into public.quote_sequence(user_id, year, current_number, prefix)
    values (_user_id, y, 1, pref)
    returning current_number into next_num;
  else
    update public.quote_sequence set current_number = current_number + 1, updated_at = now()
    where user_id = _user_id and year = y
    returning current_number into next_num;
  end if;
  return coalesce((select prefix from public.quote_sequence where user_id = _user_id and year = y), pref) || lpad(next_num::text, 4, '0');
end;
$$;

CREATE OR REPLACE FUNCTION public.search_rides(_from_text text, _to_text text, _date date, _seats_min integer, _max_price numeric, _instant_only boolean)
RETURNS SETOF rides
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select * from public.rides r
  where (
    _from_text is null or r.from_city ilike '%'||_from_text||'%'
  ) and (
    _to_text is null or r.to_city ilike '%'||_to_text||'%'
  ) and (
    _date is null or r.date = _date
  ) and (
    _seats_min is null or r.seats_available >= _seats_min
  ) and (
    _max_price is null or r.price_per_seat <= _max_price
  ) and (
    _instant_only is not true or r.instant = true
  )
  order by r.price_per_seat asc, r.departure_time asc;
$$;