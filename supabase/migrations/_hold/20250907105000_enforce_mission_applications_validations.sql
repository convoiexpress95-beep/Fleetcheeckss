-- Validation des candidatures (devis) : prix et message obligatoires, prix >= 50
create or replace function public.validate_mission_application() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    if (new.price_offer is null or new.price_offer < 50) then
      raise exception 'Le prix proposé est obligatoire et doit être supérieur ou égal à 50€';
    end if;
    if (new.message is null or length(btrim(new.message)) = 0) then
      raise exception 'Le message est obligatoire pour un devis';
    end if;
  elsif (tg_op = 'UPDATE') then
    -- Valider uniquement si l''on modifie message/prix
    if (new.price_offer is distinct from old.price_offer) then
      if (new.price_offer is null or new.price_offer < 50) then
        raise exception 'Le prix proposé est obligatoire et doit être supérieur ou égal à 50€';
      end if;
    end if;
    if (new.message is distinct from old.message) then
      if (new.message is null or length(btrim(new.message)) = 0) then
        raise exception 'Le message est obligatoire pour un devis';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_validate_mission_application on public.mission_applications;
create trigger trg_validate_mission_application
before insert or update on public.mission_applications
for each row execute function public.validate_mission_application();
