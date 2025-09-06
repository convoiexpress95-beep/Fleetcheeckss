-- Notifications automatiques pour le marketplace et la messagerie
-- 1) Nouveau devis: notifie le propriétaire de la mission
create or replace function public.fn_notify_new_devis()
returns trigger
language plpgsql
security definer
as $$
declare
  v_owner uuid;
  v_title text;
begin
  select created_by, titre into v_owner, v_title from public.marketplace_missions where id = new.mission_id;
  if v_owner is not null then
    insert into public.notifications(user_id, title, message, type, read)
    values (v_owner, 'Nouveau devis reçu', coalesce(v_title,'Mission') || ' • ' || new.prix_propose || ' €', 'marketplace_quote', false);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_devis on public.marketplace_devis;
create trigger trg_notify_new_devis
after insert on public.marketplace_devis
for each row execute function public.fn_notify_new_devis();

-- 2) Devis accepté/refusé: notifie le convoyeur
create or replace function public.fn_notify_devis_status()
returns trigger
language plpgsql
security definer
as $$
declare
  v_status text;
  v_title text;
begin
  if new.statut is distinct from old.statut then
    v_status := coalesce(new.statut::text, '');
    if v_status in ('accepte','refuse') then
      select titre into v_title from public.marketplace_missions where id = new.mission_id;
      insert into public.notifications(user_id, title, message, type, read)
      values (
        new.convoyeur_id,
        case when v_status='accepte' then 'Devis accepté' else 'Devis refusé' end,
        coalesce(v_title,'Mission'),
        'marketplace_quote',
        false
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_devis_status on public.marketplace_devis;
create trigger trg_notify_devis_status
after update on public.marketplace_devis
for each row execute function public.fn_notify_devis_status();

-- 3) Nouveau message: notifie le destinataire
create or replace function public.fn_notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  v_owner uuid;
  v_conv uuid;
  v_title text;
  v_recipient uuid;
begin
  select owner_id, convoyeur_id, (select titre from public.marketplace_missions m where m.id = c.mission_id)
    into v_owner, v_conv, v_title
  from public.conversations c where c.id = new.conversation_id;

  if v_owner is null or v_conv is null then
    return new;
  end if;

  if new.sender_id = v_owner then v_recipient := v_conv; else v_recipient := v_owner; end if;

  if v_recipient is not null and v_recipient <> new.sender_id then
    insert into public.notifications(user_id, title, message, type, read)
    values (v_recipient, 'Nouveau message', coalesce(v_title,'Conversation') || ' • ' || left(new.content, 80), 'marketplace_message', false);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
after insert on public.messages
for each row execute function public.fn_notify_new_message();

-- 4) Mission attribuée: notifie les deux parties (optionnel)
create or replace function public.fn_notify_mission_assigned()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.statut = 'attribuee' and (old.statut is distinct from new.statut) then
    insert into public.notifications(user_id, title, message, type, read)
    values
      (new.created_by, 'Mission attribuée', coalesce(new.titre,'Mission') || ' assignée.', 'marketplace_mission', false),
      (coalesce(new.convoyeur_id, new.created_by), 'Mission attribuée', coalesce(new.titre,'Mission') || ' vous a été attribuée.', 'marketplace_mission', false);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_mission_assigned on public.marketplace_missions;
create trigger trg_notify_mission_assigned
after update on public.marketplace_missions
for each row execute function public.fn_notify_mission_assigned();
