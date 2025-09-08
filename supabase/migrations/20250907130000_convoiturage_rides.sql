-- Convoiturage core tables: rides, ride_reservations, ride_messages
-- Safe re-run guards (create if not exists patterns)

-- Enable pgcrypto for gen_random_uuid if not already
create extension if not exists pgcrypto;

-- rides: published trips by drivers
create table if not exists public.rides (
	id uuid primary key default gen_random_uuid(),
	driver_id uuid not null references auth.users(id) on delete cascade,
	departure text not null,
	destination text not null,
	departure_time timestamptz not null,
	duration_minutes int,
	price numeric(8,2) not null check (price >= 0),
	seats_total int not null check (seats_total > 0 and seats_total <= 8),
	seats_available int generated always as (greatest(seats_total - coalesce(
		(select coalesce(sum(seats),0) from public.ride_reservations r where r.ride_id = id and r.status in ('pending','accepted'))
	,0),0)) stored,
	route text[] default '{}',
	description text,
	vehicle_model text,
	options text[] default '{}', -- e.g., {"Climatisation","Non-fumeur"}
	status text not null default 'active' check (status in ('active','cancelled','completed')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_rides_times on public.rides(departure_time desc);
create index if not exists idx_rides_route on public.rides (departure, destination);
create index if not exists idx_rides_driver on public.rides (driver_id);

-- Reservations for rides
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

create index if not exists idx_reservations_ride on public.ride_reservations(ride_id);
create index if not exists idx_reservations_passenger on public.ride_reservations(passenger_id);

-- Messages tied to a ride between participants
create table if not exists public.ride_messages (
	id uuid primary key default gen_random_uuid(),
	ride_id uuid not null references public.rides(id) on delete cascade,
	sender_id uuid not null references auth.users(id) on delete cascade,
	content text not null check (length(trim(content)) > 0),
	created_at timestamptz not null default now()
);

create index if not exists idx_ride_messages_ride_created on public.ride_messages(ride_id, created_at desc);
create index if not exists idx_ride_messages_sender on public.ride_messages(sender_id);

-- Basic RLS
alter table public.rides enable row level security;
alter table public.ride_reservations enable row level security;
alter table public.ride_messages enable row level security;

-- Policies: rides
create policy if not exists rides_select_all on public.rides
	for select using (true);

create policy if not exists rides_insert_own on public.rides
	for insert with check (auth.uid() = driver_id);

create policy if not exists rides_update_own on public.rides
	for update using (auth.uid() = driver_id);

create policy if not exists rides_delete_own on public.rides
	for delete using (auth.uid() = driver_id);

-- Policies: reservations (driver or passenger can see)
create policy if not exists ride_reservations_select on public.ride_reservations
	for select using (
		auth.uid() = passenger_id OR auth.uid() = (select driver_id from public.rides r where r.id = ride_id)
	);

create policy if not exists ride_reservations_insert on public.ride_reservations
	for insert with check (
		auth.uid() = passenger_id
	);

-- Passenger can cancel own pending/accepted; driver can accept/reject for own rides
create policy if not exists ride_reservations_update on public.ride_reservations
	for update using (
		auth.uid() = passenger_id OR auth.uid() = (select driver_id from public.rides r where r.id = ride_id)
	);

create policy if not exists ride_reservations_delete on public.ride_reservations
	for delete using (
		auth.uid() = passenger_id OR auth.uid() = (select driver_id from public.rides r where r.id = ride_id)
	);

-- Policies: messages (participants only: driver or any reserver)
create policy if not exists ride_messages_select on public.ride_messages
	for select using (
		exists (
			select 1 from public.rides r where r.id = ride_id and (r.driver_id = auth.uid())
		) OR exists (
			select 1 from public.ride_reservations rr where rr.ride_id = ride_id and rr.passenger_id = auth.uid()
		)
	);

create policy if not exists ride_messages_insert on public.ride_messages
	for insert with check (
		auth.uid() = sender_id AND (
			exists (select 1 from public.rides r where r.id = ride_id and r.driver_id = auth.uid())
			OR exists (select 1 from public.ride_reservations rr where rr.ride_id = ride_id and rr.passenger_id = auth.uid())
		)
	);

-- Triggers to keep updated_at fresh
create or replace function public.tg_set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_rides on public.rides;
create trigger set_updated_at_rides before update on public.rides
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at_reservations on public.ride_reservations;
create trigger set_updated_at_reservations before update on public.ride_reservations
for each row execute function public.tg_set_updated_at();

-- Ensure tables are part of realtime publication
do $$ begin
	execute 'alter publication supabase_realtime add table public.rides';
exception when duplicate_object then null; end $$;
do $$ begin
	execute 'alter publication supabase_realtime add table public.ride_reservations';
exception when duplicate_object then null; end $$;
do $$ begin
	execute 'alter publication supabase_realtime add table public.ride_messages';
exception when duplicate_object then null; end $$;

