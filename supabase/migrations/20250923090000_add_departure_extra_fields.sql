-- Add extra fields to inspection_departures for guided departure wizard
alter table if exists public.inspection_departures
  add column if not exists fuel_percent integer check (fuel_percent between 0 and 100),
  add column if not exists keys_count integer check (keys_count in (1,2)), -- 2 represents 2+
  add column if not exists has_fuel_card boolean default false,
  add column if not exists has_board_documents boolean default false,
  add column if not exists has_delivery_report boolean default false;
