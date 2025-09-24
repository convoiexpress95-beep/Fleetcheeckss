-- Création vue missions_simplified + fonction RPC upsert_profile
begin;

-- Vue simplifiée pour mapping statut UI
create or replace view public.missions_simplified as
select 
  m.id,
  m.reference,
  m.title,
  m.description,
  m.pickup_address,
  m.delivery_address,
  m.pickup_date,
  m.delivery_date,
  m.status as raw_status,
  case 
    when m.status in ('draft','published','assigned') then 'pending'
    when m.status in ('picked_up','in_transit','delivered') then 'in_progress'
    when m.status = 'completed' then 'completed'
    when m.status = 'cancelled' then 'cancelled'
  end as ui_status,
  m.driver_id,
  m.created_by,
  m.donor_id,
  m.created_at,
  m.updated_at
from public.missions m;

-- Droits de lecture (si besoin explicite)
grant select on public.missions_simplified to anon, authenticated;

-- Fonction RPC d'upsert profil (gère conflit user_id)
create or replace function public.upsert_profile(_user_id uuid, _email text, _full_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (_user_id, _email, coalesce(_full_name, _email))
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();
end;
$$;

commit;
