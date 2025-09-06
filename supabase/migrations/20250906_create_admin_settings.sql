-- Create admin_settings table with admin-only RLS
-- Singleton row pattern (id = 1)

-- Provide a lightweight is_admin() function (idempotent)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $fn$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$fn$;

create table if not exists public.admin_settings (
  id integer primary key check (id = 1),
  -- Security
  session_duration integer not null default 60,
  max_login_attempts integer not null default 5,
  two_factor_auth boolean not null default false,
  -- Notifications
  notifications_enabled boolean not null default true,
  email_notifications boolean not null default true,
  sms_notifications boolean not null default false,
  -- Email config
  smtp_server text,
  smtp_port integer not null default 587,
  sender_email text default 'noreply@fleetcheck.app',
  -- Maintenance
  maintenance_enabled boolean not null default false,
  maintenance_message text,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure exactly one row exists
insert into public.admin_settings (id)
values (1)
on conflict (id) do nothing;

-- RLS: admin only
alter table public.admin_settings enable row level security;

drop policy if exists admin_settings_select on public.admin_settings;
drop policy if exists admin_settings_modify on public.admin_settings;

create policy admin_settings_select
  on public.admin_settings for select
  using (public.is_admin());

create policy admin_settings_modify
  on public.admin_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admin_settings_updated_at on public.admin_settings;
create trigger trg_admin_settings_updated_at
before update on public.admin_settings
for each row execute function public.set_updated_at();
