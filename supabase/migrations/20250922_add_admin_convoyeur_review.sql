-- Migration: Admin review for convoyeur applications + storage admin read
begin;

-- 1) Storage: allow admins to read any documents in 'documents' bucket
do $$ begin
  begin
    create policy "documents: admin read" on storage.objects for select
      using (bucket_id = 'documents' and public.is_admin());
  exception when duplicate_object then null; end;
end $$;

-- 2) RPC: admin_review_convoyeur_application
create or replace function public.admin_review_convoyeur_application(
  _application_id uuid,
  _approve boolean,
  _notes text default null
) returns void
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_app record;
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
    -- mark profile as confirmed convoyeur via existing admin RPC
    perform public.admin_mark_convoyeur_confirme(p_user := v_app.user_id, p_confirmed := true);
  end if;
end $$;

grant execute on function public.admin_review_convoyeur_application(uuid, boolean, text) to authenticated;

commit;
