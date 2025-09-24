-- RLS policy: allow restricted update of missions.archived
-- Creator can update any field (existing policy). For non-creator actors (driver/donor), restrict to archived only.

-- Ensure RLS enabled
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Policy to allow driver/donor to update only archived flag
CREATE POLICY missions_update_archived_roles ON public.missions
FOR UPDATE TO authenticated
USING (
  auth.uid() = COALESCE(driver_id, '00000000-0000-0000-0000-000000000000'::uuid)
  OR auth.uid() = COALESCE(donor_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
WITH CHECK (
  -- archived can change; all other columns must remain equal
  (ROW(id, reference, title, description, pickup_address, delivery_address, pickup_date, delivery_date, pickup_contact_name, pickup_contact_phone, pickup_contact_email,
       delivery_contact_name, delivery_contact_phone, delivery_contact_email, vehicle_type, vehicle_brand, vehicle_model, vehicle_model_name, vehicle_body_type,
       vehicle_model_id, vehicle_image_path, license_plate, donor_earning, driver_earning, status, status_original, created_by, donor_id, driver_id, requirement_convoyeur,
       requirement_transporteur_plateau, created_at, updated_at)
   =
   ROW(OLD.id, OLD.reference, OLD.title, OLD.description, OLD.pickup_address, OLD.delivery_address, OLD.pickup_date, OLD.delivery_date, OLD.pickup_contact_name, OLD.pickup_contact_phone, OLD.pickup_contact_email,
       OLD.delivery_contact_name, OLD.delivery_contact_phone, OLD.delivery_contact_email, OLD.vehicle_type, OLD.vehicle_brand, OLD.vehicle_model, OLD.vehicle_model_name, OLD.vehicle_body_type,
       OLD.vehicle_model_id, OLD.vehicle_image_path, OLD.license_plate, OLD.donor_earning, OLD.driver_earning, OLD.status, OLD.status_original, OLD.created_by, OLD.donor_id, OLD.driver_id, OLD.requirement_convoyeur,
       OLD.requirement_transporteur_plateau, OLD.created_at, OLD.updated_at)
  )
);

-- Ensure updated_at trigger exists (should already be from base schema). Recreate idempotently.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS missions_updated_at ON public.missions;
CREATE TRIGGER missions_updated_at BEFORE UPDATE ON public.missions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
