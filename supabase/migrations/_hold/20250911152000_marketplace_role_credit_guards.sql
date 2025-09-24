-- Marketplace guards: only convoyeurs with sufficient credits can make offers/messages,
-- creation of marketplace missions requires at least 1 credit,
-- and charge 5 credits automatically when a devis is accepted.

-- Helper: check minimal credits for a user
create or replace function public.has_min_credits(p_user uuid, p_min int)
returns boolean
language sql
stable
as $$
  select coalesce((select balance from public.credits_wallets where user_id = p_user), 0) >= coalesce(p_min, 0);
$$;

-- 1) FleetMarket missions: require at least 1 credit to create
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='fleetmarket_missions') then
    -- Replace insert policy to enforce credits >= 1
    begin
      drop policy if exists "fleetmarket: auth insert" on public.fleetmarket_missions;
    exception when undefined_object then null; end;

    create policy "fleetmarket: auth insert" on public.fleetmarket_missions
    for insert
    with check (
      created_by = auth.uid()
      and public.has_min_credits(auth.uid(), 1)
    );
  end if;
end$$;

-- Also apply same rule for legacy marketplace_missions if present
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='marketplace_missions') then
    begin
      drop policy if exists "Users can create marketplace missions" on public.marketplace_missions;
    exception when undefined_object then null; end;

    create policy "Users can create marketplace missions" on public.marketplace_missions
    for insert
    with check (
      auth.uid() = created_by
      and public.has_min_credits(auth.uid(), 1)
    );
  end if;
end$$;

-- 2) Only convoyeur confirmed can create devis AND must have >= 5 credits
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='marketplace_devis') then
    -- Remove previous insert policies if any, then create stricter one
    begin
      drop policy if exists "Verified convoyeurs can create devis" on public.marketplace_devis;
    exception when undefined_object then null; end;
    begin
      drop policy if exists "marketplace_devis_insert" on public.marketplace_devis;
    exception when undefined_object then null; end;

    create policy "Convoyeurs confirmes with credits can create devis" on public.marketplace_devis
    for insert
    with check (
      convoyeur_id = auth.uid()
      and (
        exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'convoyeur_confirme')
        or exists (select 1 from public.profiles p where p.user_id = auth.uid() and coalesce(p.is_convoyeur_confirme, false) = true)
      )
      and public.has_min_credits(auth.uid(), 5)
    );
  end if;
end$$;

-- 3) Charge 5 credits when a devis is accepted (idempotent)
create or replace function public.charge_credits_on_devis_accept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' and new.statut = 'accepte' and old.statut is distinct from 'accepte' then
    -- Avoid double charge
    if not exists (
      select 1 from public.credits_ledger l
      where l.user_id = new.convoyeur_id and l.ref_type = 'marketplace_devis' and l.ref_id = new.id and l.reason = 'devis_accept'
    ) then
      perform public.adjust_credits(new.convoyeur_id, -5, 'devis_accept', 'marketplace_devis', new.id);
    end if;
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='marketplace_devis') then
    begin
      drop trigger if exists trg_charge_on_devis_accept on public.marketplace_devis;
    exception when undefined_object then null; end;
    create trigger trg_charge_on_devis_accept
      after update on public.marketplace_devis
      for each row execute function public.charge_credits_on_devis_accept();
  end if;
end$$;

-- Fallback: if using mission_applications acceptance instead of devis, also charge on acceptance
create or replace function public.charge_credits_on_application_accept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted' then
    -- We need applicant_user_id column; if absent, skip
    -- Avoid double charge
    if not exists (
      select 1 from public.credits_ledger l
      where l.user_id = new.applicant_user_id and l.ref_type = 'mission_application' and l.ref_id = new.id and l.reason = 'application_accept'
    ) then
      perform public.adjust_credits(new.applicant_user_id, -5, 'application_accept', 'mission_application', new.id);
    end if;
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='mission_applications')
     and exists (select 1 from information_schema.columns where table_schema='public' and table_name='mission_applications' and column_name='applicant_user_id') then
    begin
      drop trigger if exists trg_charge_on_application_accept on public.mission_applications;
    exception when undefined_object then null; end;
    create trigger trg_charge_on_application_accept
      after update on public.mission_applications
      for each row execute function public.charge_credits_on_application_accept();
  end if;
end$$;

-- 4) Messaging guard: convoyeurs must have >=5 credits to send a message (does not deduct)
create or replace function public.guard_convoyeur_min_credits_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_convoyeur boolean;
begin
  -- Check only if sender is a convoyeur confirmé (role or profile flag)
  v_is_convoyeur := exists (select 1 from public.user_roles r where r.user_id = new.sender_id and r.role = 'convoyeur_confirme')
                    or exists (select 1 from public.profiles p where p.user_id = new.sender_id and coalesce(p.is_convoyeur_confirme, false) = true);
  if v_is_convoyeur then
    if not public.has_min_credits(new.sender_id, 5) then
      raise exception 'min_credits_required';
    end if;
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='messages') then
    begin
      drop trigger if exists tr_guard_convoyeur_min_credits_message on public.messages;
    exception when undefined_object then null; end;
    create trigger tr_guard_convoyeur_min_credits_message
      before insert on public.messages
      for each row execute function public.guard_convoyeur_min_credits_message();
  end if;
end$$;
