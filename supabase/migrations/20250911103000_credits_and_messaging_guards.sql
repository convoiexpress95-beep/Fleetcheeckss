-- Credits wallet, ledger, reservation with credits, contact reveal, and messaging phone guard
create extension if not exists pgcrypto;

-- Wallet balances per user
create table if not exists public.credits_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Ledger for auditability
create table if not exists public.credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null, -- positive for credit, negative for debit
  reason text not null,    -- e.g., 'reservation_fee', 'driver_fee', 'topup'
  ref_type text,           -- e.g., 'ride'
  ref_id uuid,
  created_at timestamptz not null default now()
);

alter table public.credits_wallets enable row level security;
alter table public.credits_ledger enable row level security;

create policy if not exists credits_wallets_select_own on public.credits_wallets
  for select using (auth.uid() = user_id);

create policy if not exists credits_ledger_select_own on public.credits_ledger
  for select using (auth.uid() = user_id);

-- Ensure wallet exists
create or replace function public.ensure_wallet(p_user uuid)
returns void
language plpgsql as $$
begin
  insert into public.credits_wallets(user_id, balance)
  values (p_user, 0)
  on conflict (user_id) do nothing;
end;
$$;

-- Adjust credits atomically with overdraft protection
create or replace function public.adjust_credits(p_user uuid, p_delta int, p_reason text, p_ref_type text, p_ref_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_new_balance integer;
begin
  perform public.ensure_wallet(p_user);
  update public.credits_wallets
     set balance = balance + p_delta,
         updated_at = now()
   where user_id = p_user
  returning balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'wallet missing for %', p_user using errcode = 'P0001';
  end if;

  if v_new_balance < 0 then
    -- rollback
    update public.credits_wallets set balance = balance - p_delta where user_id = p_user;
    raise exception 'insufficient_credits';
  end if;

  insert into public.credits_ledger(user_id, amount, reason, ref_type, ref_id)
  values (p_user, p_delta, p_reason, p_ref_type, p_ref_id);
end;
$$;

-- Reserve a ride and charge credits: passenger -5 (once per ride), driver -2 per seat
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

  -- Charge passenger 5 credits only once per (ride, passenger)
  select exists(
    select 1 from public.credits_ledger l
    where l.user_id = v_passenger and l.reason = 'reservation_fee' and l.ref_type = 'ride' and l.ref_id = p_ride_id
  ) into v_already_paid;
  if not v_already_paid then
    perform public.adjust_credits(v_passenger, -5, 'reservation_fee', 'ride', p_ride_id);
  end if;

  -- Charge driver 2 credits per seat reserved (always, idempotent is guaranteed by unique reservation)
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

-- Reveal driver contact (phone) after charging 5 credits if not already charged
-- Expects phone stored in profiles.phone (added below)
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

  -- Verify the requester is a reserver of that ride or the driver
  if not exists (
    select 1 from public.ride_reservations rr where rr.ride_id = p_ride_id and (rr.passenger_id = v_user)
  ) and v_user <> v_driver then
    raise exception 'not_allowed';
  end if;

  -- Charge 5 credits only once per ride if not already paid via reservation_fee
  select exists(
    select 1 from public.credits_ledger l
    where l.user_id = v_user and l.reason = 'reservation_fee' and l.ref_type = 'ride' and l.ref_id = p_ride_id
  ) into v_already_paid;
  if not v_already_paid then
    perform public.adjust_credits(v_user, -5, 'reservation_fee', 'ride', p_ride_id);
  end if;

  select phone into v_phone from public.profiles p where p.id = v_driver;
  return coalesce(v_phone, '');
end;
$$;

-- Add phone column to profiles if missing
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='phone'
  ) then
    alter table public.profiles add column phone text;
  end if;
end $$;

-- Messaging guard: reject phone numbers in ride_messages.content
create or replace function public.guard_ride_message()
returns trigger
language plpgsql
as $$
begin
  -- Basic phone pattern: 8+ digits possibly separated by spaces, dots, dashes, may start with +
  if NEW.content ~* '(?:\+?\d[\s\-\.]*){8,}' then
    raise exception 'phone_numbers_forbidden_in_messages';
  end if;
  return NEW;
end;
$$;

drop trigger if exists tr_guard_ride_message on public.ride_messages;
create trigger tr_guard_ride_message
before insert or update on public.ride_messages
for each row execute function public.guard_ride_message();

-- Realtime publication (ensure new tables included)
do $$ begin
  execute 'alter publication supabase_realtime add table public.credits_wallets';
exception when duplicate_object then null; end $$;
do $$ begin
  execute 'alter publication supabase_realtime add table public.credits_ledger';
exception when duplicate_object then null; end $$;
