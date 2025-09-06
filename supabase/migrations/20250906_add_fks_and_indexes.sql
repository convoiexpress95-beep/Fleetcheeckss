-- Add missing foreign keys and helpful indexes across core tables

-- Helper to add a FK if it doesn't exist
-- Pattern: check information_schema.table_constraints

-- notifications.user_id -> auth.users(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'notifications'
      and constraint_name = 'notifications_user_id_fkey'
  ) then
    alter table public.notifications
      add constraint notifications_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_notifications_user on public.notifications (user_id);

-- reports.user_id -> auth.users(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'reports'
      and constraint_name = 'reports_user_id_fkey'
  ) then
    alter table public.reports
      add constraint reports_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_reports_user on public.reports (user_id);

-- subscriptions.user_id -> auth.users(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'subscriptions'
      and constraint_name = 'subscriptions_user_id_fkey'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_subscriptions_user on public.subscriptions (user_id);

-- mission_tracking.mission_id -> public.missions(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'mission_tracking'
      and constraint_name = 'mission_tracking_mission_id_fkey'
  ) then
    alter table public.mission_tracking
      add constraint mission_tracking_mission_id_fkey
      foreign key (mission_id) references public.missions(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_mission_tracking_mission on public.mission_tracking (mission_id);

-- mission_tracking.driver_id -> auth.users(id) (nullable)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'mission_tracking'
      and constraint_name = 'mission_tracking_driver_id_fkey'
  ) then
    alter table public.mission_tracking
      add constraint mission_tracking_driver_id_fkey
      foreign key (driver_id) references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_mission_tracking_driver on public.mission_tracking (driver_id);

-- tracking_links.mission_id -> public.missions(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'tracking_links'
      and constraint_name = 'tracking_links_mission_id_fkey'
  ) then
    alter table public.tracking_links
      add constraint tracking_links_mission_id_fkey
      foreign key (mission_id) references public.missions(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_tracking_links_mission on public.tracking_links (mission_id);

-- credit_transactions.user_id -> auth.users(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'credit_transactions'
      and constraint_name = 'credit_transactions_user_id_fkey'
  ) then
    alter table public.credit_transactions
      add constraint credit_transactions_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_credit_transactions_user on public.credit_transactions (user_id);

-- credit_transactions.mission_id -> public.missions(id)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'credit_transactions'
      and constraint_name = 'credit_transactions_mission_id_fkey'
  ) then
    alter table public.credit_transactions
      add constraint credit_transactions_mission_id_fkey
      foreign key (mission_id) references public.missions(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_credit_transactions_mission on public.credit_transactions (mission_id);
