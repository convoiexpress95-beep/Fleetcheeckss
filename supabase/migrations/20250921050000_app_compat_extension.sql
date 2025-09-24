-- Compatibility migration to align DB with mobile/web app usage
-- Includes: tracking, inspections, invoicing, messaging, credits

-- Helper: admin check used in multiple policies
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public as $$
declare
  v_is_admin boolean;
begin
  -- service_role should pass admin checks
  if auth.role() = 'service_role' then
    return true;
  end if;

  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.app_role = 'admin'
  ) into v_is_admin;

  return coalesce(v_is_admin, false);
end;$$;

-- 1) Tracking links and mission_tracking
create table if not exists public.tracking_links (
  id uuid not null default gen_random_uuid() primary key,
  mission_id uuid not null references public.missions(id) on delete cascade,
  tracking_token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists public.mission_tracking (
  id uuid not null default gen_random_uuid() primary key,
  mission_id uuid not null references public.missions(id) on delete cascade,
  driver_id uuid,
  latitude numeric not null,
  longitude numeric not null,
  speed numeric,
  heading numeric,
  battery_level integer,
  signal_strength integer,
  created_at timestamptz not null default now()
);

alter table public.tracking_links enable row level security;
alter table public.mission_tracking enable row level security;

-- Policies for tracking_links
drop policy if exists tracking_links_select on public.tracking_links;
create policy tracking_links_select on public.tracking_links for select using (
  exists (
    select 1 from public.missions m
    where m.id = tracking_links.mission_id
      and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())
  )
);

drop policy if exists tracking_links_insert on public.tracking_links;
create policy tracking_links_insert on public.tracking_links for insert with check (
  exists (
    select 1 from public.missions m
    where m.id = tracking_links.mission_id
      and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())
  )
);

-- Policies for mission_tracking (allow driver OR creator to insert/view)
drop policy if exists mission_tracking_select on public.mission_tracking;
create policy mission_tracking_select on public.mission_tracking for select using (
  exists (
    select 1 from public.missions m
    where m.id = mission_tracking.mission_id
      and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())
  )
);

drop policy if exists mission_tracking_insert on public.mission_tracking;
create policy mission_tracking_insert on public.mission_tracking for insert with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_tracking.mission_id
      and (m.driver_id = auth.uid() or m.created_by = auth.uid())
  )
);

create index if not exists idx_tracking_links_mission_id on public.tracking_links(mission_id);
create index if not exists idx_tracking_links_token on public.tracking_links(tracking_token);
create index if not exists idx_mission_tracking_mission_id on public.mission_tracking(mission_id);
create index if not exists idx_mission_tracking_created_at on public.mission_tracking(created_at desc);

-- 2) Inspections & related entities
create table if not exists public.inspection_departures (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  driver_id uuid not null,
  initial_mileage numeric not null,
  initial_fuel text not null check (initial_fuel in ('full','three_quarters','half','quarter','empty')),
  photos jsonb not null default '[]',
  internal_notes text,
  client_signature_url text,
  client_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspection_arrivals (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  driver_id uuid not null,
  final_mileage numeric not null,
  final_fuel text not null check (final_fuel in ('full','three_quarters','half','quarter','empty')),
  photos jsonb not null default '[]',
  client_notes text,
  driver_notes text,
  client_signature_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_costs (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  driver_id uuid not null,
  fuel_costs numeric default 0,
  toll_costs numeric default 0,
  parking_costs numeric default 0,
  hotel_costs numeric default 0,
  meal_costs numeric default 0,
  other_costs numeric default 0,
  receipts jsonb not null default '[]',
  cost_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_documents (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  driver_id uuid not null,
  document_type text not null,
  document_name text not null,
  document_url text not null,
  ocr_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mission_reports (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  main_report_url text,
  documents_report_url text,
  costs_report_url text,
  sent_to_client boolean default false,
  sent_to_donor boolean default false,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inspection_departures enable row level security;
alter table public.inspection_arrivals enable row level security;
alter table public.mission_costs enable row level security;
alter table public.mission_documents enable row level security;
alter table public.mission_reports enable row level security;

-- RLS: allow creator/donor/driver of the mission
do $$ begin
  execute 'drop policy if exists insp_dep_all on public.inspection_departures';
  execute 'create policy insp_dep_all on public.inspection_departures for all using (exists (select 1 from public.missions m where m.id = inspection_departures.mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())))';
  execute 'drop policy if exists insp_arr_all on public.inspection_arrivals';
  execute 'create policy insp_arr_all on public.inspection_arrivals for all using (exists (select 1 from public.missions m where m.id = inspection_arrivals.mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())))';
  execute 'drop policy if exists mission_costs_all on public.mission_costs';
  execute 'create policy mission_costs_all on public.mission_costs for all using (exists (select 1 from public.missions m where m.id = mission_costs.mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())))';
  execute 'drop policy if exists mission_docs_all on public.mission_documents';
  execute 'create policy mission_docs_all on public.mission_documents for all using (exists (select 1 from public.missions m where m.id = mission_documents.mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())))';
  execute 'drop policy if exists mission_reports_all on public.mission_reports';
  execute 'create policy mission_reports_all on public.mission_reports for all using (exists (select 1 from public.missions m where m.id = mission_reports.mission_id and (m.created_by = auth.uid() or m.donor_id = auth.uid() or m.driver_id = auth.uid())))';
exception when others then null; end $$;

-- 3) Invoicing suite (company_info, clients, invoices, invoice_items, invoice_sequence)
create table if not exists public.company_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  siret text,
  vat_number text,
  address text not null,
  postal_code text not null,
  city text not null,
  country text default 'France',
  phone text,
  email text,
  legal_form text,
  capital_amount numeric,
  website text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text,
  first_name text,
  last_name text,
  siret text,
  vat_number text,
  address text not null,
  postal_code text not null,
  city text not null,
  country text default 'France',
  phone text,
  email text,
  is_company boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  invoice_number text not null unique,
  invoice_date date not null default current_date,
  due_date date not null,
  status text default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  subtotal_ht numeric(10,2) not null default 0,
  vat_rate numeric(5,2) default 20.00,
  vat_amount numeric(10,2) not null default 0,
  total_ttc numeric(10,2) not null default 0,
  payment_terms text default 'Paiement à 30 jours',
  payment_method text,
  notes text,
  legal_mentions text default 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null,
  total_ht numeric(10,2) not null,
  vat_rate numeric(5,2) default 20.00,
  created_at timestamptz default now()
);

create table if not exists public.invoice_sequence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  current_number integer not null default 0,
  prefix text default 'FAC',
  year integer not null default extract(year from current_date),
  updated_at timestamptz default now()
);

alter table public.company_info enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_sequence enable row level security;

drop policy if exists company_info_all on public.company_info;
create policy company_info_all on public.company_info for all using (auth.uid() = user_id);

drop policy if exists clients_all on public.clients;
create policy clients_all on public.clients for all using (auth.uid() = user_id);

drop policy if exists invoices_all on public.invoices;
create policy invoices_all on public.invoices for all using (auth.uid() = user_id);

drop policy if exists invoice_items_manage on public.invoice_items;
create policy invoice_items_manage on public.invoice_items for all using (
  exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and i.user_id = auth.uid())
);

drop policy if exists invoice_sequence_all on public.invoice_sequence;
create policy invoice_sequence_all on public.invoice_sequence for all using (auth.uid() = user_id);

-- Functions & triggers for invoicing
create or replace function public.generate_invoice_number(_user_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  current_year integer;
  sequence_record record;
  new_number integer;
  invoice_number text;
begin
  current_year := extract(year from current_date);
  select * into sequence_record from invoice_sequence where user_id = _user_id;
  if not found then
    insert into invoice_sequence (user_id, current_number, year) values (_user_id, 1, current_year) returning * into sequence_record;
    new_number := 1;
  else
    if sequence_record.year != current_year then
      update invoice_sequence set current_number = 1, year = current_year, updated_at = now() where user_id = _user_id;
      new_number := 1;
    else
      new_number := sequence_record.current_number + 1;
      update invoice_sequence set current_number = new_number, updated_at = now() where user_id = _user_id;
    end if;
  end if;
  invoice_number := coalesce(sequence_record.prefix,'FAC') || '-' || current_year || '-' || lpad(new_number::text, 3, '0');
  return invoice_number;
end;$$;

create or replace function public.update_invoice_totals()
returns trigger language plpgsql as $$
declare
  invoice_total_ht numeric(10,2);
  invoice_vat_amount numeric(10,2);
  invoice_total_ttc numeric(10,2);
begin
  select coalesce(sum(total_ht),0), coalesce(sum(total_ht * vat_rate / 100),0)
    into invoice_total_ht, invoice_vat_amount
  from invoice_items where invoice_id = coalesce(new.invoice_id, old.invoice_id);
  invoice_total_ttc := invoice_total_ht + invoice_vat_amount;
  update invoices set subtotal_ht = invoice_total_ht, vat_amount = invoice_vat_amount, total_ttc = invoice_total_ttc, updated_at = now()
   where id = coalesce(new.invoice_id, old.invoice_id);
  return coalesce(new, old);
end;$$;

drop trigger if exists trigger_update_invoice_totals_insert on public.invoice_items;
create trigger trigger_update_invoice_totals_insert after insert on public.invoice_items for each row execute function public.update_invoice_totals();

drop trigger if exists trigger_update_invoice_totals_update on public.invoice_items;
create trigger trigger_update_invoice_totals_update after update on public.invoice_items for each row execute function public.update_invoice_totals();

drop trigger if exists trigger_update_invoice_totals_delete on public.invoice_items;
create trigger trigger_update_invoice_totals_delete after delete on public.invoice_items for each row execute function public.update_invoice_totals();

create or replace function public.calculate_item_total()
returns trigger language plpgsql as $$
begin
  new.total_ht := new.quantity * new.unit_price;
  return new;
end;$$;

drop trigger if exists trigger_calculate_item_total on public.invoice_items;
create trigger trigger_calculate_item_total before insert or update on public.invoice_items for each row execute function public.calculate_item_total();

-- 4) Messaging (conversations/messages)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  convoyeur_id uuid not null references auth.users(id) on delete cascade,
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete cascade, -- align with auth.uid()
  content text not null,
  message_type text not null default 'text' check (message_type in ('text','attachment')),
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at);

drop policy if exists conversations_select_participants on public.conversations;
create policy conversations_select_participants on public.conversations for select using (
  owner_id = auth.uid() or convoyeur_id = auth.uid() or public.is_admin()
);

drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants on public.conversations for insert with check (
  auth.uid() = owner_id or auth.uid() = convoyeur_id or public.is_admin()
);

drop policy if exists conversations_update_participants on public.conversations;
create policy conversations_update_participants on public.conversations for update using (
  owner_id = auth.uid() or convoyeur_id = auth.uid() or public.is_admin()
);

drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.owner_id = auth.uid() or c.convoyeur_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists messages_insert_sender_and_participant on public.messages;
create policy messages_insert_sender_and_participant on public.messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.conversations c where c.id = messages.conversation_id
      and (c.owner_id = auth.uid() or c.convoyeur_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists messages_update_receiver_can_mark_read on public.messages;
create policy messages_update_receiver_can_mark_read on public.messages for update using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.owner_id = auth.uid() or c.convoyeur_id = auth.uid() or public.is_admin())
  ) and sender_id <> auth.uid()
);

-- Optional storage bucket for message attachments
insert into storage.buckets (id, name, public)
  values ('message-attachments','message-attachments', true)
on conflict (id) do nothing;

drop policy if exists "message-attachments: public read" on storage.objects;
create policy "message-attachments: public read" on storage.objects for select using (bucket_id = 'message-attachments');

drop policy if exists "message-attachments: authenticated upload" on storage.objects;
create policy "message-attachments: authenticated upload" on storage.objects for insert with check (bucket_id = 'message-attachments' and auth.role() = 'authenticated');

-- 5) Credits (wallet + ledger) for shop/credits features
create table if not exists public.credits_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text,
  ref text,
  created_at timestamptz not null default now()
);

alter table public.credits_wallets enable row level security;
alter table public.credits_ledger enable row level security;

drop policy if exists credits_wallets_rw on public.credits_wallets;
create policy credits_wallets_rw on public.credits_wallets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists credits_ledger_select on public.credits_ledger;
create policy credits_ledger_select on public.credits_ledger for select using (auth.uid() = user_id);

drop policy if exists credits_ledger_insert_self on public.credits_ledger;
create policy credits_ledger_insert_self on public.credits_ledger for insert with check (auth.uid() = user_id);
