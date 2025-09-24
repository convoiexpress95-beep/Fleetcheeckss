-- Admin settings, maintenance flag, and credit topup RPC (admin-only)
create table if not exists public.admin_settings (
	key text primary key,
	value jsonb not null,
	updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_flags (
	id boolean primary key default true,
	enabled boolean not null default false,
	message text,
	updated_at timestamptz not null default now()
);

alter table public.admin_settings enable row level security;
alter table public.maintenance_flags enable row level security;

-- In Supabase, typical admin enforcement is via a service role; here we allow no direct access for anon/auth
do $$ begin
	if not exists (
		select 1 from pg_policies where schemaname='public' and tablename='admin_settings' and policyname='no_access_user'
	) then
		execute 'create policy no_access_user on public.admin_settings for all to authenticated using (false) with check (false)';
	end if;
end $$;

do $$ begin
	if not exists (
		select 1 from pg_policies where schemaname='public' and tablename='maintenance_flags' and policyname='no_access_user'
	) then
		execute 'create policy no_access_user on public.maintenance_flags for all to authenticated using (false) with check (false)';
	end if;
end $$;

-- Allow read access to all authenticated users (to display maintenance banner), writes via RPC only
do $$ begin
	if not exists (
		select 1 from pg_policies where schemaname='public' and tablename='maintenance_flags' and policyname='maintenance_select_all'
	) then
		execute 'create policy maintenance_select_all on public.maintenance_flags for select to authenticated using (true)';
	end if;
end $$;

-- Credit topup function (to be called with service role only)
create or replace function public.admin_topup_credits(p_user uuid, p_amount int, p_reason text default 'admin_topup')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	-- Only admins can execute (based on JWT claims)
	if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
		raise exception 'forbidden';
	end if;
	if p_amount <= 0 then
		raise exception 'invalid_amount';
	end if;
	perform public.adjust_credits(p_user, p_amount, coalesce(p_reason,'admin_topup'), 'admin', null);
end;
$$;

-- Allow authenticated execute, guarded by admin check above
revoke all on function public.admin_topup_credits(uuid,int,text) from public;
grant execute on function public.admin_topup_credits(uuid,int,text) to authenticated;

-- RPC to toggle maintenance (admin-only)
create or replace function public.set_maintenance(p_enabled boolean, p_message text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
		raise exception 'forbidden';
	end if;
	insert into public.maintenance_flags(id, enabled, message, updated_at)
	values (true, coalesce(p_enabled,false), p_message, now())
	on conflict (id) do update set enabled = excluded.enabled, message = excluded.message, updated_at = now();
end;
$$;

revoke all on function public.set_maintenance(boolean,text) from public;
grant execute on function public.set_maintenance(boolean,text) to authenticated;

-- Membership plans and extended roles
do $$ begin
	perform 1 from pg_type where typname = 'membership_plan';
	if not found then
		create type public.membership_plan as enum ('debutant','pro','expert','entreprise');
	end if;
end $$;

do $$ begin
	perform 1 from pg_type where typname = 'user_role';
	if not found then
		create type public.user_role as enum ('user','admin','moderator','debutant','pro','expert','entreprise','convoyeur_confirme');
	else
		-- extend enum safely
		begin
			alter type public.user_role add value if not exists 'debutant';
			alter type public.user_role add value if not exists 'pro';
			alter type public.user_role add value if not exists 'expert';
			alter type public.user_role add value if not exists 'entreprise';
			alter type public.user_role add value if not exists 'convoyeur_confirme';
		exception when duplicate_object then null; end;
	end if;
end $$;

create table if not exists public.user_memberships (
	user_id uuid primary key references auth.users(id) on delete cascade,
	plan public.membership_plan not null default 'debutant',
	started_at timestamptz not null default now(),
	expires_at timestamptz,
	updated_at timestamptz not null default now()
);

alter table public.user_memberships enable row level security;

do $$ begin
	if not exists (
		select 1 from pg_policies where schemaname='public' and tablename='user_memberships' and policyname='memberships_select_own'
	) then
		execute 'create policy memberships_select_own on public.user_memberships for select using (auth.uid() = user_id)';
	end if;
	if not exists (
		select 1 from pg_policies where schemaname='public' and tablename='user_memberships' and policyname='memberships_admin_all'
	) then
		execute 'create policy memberships_admin_all on public.user_memberships for all using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = ''admin'')) with check (true)';
	end if;
end $$;

-- RPC to set membership plan (admin only)
create or replace function public.admin_set_membership(p_user uuid, p_plan public.membership_plan, p_expires_at timestamptz default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
		raise exception 'forbidden';
	end if;
	insert into public.user_memberships(user_id, plan, started_at, expires_at, updated_at)
	values (p_user, p_plan, now(), p_expires_at, now())
	on conflict (user_id) do update set plan = excluded.plan, expires_at = excluded.expires_at, updated_at = now();
end;
$$;

revoke all on function public.admin_set_membership(uuid, public.membership_plan, timestamptz) from public;
grant execute on function public.admin_set_membership(uuid, public.membership_plan, timestamptz) to authenticated;

-- RPC to grant/revoke roles (admin only)
create or replace function public.admin_set_role(p_user uuid, p_role public.user_role, p_grant boolean default true)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
		raise exception 'forbidden';
	end if;
	if p_grant then
		insert into public.user_roles(user_id, role, assigned_at, assigned_by) values (p_user, p_role, now(), auth.uid())
		on conflict (user_id, role) do nothing;
	else
		delete from public.user_roles where user_id = p_user and role = p_role;
	end if;
end;
$$;

revoke all on function public.admin_set_role(uuid, public.user_role, boolean) from public;
grant execute on function public.admin_set_role(uuid, public.user_role, boolean) to authenticated;

-- Badge vérifié pour convoyeur confirmé: indicateur dans profiles
alter table if exists public.profiles add column if not exists is_convoyeur_confirme boolean default false;
alter table if exists public.profiles add column if not exists verified_badges text[] default '{}';

-- RPC pour marquer un utilisateur comme convoyeur confirmé (admin)
create or replace function public.admin_mark_convoyeur_confirme(p_user uuid, p_confirmed boolean default true)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
		raise exception 'forbidden';
	end if;
	update public.profiles set is_convoyeur_confirme = p_confirmed,
		verified_badges = case when p_confirmed then array(select distinct unnest(coalesce(verified_badges,'{}'::text[])) union select 'convoyeur_verifie') else array_remove(coalesce(verified_badges,'{}'::text[]), 'convoyeur_verifie') end,
		updated_at = now()
	where user_id = p_user;
	if p_confirmed then
		insert into public.user_roles(user_id, role, assigned_at, assigned_by) values (p_user, 'convoyeur_confirme', now(), auth.uid())
		on conflict (user_id, role) do nothing;
	else
		delete from public.user_roles where user_id = p_user and role = 'convoyeur_confirme';
	end if;
end;
$$;

revoke all on function public.admin_mark_convoyeur_confirme(uuid, boolean) from public;
grant execute on function public.admin_mark_convoyeur_confirme(uuid, boolean) to authenticated;

