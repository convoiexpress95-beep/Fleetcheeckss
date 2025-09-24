-- Migration: Fix notifications compat (ensure columns, backfill, RLS, indexes)
begin;

-- Create table if missing at all (safety net)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade
);

-- Ensure required columns exist
do $$ begin
  -- title
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='title'
  ) then
    alter table public.notifications add column title text not null default ''::text;
    alter table public.notifications alter column title drop default;
  end if;

  -- message
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='message'
  ) then
    alter table public.notifications add column message text not null default ''::text;
    alter table public.notifications alter column message drop default;
  end if;

  -- type
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='type'
  ) then
    alter table public.notifications add column type text not null default 'info';
  end if;

  -- metadata
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='metadata'
  ) then
    alter table public.notifications add column metadata jsonb not null default '{}'::jsonb;
  end if;

  -- read_at
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='read_at'
  ) then
    alter table public.notifications add column read_at timestamptz;
  end if;

  -- created_at
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='created_at'
  ) then
    alter table public.notifications add column created_at timestamptz not null default now();
  end if;
end $$;

-- If legacy boolean column "read" exists, backfill read_at
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='notifications' and column_name='read'
  ) then
    update public.notifications
      set read_at = coalesce(read_at, now())
      where (read = true) and read_at is null;
    -- Optionally drop old column:
    -- alter table public.notifications drop column read;
  end if;
end $$;

-- Enforce type constraint (ignore if already exists)
do $$ begin
  begin
    alter table public.notifications
      add constraint notifications_type_check
      check (type in ('info','success','warning','error'));
  exception when duplicate_object then null; end;
end $$;

-- Enable RLS and (re)apply policies
alter table public.notifications enable row level security;

do $$ begin
  begin drop policy if exists notifications_select_own on public.notifications; exception when undefined_object then null; end;
  begin drop policy if exists notifications_insert_admin_or_self on public.notifications; exception when undefined_object then null; end;
  begin drop policy if exists notifications_update_owner on public.notifications; exception when undefined_object then null; end;
end $$;

create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

create policy notifications_insert_admin_or_self on public.notifications
  for insert with check (auth.uid() = user_id or public.is_admin());

create policy notifications_update_owner on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Indexes (safe to create)
create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where read_at is null;

commit;
