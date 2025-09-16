-- Add preferences column to profiles table for settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add indexes for better performance on profiles table  
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- Update the handle_new_user function to include email and full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, status, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    'active',
    '{}'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    updated_at = now();
  RETURN NEW;
END;
$$;