-- Create mission-photos bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'mission-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('mission-photos', 'mission-photos', false);
  END IF;
END $$;
