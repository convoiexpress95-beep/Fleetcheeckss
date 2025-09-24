-- Migration: Notifications table + RLS + helper RPCs
begin;

-- 1) Table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','success','warning','error')),
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- 2) RLS policies (deterministic: drop then create)
do $$ begin
  begin
    drop policy if exists notifications_select_own on public.notifications;
  exception when undefined_object then null; end;
  begin
    drop policy if exists notifications_insert_admin_or_self on public.notifications;
  exception when undefined_object then null; end;
  begin
    drop policy if exists notifications_update_owner on public.notifications;
  exception when undefined_object then null; end;
end $$;

create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

create policy notifications_insert_admin_or_self on public.notifications
  for insert with check (auth.uid() = user_id or public.is_admin());

create policy notifications_update_owner on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) Indexes
create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where read_at is null;

-- 4) Helper RPCs to mark notifications as read
create or replace function public.mark_notification_read(_id uuid)
returns void
language sql
set search_path = public
as $$
  update public.notifications set read_at = now() where id = _id and user_id = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language sql
set search_path = public
as $$
  with upd as (
    update public.notifications set read_at = now()
    where user_id = auth.uid() and read_at is null
    returning 1
  )
  select count(*)::int from upd;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

commit;
