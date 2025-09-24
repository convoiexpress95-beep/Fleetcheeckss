-- Protection refund_done: empêcher modification directe par conducteur/passager
-- Horodatage: 2025-09-14 16:12:00
-- Principe: trigger BEFORE UPDATE qui bloque toute tentative de changer refund_done
-- sauf si la fonction s'exécute sous un rôle doté de la variable claim 'role' = 'service_role'
-- (Adapter selon votre mécanique de JWT claims; sinon utiliser current_setting ou la connexion dédiée.)

begin;

create or replace function public.trajet_join_requests_guard_refund() returns trigger as $$
declare
  v_is_service boolean := false;
begin
  -- Exemple: si vous encodez un claim custom 'role' dans le JWT
  begin
    v_is_service := (auth.jwt() ->> 'role') = 'service_role';
  exception when others then
    v_is_service := false;
  end;

  if TG_OP = 'UPDATE' then
    if NEW.refund_done is distinct from OLD.refund_done and not v_is_service then
      raise exception 'REFUND_FLAG_IMMUTABLE';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_trajet_join_requests_guard_refund on public.trajet_join_requests;
create trigger trg_trajet_join_requests_guard_refund
  before update on public.trajet_join_requests
  for each row execute function public.trajet_join_requests_guard_refund();

commit;
