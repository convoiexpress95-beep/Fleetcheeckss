-- Cart & Orders base + promo codes (client validations côté Edge futur)
create table if not exists cart_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending',
  amount numeric not null,
  currency text not null default 'EUR',
  subtotal numeric not null,
  vat_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  promo_code text,
  credits_expected int not null default 0,
  items jsonb not null,
  payment_provider text default 'mollie',
  payment_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);
create index if not exists cart_orders_user_idx on cart_orders(user_id);

-- Promo codes table (optional server validation)
create table if not exists promo_codes (
  code text primary key,
  percent int not null check (percent > 0 and percent <= 90),
  active boolean not null default true,
  expires_at timestamptz,
  usage_limit int,
  used_count int not null default 0,
  per_user_limit int,
  created_at timestamptz default now()
);

-- Basic RLS
alter table cart_orders enable row level security;
create policy cart_orders_select on cart_orders for select using (auth.uid() = user_id);
create policy cart_orders_insert on cart_orders for insert with check (auth.uid() = user_id);
create policy cart_orders_update on cart_orders for update using (auth.uid() = user_id);

alter table promo_codes enable row level security;
create policy promo_codes_select on promo_codes for select using (true);
