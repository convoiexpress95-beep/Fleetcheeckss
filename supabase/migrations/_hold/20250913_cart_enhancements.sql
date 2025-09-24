-- Cart enhancements: paid_amount, paid_currency, partial index, safety columns
alter table cart_orders add column if not exists paid_amount numeric;
alter table cart_orders add column if not exists paid_currency text;

-- Partial index for fast pending lookups
create index if not exists cart_orders_pending_idx on cart_orders(created_at) where status='pending';
