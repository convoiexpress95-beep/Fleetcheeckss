-- Idempotence & usage promos
alter table cart_orders add column if not exists external_ref text;
create unique index if not exists cart_orders_external_ref_key on cart_orders(external_ref);
create index if not exists cart_orders_status_idx on cart_orders(status);

create table if not exists promo_code_usages (
  code text references promo_codes(code) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  used_at timestamptz default now(),
  order_id uuid references cart_orders(id) on delete cascade,
  primary key (code, user_id, order_id)
);

alter table promo_code_usages enable row level security;
create policy promo_code_usages_select on promo_code_usages for select using (auth.uid() = user_id);

-- RPC pour incrémenter usage (utilise service role côté Edge idéalement)
create or replace function public.increment_promo_usage(_code text)
returns void
language plpgsql
security definer
as $$
begin
  update promo_codes set used_count = used_count + 1 where code = _code and (usage_limit is null or used_count < usage_limit);
end;$$;

grant execute on function public.increment_promo_usage(text) to authenticated;
