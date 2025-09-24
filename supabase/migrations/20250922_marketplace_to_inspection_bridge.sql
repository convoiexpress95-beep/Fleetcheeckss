-- Bridge marketplace missions to inspection missions
-- Date: 2025-09-22

begin;

-- 1) Add link column to missions to reference the source marketplace mission
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema='public' and table_name='missions'
  ) then
    begin
      alter table public.missions
        add column if not exists marketplace_mission_id uuid
          references public.fleetmarket_missions(id) on delete set null;
    exception when undefined_table then null; end;
    -- Unique link to avoid duplicates
    begin
      create unique index if not exists missions_marketplace_mission_id_uniq 
        on public.missions(marketplace_mission_id) 
        where marketplace_mission_id is not null;
    exception when undefined_table then null; end;
  end if;
end$$;

-- 2) Function to ensure an inspection mission exists for a given marketplace mission
create or replace function public.ensure_inspection_mission_for_marketplace(p_marketplace_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists uuid;
  v_m record;
  v_ref text;
begin
  -- Fetch marketplace mission
  select * into v_m from public.fleetmarket_missions where id = p_marketplace_id;
  if not found then
    raise exception 'Marketplace mission % not found', p_marketplace_id;
  end if;

  -- Already bridged?
  select id into v_exists from public.missions where marketplace_mission_id = p_marketplace_id;
  if v_exists is not null then
    -- Keep driver in sync if assigned later
    if v_m.convoyeur_id is not null then
      update public.missions
        set driver_id = coalesce(v_m.convoyeur_id, driver_id),
            updated_at = now()
      where id = v_exists;
    end if;
    return v_exists;
  end if;

  -- Generate a reference stable and unique based on marketplace id
  v_ref := 'MK-' || replace(left(p_marketplace_id::text, 8), '-', '');

  -- Insert a minimal but valid mission row (fill required fields)
  insert into public.missions (
    reference,
    title,
    description,
    pickup_address,
    delivery_address,
    pickup_date,
    delivery_date,
    pickup_contact_name,
    pickup_contact_phone,
    delivery_contact_name,
    delivery_contact_phone,
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    vehicle_model_name,
    vehicle_body_type,
    vehicle_model_id,
    vehicle_image_path,
    license_plate,
    donor_earning,
    driver_earning,
    status,
    status_original,
    created_by,
    donor_id,
    driver_id,
    requirement_convoyeur,
    requirement_transporteur_plateau,
    marketplace_mission_id
  ) values (
    v_ref,
    coalesce(v_m.titre, 'Mission Marketplace'),
    v_m.description,
    coalesce(v_m.ville_depart, 'Adresse départ inconnue'),
    coalesce(v_m.ville_arrivee, 'Adresse arrivée inconnue'),
    v_m.date_depart,
    null,
    null,
    null,
    null,
    null,
    v_m.vehicule_requis,
    null,
    null,
    null,
    null,
    null,
    null,
    'N/A', -- license_plate required by schema; placeholder until inspection sets it
    null,
    null,
    'pending',
    v_m.statut,
    v_m.created_by,
    v_m.created_by,
    v_m.convoyeur_id,
    (v_m.vehicule_requis is not null),
    false,
    v_m.id
  ) returning id into v_exists;

  return v_exists;
end;
$$;

-- 3) Trigger: when a marketplace mission gets assigned or marked attribuee, ensure inspection mission exists/updated
create or replace function public._bridge_marketplace_to_inspection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create or sync when convoyeur is set or statut becomes attribuee
  if (new.convoyeur_id is not null and (old.convoyeur_id is distinct from new.convoyeur_id))
     or (new.statut = 'attribuee' and (old.statut is distinct from new.statut)) then
    perform public.ensure_inspection_mission_for_marketplace(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bridge_marketplace_to_inspection on public.fleetmarket_missions;
create trigger trg_bridge_marketplace_to_inspection
after update on public.fleetmarket_missions
for each row execute function public._bridge_marketplace_to_inspection();

-- 4) Trigger on devis acceptance: set mission assigned (convoyeur) then bridge
-- Define the function unconditionally (safe even if marketplace_devis table is absent)
create or replace function public._on_marketplace_devis_accept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE') and old.status is distinct from new.status and new.status = 'accepted' then
    -- Assign convoyeur on the mission if not already
    update public.fleetmarket_missions m
      set convoyeur_id = coalesce(m.convoyeur_id, new.convoyeur_id),
          statut = 'attribuee',
          updated_at = now()
    where m.id = new.mission_id;
    -- Ensure bridge
    perform public.ensure_inspection_mission_for_marketplace(new.mission_id);
  end if;
  return new;
end;
$$;

-- Create the trigger only if marketplace_devis table exists
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema='public' and table_name='marketplace_devis'
  ) then
    drop trigger if exists trg_marketplace_devis_accept on public.marketplace_devis;
    create trigger trg_marketplace_devis_accept
    after update on public.marketplace_devis
    for each row execute function public._on_marketplace_devis_accept();
  end if;
end$$;

commit;
