-- Gap-fill migration: adds missing tables, functions, views, and storage buckets
-- This file is idempotent and safe to re-run. It complements prior consolidated migration.

-- Ensure pgcrypto for UUIDs
create extension if not exists pgcrypto;

-- 0) Small compatibility tweaks
-- Add missing flag column used by app
alter table if exists public.profiles
  add column if not exists is_convoyeur_confirme boolean default false;

-- Align credits_ledger columns with app expectations (keep existing delta for backward compat)
alter table if exists public.credits_ledger
  add column if not exists amount integer,
  add column if not exists ref_type text,
  add column if not exists ref_id text;

-- 1) Contacts + RPC (simple stats view)
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text,
  status text not null default 'pending' check (status in ('pending','accepted','declined','active')),
  invited_user_id uuid references auth.users(id) on delete set null,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, email)
);
alter table public.contacts enable row level security;
drop policy if exists contacts_owner_all on public.contacts;
create policy contacts_owner_all on public.contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists contacts_invited_read_update on public.contacts;
create policy contacts_invited_read_update on public.contacts for select using (auth.uid() = invited_user_id);
drop policy if exists contacts_invited_update on public.contacts;
create policy contacts_invited_update on public.contacts for update using (auth.uid() = invited_user_id);

-- Simple view with placeholder missions_count (can be enhanced later)
create or replace view public.contacts_with_stats as
select c.*, 0::int as missions_count from public.contacts c;

-- RPC returning contacts_with_stats for current user (owner or invited)
create or replace function public.get_contacts_with_stats()
returns setof public.contacts_with_stats
language sql
security definer
set search_path = public as $$
  select * from public.contacts_with_stats c
  where c.user_id = auth.uid() or c.invited_user_id = auth.uid();
$$;

-- 2) Quotes (devis)
create table if not exists public.quote_sequence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null default extract(year from now()),
  current_number int not null default 0,
  prefix text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.quote_sequence enable row level security;
drop policy if exists quote_sequence_manage on public.quote_sequence;
create policy quote_sequence_manage on public.quote_sequence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_number text not null,
  quote_date date not null default current_date,
  validity_date date not null,
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired','cancelled')),
  subtotal_ht numeric not null default 0,
  vat_rate numeric,
  vat_amount numeric not null default 0,
  total_ttc numeric not null default 0,
  payment_terms text,
  payment_method text,
  notes text,
  legal_mentions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.quotes enable row level security;
-- Ensure required columns exist on pre-existing quotes table (remote may have an older shape)
alter table if exists public.quotes
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- Optionally add other columns if missing (safe no-ops when present)
alter table if exists public.quotes
  add column if not exists client_id uuid references public.clients(id) on delete cascade,
  add column if not exists quote_number text,
  add column if not exists quote_date date default current_date,
  add column if not exists validity_date date,
  add column if not exists status text default 'draft',
  add column if not exists subtotal_ht numeric default 0,
  add column if not exists vat_rate numeric,
  add column if not exists vat_amount numeric default 0,
  add column if not exists total_ttc numeric default 0,
  add column if not exists payment_terms text,
  add column if not exists payment_method text,
  add column if not exists notes text,
  add column if not exists legal_mentions text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz;
drop policy if exists quotes_select on public.quotes;
create policy quotes_select on public.quotes for select using (auth.uid() = user_id);
drop policy if exists quotes_insert on public.quotes;
create policy quotes_insert on public.quotes for insert with check (auth.uid() = user_id);
drop policy if exists quotes_update on public.quotes;
create policy quotes_update on public.quotes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists quotes_delete on public.quotes;
create policy quotes_delete on public.quotes for delete using (auth.uid() = user_id);
create index if not exists idx_quotes_user_id on public.quotes(user_id);
create index if not exists idx_quotes_client_id on public.quotes(client_id);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric default 1,
  unit_price numeric not null,
  total_ht numeric not null,
  vat_rate numeric default 20,
  created_at timestamptz not null default now()
);
alter table public.quote_items enable row level security;
drop policy if exists quote_items_manage on public.quote_items;
create policy quote_items_manage on public.quote_items for all using (
  exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
) with check (
  exists (select 1 from public.quotes q where q.id = quote_items.quote_id and q.user_id = auth.uid())
);
create index if not exists idx_quote_items_quote_id on public.quote_items(quote_id);

create or replace function public.generate_quote_number(_user_id uuid)
returns text language plpgsql as $$
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
end;$$;

revoke all on function public.generate_quote_number(uuid) from public;
grant execute on function public.generate_quote_number(uuid) to authenticated;

-- 3) Maintenance flags + RPC
create table if not exists public.maintenance_flags (
  id int primary key default 1,
  enabled boolean not null default false,
  message text,
  updated_at timestamptz not null default now()
);
alter table public.maintenance_flags enable row level security;
drop policy if exists maintenance_read on public.maintenance_flags;
create policy maintenance_read on public.maintenance_flags for select using (true);

create or replace function public.set_maintenance(p_enabled boolean, p_message text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  insert into public.maintenance_flags(id, enabled, message, updated_at)
  values (1, p_enabled, p_message, now())
  on conflict (id) do update set enabled = excluded.enabled, message = excluded.message, updated_at = now();
end;$$;

-- 4) Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','success','warning','error')),
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists notifications_rw on public.notifications;
create policy notifications_rw on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5) Push notification tokens
create table if not exists public.push_notification_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  device_type text,
  device_info jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);
alter table public.push_notification_tokens enable row level security;
drop policy if exists push_tokens_manage on public.push_notification_tokens;
create policy push_tokens_manage on public.push_notification_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6) User roles (lightweight)
create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  granted_at timestamptz not null default now(),
  primary key(user_id, role)
);
alter table public.user_roles enable row level security;
drop policy if exists user_roles_read_own on public.user_roles;
create policy user_roles_read_own on public.user_roles for select using (auth.uid() = user_id);
drop policy if exists user_roles_admin_write on public.user_roles;
create policy user_roles_admin_write on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- 7) Subscriptions (minimal)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null default 'decouverte',
  credits_remaining int not null default 5,
  credits_total int not null default 5,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists subscriptions_rw_own on public.subscriptions;
create policy subscriptions_rw_own on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 8) Analytics and Reports (minimal structure + helper RPCs)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  report_type text not null check (report_type in ('complete','financial','mileage','inspection')),
  date_from date not null,
  date_to date not null,
  status text not null default 'generated' check (status in ('generated','available','processing')),
  file_url text,
  missions_count int not null default 0,
  total_revenue numeric not null default 0,
  total_km numeric,
  fuel_costs numeric,
  net_profit numeric not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists reports_rw_own on public.reports;
create policy reports_rw_own on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.analytics_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  missions_count int not null default 0,
  total_revenue numeric not null default 0,
  total_km numeric not null default 0,
  fuel_costs numeric not null default 0,
  vehicle_costs numeric not null default 0,
  other_costs numeric not null default 0,
  net_profit numeric not null default 0,
  avg_mission_value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);
alter table public.analytics_data enable row level security;
drop policy if exists analytics_rw_own on public.analytics_data;
create policy analytics_rw_own on public.analytics_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Compute summary for a date range (placeholder aggregation)
create or replace function public.generate_report_data(
  _user_id uuid,
  _report_type text,
  _date_from date,
  _date_to date
) returns jsonb
language plpgsql as $$
declare
  v_missions int := 0;
  v_revenue numeric := 0;
  v_km numeric := 0;
  v_fuel numeric := 0;
  v_profit numeric := 0;
begin
  -- Basic aggregation from invoices within range for the user, if available
  select coalesce(count(*),0), coalesce(sum(total_ttc),0) into v_missions, v_revenue
  from public.invoices where user_id = _user_id and invoice_date between _date_from and _date_to;
  return jsonb_build_object(
    'summary', jsonb_build_object(
      'missions_count', v_missions,
      'total_revenue', v_revenue,
      'total_km', v_km,
      'fuel_costs', v_fuel,
      'net_profit', v_profit
    )
  );
end;$$;

revoke all on function public.generate_report_data(uuid, text, date, date) from public;
grant execute on function public.generate_report_data(uuid, text, date, date) to authenticated;

create or replace function public.calculate_daily_analytics(_user_id uuid, _date date)
returns void language plpgsql as $$
declare
  v_missions int := 0;
  v_revenue numeric := 0;
  v_avg numeric := 0;
begin
  select coalesce(count(*),0), coalesce(sum(total_ttc),0) into v_missions, v_revenue
  from public.invoices where user_id = _user_id and invoice_date = _date;
  if v_missions > 0 then v_avg := v_revenue / v_missions; else v_avg := 0; end if;
  insert into public.analytics_data(user_id, date, missions_count, total_revenue, avg_mission_value)
  values (_user_id, _date, v_missions, v_revenue, v_avg)
  on conflict (user_id, date) do update set missions_count = excluded.missions_count, total_revenue = excluded.total_revenue, avg_mission_value = excluded.avg_mission_value, updated_at = now();
end;$$;

revoke all on function public.calculate_daily_analytics(uuid, date) from public;
grant execute on function public.calculate_daily_analytics(uuid, date) to authenticated;

-- 9) Credits helper RPCs
create or replace function public.ensure_wallet(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.credits_wallets where user_id = p_user) then
    insert into public.credits_wallets(user_id, balance) values (p_user, 0);
  end if;
end;$$;

revoke all on function public.ensure_wallet(uuid) from public;
grant execute on function public.ensure_wallet(uuid) to authenticated;

create or replace function public.consume_credit(
  _user_id uuid,
  _mission_id uuid,
  _credits int,
  _type text,
  _description text
) returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_balance int;
begin
  perform public.ensure_wallet(_user_id);
  select balance into v_balance from public.credits_wallets where user_id = _user_id for update;
  if v_balance is null or v_balance < _credits then
    return false;
  end if;
  update public.credits_wallets set balance = balance - _credits, updated_at = now() where user_id = _user_id;
  insert into public.credits_ledger(user_id, amount, reason, ref_type, ref_id)
    values (_user_id, -_credits, coalesce(_description, _type), 'mission', coalesce(_mission_id::text, ''));
  return true;
end;$$;

revoke all on function public.consume_credit(uuid, uuid, int, text, text) from public;
grant execute on function public.consume_credit(uuid, uuid, int, text, text) to authenticated;

create or replace function public.admin_topup_credits(p_user uuid, p_amount int, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  perform public.ensure_wallet(p_user);
  update public.credits_wallets set balance = balance + p_amount, updated_at = now() where user_id = p_user;
  insert into public.credits_ledger(user_id, amount, reason) values (p_user, p_amount, coalesce(p_reason,'admin_topup'));
end;$$;

revoke all on function public.admin_topup_credits(uuid, int, text) from public;
grant execute on function public.admin_topup_credits(uuid, int, text) to authenticated;

-- 10) Convoiturage (rides/reservations/messages) – safe create
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete cascade,
  departure text not null,
  destination text not null,
  departure_time timestamptz not null,
  duration_minutes int,
  price numeric(8,2) not null check (price >= 0),
  seats_total int not null check (seats_total > 0 and seats_total <= 8),
  -- seats_available maintained via triggers (cannot reference other tables in generated columns)
  seats_available int not null default 0,
  route text[] default '{}',
  description text,
  vehicle_model text,
  options text[] default '{}',
  status text not null default 'active' check (status in ('active','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ride_reservations (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references auth.users(id) on delete cascade,
  seats int not null default 1 check (seats > 0 and seats <= 8),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled')),
  price_at_booking numeric(8,2) not null,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(ride_id, passenger_id)
);
create table if not exists public.ride_messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);
-- Maintain seats_available via triggers
create or replace function public.recompute_seats_available(p_ride uuid)
returns void language plpgsql as $$
declare v_reserved int;
begin
  select coalesce(sum(seats),0) into v_reserved
  from public.ride_reservations where ride_id = p_ride and status in ('pending','accepted');
  update public.rides
    set seats_available = greatest(seats_total - v_reserved, 0), updated_at = now()
    where id = p_ride;
end;$$;

create or replace function public.rides_init_seats()
returns trigger language plpgsql as $$
begin
  new.seats_available := new.seats_total;
  return new;
end;$$;

drop trigger if exists trg_rides_init_seats on public.rides;
create trigger trg_rides_init_seats
before insert on public.rides
for each row execute function public.rides_init_seats();

create or replace function public.ride_reservations_after_change()
returns trigger language plpgsql as $$
begin
  perform public.recompute_seats_available(coalesce(new.ride_id, old.ride_id));
  return null;
end;$$;

drop trigger if exists trg_ride_reservations_aiud on public.ride_reservations;
create trigger trg_ride_reservations_aiud
after insert or update or delete on public.ride_reservations
for each row execute function public.ride_reservations_after_change();
alter table public.rides enable row level security;
alter table public.ride_reservations enable row level security;
alter table public.ride_messages enable row level security;
drop policy if exists rides_select_all on public.rides;
create policy rides_select_all on public.rides for select using (true);
drop policy if exists rides_insert_own on public.rides;
create policy rides_insert_own on public.rides for insert with check (auth.uid() = driver_id);
drop policy if exists rides_update_own on public.rides;
create policy rides_update_own on public.rides for update using (auth.uid() = driver_id);
drop policy if exists rides_delete_own on public.rides;
create policy rides_delete_own on public.rides for delete using (auth.uid() = driver_id);
drop policy if exists ride_reservations_select on public.ride_reservations;
create policy ride_reservations_select on public.ride_reservations for select using (
  auth.uid() = passenger_id or auth.uid() = (select driver_id from public.rides r where r.id = ride_id)
);
drop policy if exists ride_reservations_insert on public.ride_reservations;
create policy ride_reservations_insert on public.ride_reservations for insert with check (auth.uid() = passenger_id);
drop policy if exists ride_reservations_update on public.ride_reservations;
create policy ride_reservations_update on public.ride_reservations for update using (
  auth.uid() = passenger_id or auth.uid() = (select driver_id from public.rides r where r.id = ride_id)
);
drop policy if exists ride_reservations_delete on public.ride_reservations;
create policy ride_reservations_delete on public.ride_reservations for delete using (
  auth.uid() = passenger_id or auth.uid() = (select driver_id from public.rides r where r.id = ride_id)
);
drop policy if exists ride_messages_select on public.ride_messages;
create policy ride_messages_select on public.ride_messages for select using (
  exists (select 1 from public.rides r where r.id = ride_id and r.driver_id = auth.uid())
  or exists (select 1 from public.ride_reservations rr where rr.ride_id = ride_id and rr.passenger_id = auth.uid())
);
drop policy if exists ride_messages_insert on public.ride_messages;
create policy ride_messages_insert on public.ride_messages for insert with check (
  auth.uid() = sender_id and (
    exists (select 1 from public.rides r where r.id = ride_id and r.driver_id = auth.uid())
    or exists (select 1 from public.ride_reservations rr where rr.ride_id = ride_id and rr.passenger_id = auth.uid())
  )
);

-- 11) Trajets partagés (simple, tolerant to legacy fields)
create table if not exists public.trajets_partages (
  id uuid primary key default gen_random_uuid(),
  convoyeur_id uuid references auth.users(id) on delete set null,
  conducteur_id uuid references auth.users(id) on delete set null,
  departure text,
  destination text,
  ville_depart text,
  ville_arrivee text,
  date_heure timestamptz not null,
  nb_places int,
  seats_total int,
  prix_par_place numeric,
  price numeric,
  description text,
  participants text[] not null default '{}',
  statut text,
  status text,
  start_lat numeric,
  start_lng numeric,
  end_lat numeric,
  end_lng numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trajets_partages enable row level security;
drop policy if exists trajets_rw on public.trajets_partages;
create policy trajets_rw on public.trajets_partages for all using (
  auth.uid() = convoyeur_id or auth.uid() = conducteur_id or auth.uid() = any (participants::uuid[])
) with check (auth.uid() = convoyeur_id or auth.uid() = conducteur_id);

-- 12) Marketplace (missions + offers)
create table if not exists public.fleetmarket_missions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  titre text not null,
  description text,
  ville_depart text not null,
  ville_arrivee text not null,
  date_depart timestamptz not null,
  prix_propose numeric,
  statut text not null default 'ouverte' check (statut in ('ouverte','en_negociation','attribuee','terminee','annulee')),
  vehicule_requis text,
  convoyeur_id uuid references auth.users(id) on delete set null,
  contact_visible boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fleetmarket_missions enable row level security;
drop policy if exists fleetmarket_select_public on public.fleetmarket_missions;
create policy fleetmarket_select_public on public.fleetmarket_missions for select using (true);
drop policy if exists fleetmarket_insert_own on public.fleetmarket_missions;
create policy fleetmarket_insert_own on public.fleetmarket_missions for insert with check (auth.uid() = created_by);
drop policy if exists fleetmarket_update_own on public.fleetmarket_missions;
create policy fleetmarket_update_own on public.fleetmarket_missions for update using (auth.uid() = created_by);

-- Alias view to support legacy name marketplace_missions
create or replace view public.marketplace_missions as select * from public.fleetmarket_missions;

create table if not exists public.marketplace_devis (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.fleetmarket_missions(id) on delete cascade,
  convoyeur_id uuid not null references auth.users(id) on delete cascade,
  prix_propose numeric not null default 0,
  message text,
  created_at timestamptz not null default now()
);
alter table public.marketplace_devis enable row level security;
drop policy if exists marketplace_devis_select_participants on public.marketplace_devis;
create policy marketplace_devis_select_participants on public.marketplace_devis for select using (
  auth.uid() = convoyeur_id or auth.uid() = (select created_by from public.fleetmarket_missions m where m.id = mission_id)
);
drop policy if exists marketplace_devis_insert_convoyeur on public.marketplace_devis;
create policy marketplace_devis_insert_convoyeur on public.marketplace_devis for insert with check (auth.uid() = convoyeur_id);

-- Optional: BEFORE INSERT credit consumption (1 credit) when publishing a fleetmarket mission
create or replace function public.fleetmarket_consume_credit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.consume_credit(new.created_by, null, 1, 'fleetmarket_publish', 'Publication mission marketplace') then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;
  return new;
end;$$;

drop trigger if exists trg_fleetmarket_consume_credit on public.fleetmarket_missions;
create trigger trg_fleetmarket_consume_credit
before insert on public.fleetmarket_missions
for each row execute function public.fleetmarket_consume_credit();

-- 13) Missions simplified view for realtime tracking UI
create or replace view public.missions_simplified as
select
  m.id,
  m.reference,
  m.title,
  m.description,
  m.pickup_address,
  m.delivery_address,
  m.pickup_date,
  m.delivery_date,
  m.status as raw_status,
  case m.status
    when 'draft' then 'pending'
    when 'published' then 'pending'
    when 'assigned' then 'pending'
    when 'picked_up' then 'in_progress'
    when 'in_transit' then 'in_progress'
    when 'delivered' then 'in_progress'
    when 'completed' then 'completed'
    when 'cancelled' then 'cancelled'
    else 'pending'
  end as ui_status,
  m.driver_id,
  m.donor_id,
  m.created_by,
  m.created_at
from public.missions m;

-- 14) Storage buckets and policies
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mission-photos','mission-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('vehicle-assets','vehicle-assets', true)
on conflict (id) do nothing;

-- Avatars: public read, authenticated upload
drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars: authenticated upload" on storage.objects;
create policy "avatars: authenticated upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Mission photos: authenticated insert (uploads via signed URL are also allowed by backend); private read by participants could be added later
drop policy if exists "mission-photos: authenticated upload" on storage.objects;
create policy "mission-photos: authenticated upload" on storage.objects for insert with check (bucket_id = 'mission-photos' and auth.role() = 'authenticated');

-- Vehicle assets: public read only
drop policy if exists "vehicle-assets: public read" on storage.objects;
create policy "vehicle-assets: public read" on storage.objects for select using (bucket_id = 'vehicle-assets');

-- Realtime publication for mission_tracking used by web dashboard
do $$ begin
  execute 'alter publication supabase_realtime add table public.mission_tracking';
exception when duplicate_object then null; end $$;
