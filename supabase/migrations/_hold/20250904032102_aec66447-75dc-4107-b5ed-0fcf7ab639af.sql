-- Add preferences column to profiles table for settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add indexes for better performance on profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- Ensure profiles table has proper RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create or update the profiles table structure if needed
DO $$ 
BEGIN
    -- Check if the full_name column exists and add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Check if the email column exists and add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Check if the status column exists and add it if it doesn't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Update the trigger function to populate email from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    'active'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    updated_at = now();
  RETURN NEW;
END;
$$;