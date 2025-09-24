-- Auto-create profile on new auth user and backfill existing users

-- Function to insert into public.profiles when a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    display_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users after insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Backfill profiles for existing auth users without a profile
INSERT INTO public.profiles (user_id, email, full_name, display_name, created_at, updated_at)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'full_name', u.email),
       COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
       now(),
       now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;
