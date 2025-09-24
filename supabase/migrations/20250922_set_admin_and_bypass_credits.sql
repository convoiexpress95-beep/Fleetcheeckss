-- Grant admin to a specific user by email and allow admins to bypass credit consumption
-- Date: 2025-09-22

-- 1) Set app_role='admin' for the target email (ensure profile exists)
DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'mahdi.benamor1994@gmail.com' LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE NOTICE 'User with email not found: %', 'mahdi.benamor1994@gmail.com';
  ELSE
    INSERT INTO public.profiles (user_id, email, full_name, app_role, created_at, updated_at)
    VALUES (v_uid, 'mahdi.benamor1994@gmail.com', 'Admin', 'admin', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      app_role = 'admin',
      email = EXCLUDED.email,
      updated_at = now();

    -- Optional: also record in user_roles table (if exists) for visibility
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'user_roles'
    ) THEN
      INSERT INTO public.user_roles(user_id, role)
      VALUES (v_uid, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
END$$;

-- 2) Global admin bypass in consume_credit RPC
-- If the target user has app_role = 'admin', do not decrement credits and return true
CREATE OR REPLACE FUNCTION public.consume_credit(
  _user_id uuid,
  _mission_id uuid,
  _credits int,
  _type text,
  _description text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_balance int;
BEGIN
  -- Admins are exempt from credit consumption
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id AND p.app_role = 'admin'
  ) INTO v_is_admin;
  IF v_is_admin THEN
    RETURN true;
  END IF;

  -- Ensure wallet only if helper function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'ensure_wallet' AND n.nspname = 'public'
  ) THEN
    PERFORM public.ensure_wallet(_user_id);
  END IF;
  SELECT balance INTO v_balance FROM public.credits_wallets WHERE user_id = _user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < _credits THEN
    RETURN false;
  END IF;
  UPDATE public.credits_wallets SET balance = balance - _credits, updated_at = now() WHERE user_id = _user_id;
  INSERT INTO public.credits_ledger(user_id, amount, reason, ref_type, ref_id)
    VALUES (_user_id, -_credits, coalesce(_description, _type), 'mission', coalesce(_mission_id::text, ''));
  RETURN true;
END;
$$;

-- 3) Bypass credit consumption for admins on fleetmarket mission publish
CREATE OR REPLACE FUNCTION public.fleetmarket_consume_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Délègue la logique de bypass admin à consume_credit (retourne true pour admins)
  IF public.consume_credit(NEW.created_by, NULL, 1, 'fleetmarket_publish', 'Publication mission marketplace') THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;
END;
$$;
