-- Read receipts for ride messages
create table if not exists public.ride_message_reads (
	message_id uuid not null references public.ride_messages(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	read_at timestamptz not null default now(),
	primary key(message_id, user_id)
);

alter table public.ride_message_reads enable row level security;

create policy if not exists ride_message_reads_select on public.ride_message_reads
	for select using (
		auth.uid() = user_id
	);

create policy if not exists ride_message_reads_insert on public.ride_message_reads
	for insert with check (
		auth.uid() = user_id
	);

create index if not exists idx_ride_message_reads_user on public.ride_message_reads(user_id, read_at desc);
