-- Devis (quotes) schema: tables, sequence, RPC, RLS

-- Sequence table per user/year
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

drop policy if exists "Users can manage their quote sequence" on public.quote_sequence;
create policy "Users can manage their quote sequence"
on public.quote_sequence for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Quotes table
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  quote_number text not null,
  quote_date date not null default current_date,
  validity_date date not null,
  status text not null default 'draft',
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

drop policy if exists "Users can read own quotes" on public.quotes;
create policy "Users can read own quotes" on public.quotes for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own quotes" on public.quotes;
create policy "Users can insert own quotes" on public.quotes for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own quotes" on public.quotes;
create policy "Users can update own quotes" on public.quotes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own quotes" on public.quotes;
create policy "Users can delete own quotes" on public.quotes for delete using (auth.uid() = user_id);

create index if not exists quotes_user_id_idx on public.quotes(user_id);
create index if not exists quotes_client_id_idx on public.quotes(client_id);

-- Quote items table
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

drop policy if exists "Users can manage items via parent quote" on public.quote_items;
create policy "Users can manage items via parent quote" on public.quote_items
for all
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_items.quote_id and q.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.quotes q
    where q.id = quote_items.quote_id and q.user_id = auth.uid()
  )
);

create index if not exists quote_items_quote_id_idx on public.quote_items(quote_id);

-- RPC to generate quote number like Q{YEAR}-{COUNTER}
create or replace function public.generate_quote_number(_user_id uuid)
returns text
language plpgsql
as $$
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

revoke all on function public.generate_quote_number(uuid) from public;
grant execute on function public.generate_quote_number(uuid) to authenticated;
