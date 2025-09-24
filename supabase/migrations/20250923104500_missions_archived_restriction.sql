-- Enforce that only 'archived' can be updated by driver/donor (non-creator)
-- 1) Allow driver/donor to UPDATE via RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='missions' AND policyname='missions_update_driver_donor'
  ) THEN
    CREATE POLICY missions_update_driver_donor ON public.missions
    FOR UPDATE TO authenticated
    USING (auth.uid() = COALESCE(driver_id, '00000000-0000-0000-0000-000000000000'::uuid)
        OR auth.uid() = COALESCE(donor_id, '00000000-0000-0000-0000-000000000000'::uuid))
    WITH CHECK (auth.uid() = COALESCE(driver_id, '00000000-0000-0000-0000-000000000000'::uuid)
        OR auth.uid() = COALESCE(donor_id, '00000000-0000-0000-0000-000000000000'::uuid));
  END IF;
END $$;

-- 2) Create trigger to restrict column changes to 'archived' only for driver/donor (creator remains unrestricted)
CREATE OR REPLACE FUNCTION public.enforce_missions_archived_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If no auth context, do nothing (e.g., service role)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Creator can update anything
  IF auth.uid() = OLD.created_by THEN
    RETURN NEW;
  END IF;

  -- If updater is driver or donor, enforce only 'archived' may change (updated_at may also change by trigger)
  IF auth.uid() = COALESCE(OLD.driver_id, '00000000-0000-0000-0000-000000000000'::uuid)
     OR auth.uid() = COALESCE(OLD.donor_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN

    IF ( to_jsonb(NEW) - 'updated_at' - 'archived' ) IS DISTINCT FROM ( to_jsonb(OLD) - 'updated_at' - 'archived' ) THEN
      RAISE EXCEPTION 'Only the archived field can be updated by driver/donor' USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_missions_archived_only ON public.missions;
CREATE TRIGGER trg_missions_archived_only
BEFORE UPDATE ON public.missions
FOR EACH ROW EXECUTE FUNCTION public.enforce_missions_archived_only();
