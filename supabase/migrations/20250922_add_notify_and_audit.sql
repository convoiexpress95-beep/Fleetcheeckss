-- Migration: Notifications RPC + Admin activity log + enhance admin review to notify and log
begin;

-- 1) Admin activity log table
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  entity text not null,
  entity_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.admin_activity_log enable row level security;

do $$ begin
  begin
    drop policy if exists admin_activity_select_admin on public.admin_activity_log;
  exception when undefined_object then null; end;
  begin
    create policy admin_activity_select_admin on public.admin_activity_log
      for select using (public.is_admin());
  exception when duplicate_object then null; end;
  begin
    drop policy if exists admin_activity_write_admin on public.admin_activity_log;
  exception when undefined_object then null; end;
  begin
    create policy admin_activity_write_admin on public.admin_activity_log
      for all using (public.is_admin()) with check (public.is_admin());
  exception when duplicate_object then null; end;
end $$;

-- 2) RPC notify_user: allow admins to create notifications for any user
create or replace function public.notify_user(
  p_user uuid,
  p_title text,
  p_message text,
  p_type text default 'info'
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  insert into public.notifications(user_id, title, message, type)
  values (p_user, p_title, p_message, coalesce(p_type, 'info'));
end $$;

grant execute on function public.notify_user(uuid, text, text, text) to authenticated;

-- 3) Update admin_review_convoyeur_application to log + notify
create or replace function public.admin_review_convoyeur_application(
  _application_id uuid,
  _approve boolean,
  _notes text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_app record;
  v_status text;
  v_title text;
  v_message text;
  v_ntype text;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select * into v_app from public.convoyeur_applications where id = _application_id;
  if not found then
    raise exception 'Application not found';
  end if;

  update public.convoyeur_applications
    set status = case when _approve then 'approved' else 'rejected' end,
        admin_notes = coalesce(_notes, admin_notes),
        reviewed_at = now(),
        reviewed_by = v_user,
        updated_at = now()
  where id = _application_id;

  if _approve then
    perform public.admin_mark_convoyeur_confirme(p_user := v_app.user_id, p_confirmed := true);
    v_status := 'convoyeur_approve';
    v_title := 'Candidature approuvée';
    v_message := 'Votre candidature convoyeur a été approuvée. Votre profil est désormais confirmé.';
    v_ntype := 'success';
  else
    v_status := 'convoyeur_reject';
    v_title := 'Candidature refusée';
    v_message := 'Votre candidature convoyeur a été refusée.' || case when coalesce(_notes,'') <> '' then ' Motif: '||_notes else '' end;
    v_ntype := 'warning';
  end if;

  insert into public.admin_activity_log(admin_id, action, entity, entity_id, notes)
  values (v_user, v_status, 'convoyeur_applications', _application_id, _notes);

  perform public.notify_user(v_app.user_id, v_title, v_message, v_ntype);
end $$;

grant execute on function public.admin_review_convoyeur_application(uuid, boolean, text) to authenticated;

commit;
