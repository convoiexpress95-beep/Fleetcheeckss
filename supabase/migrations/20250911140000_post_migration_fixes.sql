-- Post-migration fixes: RLS policies for credits tables, message body/content sync, guard improvements,
-- and defaulting seats_available/price_per_seat on rides.

-- 1) RLS policies for credits tables (create if missing)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'credits_wallets' and policyname = 'credits_wallets_select_own'
  ) then
    execute 'create policy credits_wallets_select_own on public.credits_wallets for select using (auth.uid() = user_id)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'credits_ledger' and policyname = 'credits_ledger_select_own'
  ) then
    execute 'create policy credits_ledger_select_own on public.credits_ledger for select using (auth.uid() = user_id)';
  end if;
end $$;

-- 2) ride_messages: keep body/content in sync and harden guard to check both
create or replace function public.sync_ride_message_body_content()
returns trigger
language plpgsql
as $$
begin
  -- Prefer NEW.content if provided, else NEW.body; ensure both are consistent
  if NEW.content is null and NEW.body is not null then
    NEW.content := NEW.body;
  end if;
  if NEW.body is null and NEW.content is not null then
    NEW.body := NEW.content;
  end if;
  return NEW;
end;
$$;

-- Ensure the sync trigger runs before guard (Postgres orders triggers by name; 'aa_' prefix ensures early run)
drop trigger if exists aa_sync_ride_message_body_content on public.ride_messages;
create trigger aa_sync_ride_message_body_content
before insert or update on public.ride_messages
for each row execute function public.sync_ride_message_body_content();

-- Update guard to check both content and body
create or replace function public.guard_ride_message()
returns trigger
language plpgsql
as $$
declare v_text text;
begin
  v_text := coalesce(NEW.content, NEW.body, '');
  if v_text ~* '(?:\+?\d[\s\-\.]*){8,}' then
    raise exception 'phone_numbers_forbidden_in_messages';
  end if;
  return NEW;
end;
$$;

-- Recreate guard trigger (name after 'aa_' so it runs second)
drop trigger if exists tr_guard_ride_message on public.ride_messages;
create trigger tr_guard_ride_message
before insert or update on public.ride_messages
for each row execute function public.guard_ride_message();

-- Backfill: ensure content mirrors body where missing
update public.ride_messages set content = body where content is null and body is not null;

-- 3) rides: default seats_available and price_per_seat when missing
create or replace function public.rides_defaults()
returns trigger
language plpgsql
as $$
begin
  if NEW.seats_available is null then
    NEW.seats_available := coalesce(NEW.seats_total, NEW.seats, 0);
  end if;
  if NEW.price_per_seat is null then
    NEW.price_per_seat := coalesce(NEW.price, 0);
  end if;
  return NEW;
end;
$$;

drop trigger if exists tr_rides_defaults on public.rides;
create trigger tr_rides_defaults
before insert on public.rides
for each row execute function public.rides_defaults();

-- Optional backfill for existing rows (won't change rows already consistent)
update public.rides set seats_available = coalesce(seats_available, seats_total, seats)
where seats_available is null;

update public.rides set price_per_seat = coalesce(price_per_seat, price, 0)
where price_per_seat is null;
