-- Harden is_admin to avoid RLS-induced 500s by using SECURITY DEFINER
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Ensure trajets_partages has coordinates expected by UI
alter table if exists public.trajets_partages
  add column if not exists start_lat numeric,
  add column if not exists start_lng numeric,
  add column if not exists end_lat numeric,
  add column if not exists end_lng numeric;

-- Ensure participants is uuid[] (empty default preserved)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'trajets_partages'
      and column_name = 'participants' and data_type <> 'ARRAY'
  ) then
    alter table public.trajets_partages
      alter column participants type uuid[] using participants::uuid[];
  end if;
end $$;

-- Create conversations table expected by UI
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  convoyeur_id uuid not null,
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_owner_id_fkey foreign key (owner_id) references auth.users(id),
  constraint conversations_convoyeur_id_fkey foreign key (convoyeur_id) references auth.users(id)
);

alter table public.conversations enable row level security;

drop policy if exists conversations_select on public.conversations;
drop policy if exists conversations_modify on public.conversations;

create policy conversations_select
  on public.conversations for select
  using (
    auth.uid() = owner_id or auth.uid() = convoyeur_id or public.is_admin()
  );

create policy conversations_modify
  on public.conversations for all
  using (
    auth.uid() = owner_id or auth.uid() = convoyeur_id or public.is_admin()
  )
  with check (
    auth.uid() = owner_id or auth.uid() = convoyeur_id or public.is_admin()
  );

-- Helpful indexes
create index if not exists idx_trajets_partages_date on public.trajets_partages (date_heure);
create index if not exists idx_conversations_owner on public.conversations (owner_id);
create index if not exists idx_conversations_convoyeur on public.conversations (convoyeur_id);