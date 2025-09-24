-- Sync departure_time <-> (date,time) for public.rides to avoid NOT NULL insert issues across mixed schemas
-- Idempotent: guard trigger creation; function is CREATE OR REPLACE.

create or replace function public.rides_sync_datetime()
returns trigger
language plpgsql
as $$
begin
  -- If departure_time is null but (date,time) provided, derive it
  if new.departure_time is null then
    if new.date is not null then
      new.departure_time := (new.date::timestamp + coalesce(new.time, '00:00'::time)) at time zone 'UTC';
    end if;
  end if;

  -- If (date or time) is null but departure_time provided, derive both
  if new.departure_time is not null then
    if new.date is null then
      new.date := (new.departure_time at time zone 'UTC')::date;
    end if;
    if new.time is null then
      new.time := (new.departure_time at time zone 'UTC')::time;
    end if;
  end if;

  return new;
end;
$$;

-- Create trigger only if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'tg_rides_sync_datetime'
  ) THEN
    EXECUTE $trg$
      create trigger tg_rides_sync_datetime
      before insert or update on public.rides
      for each row execute function public.rides_sync_datetime()
    $trg$;
  END IF;
END$$;
