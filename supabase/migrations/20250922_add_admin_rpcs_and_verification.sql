-- Admin RPCs and verification documents setup
-- Date: 2025-09-22

-- Ensure pgcrypto for gen_random_uuid()
DO $$ BEGIN
  PERFORM 1 FROM pg_extension WHERE extname = 'pgcrypto';
  IF NOT FOUND THEN
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  END IF;
END $$;

-- Helper guard (ensure present)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  select exists (
    select 1
    from profiles p
    where p.user_id = auth.uid() and p.app_role = 'admin'
  );
$$;

-- Verification documents table
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  upload_date timestamptz NOT NULL DEFAULT now()
);

-- FK to profiles.user_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public' AND table_name = 'verification_documents' AND constraint_name = 'verification_documents_user_id_fkey'
  ) THEN
    ALTER TABLE public.verification_documents
      ADD CONSTRAINT verification_documents_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Policies: owner or admin
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='verification_documents' AND policyname='verification_documents_select_owner_or_admin'
  ) THEN
    CREATE POLICY verification_documents_select_owner_or_admin
      ON public.verification_documents
      FOR SELECT
      USING (user_id = auth.uid() OR public.is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='verification_documents' AND policyname='verification_documents_insert_owner_or_admin'
  ) THEN
    CREATE POLICY verification_documents_insert_owner_or_admin
      ON public.verification_documents
      FOR INSERT
      WITH CHECK (user_id = auth.uid() OR public.is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='verification_documents' AND policyname='verification_documents_update_owner_or_admin'
  ) THEN
    CREATE POLICY verification_documents_update_owner_or_admin
      ON public.verification_documents
      FOR UPDATE
      USING (user_id = auth.uid() OR public.is_admin())
      WITH CHECK (user_id = auth.uid() OR public.is_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='verification_documents' AND policyname='verification_documents_delete_owner_or_admin'
  ) THEN
    CREATE POLICY verification_documents_delete_owner_or_admin
      ON public.verification_documents
      FOR DELETE
      USING (user_id = auth.uid() OR public.is_admin());
  END IF;
END $$;

-- Storage bucket for verification files
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification', 'verification', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification bucket
DO $$ BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='verification_select'
  ) THEN
    CREATE POLICY "verification_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'verification' AND (owner = auth.uid() OR public.is_admin()));
  END IF;
  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='verification_insert'
  ) THEN
    CREATE POLICY "verification_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'verification' AND owner = auth.uid());
  END IF;
  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='verification_update'
  ) THEN
    CREATE POLICY "verification_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'verification' AND (owner = auth.uid() OR public.is_admin()))
    WITH CHECK (bucket_id = 'verification' AND (owner = auth.uid() OR public.is_admin()));
  END IF;
  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='verification_delete'
  ) THEN
    CREATE POLICY "verification_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'verification' AND (owner = auth.uid() OR public.is_admin()));
  END IF;
END $$;

-- Admin RPCs
CREATE OR REPLACE FUNCTION public.admin_set_membership(
  p_user uuid,
  p_plan text,
  p_expires_at timestamptz DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  UPDATE public.subscriptions
  SET plan_type = p_plan,
      status = 'active',
      updated_at = now()
  WHERE user_id = p_user;

  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, plan_type, status, created_at, updated_at)
    VALUES (p_user, p_plan, 'active', now(), now());
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_role(
  p_user uuid,
  p_role text,
  p_grant boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target public.app_role;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  -- Validate/resolve target role
  IF p_grant THEN
    IF p_role NOT IN ('admin','donneur_d_ordre','convoyeur') THEN
      RAISE EXCEPTION 'INVALID_ROLE %', p_role;
    END IF;
    v_target = p_role::public.app_role;
  ELSE
    -- Revert to default non-admin role when removing
    v_target = 'convoyeur'::public.app_role;
  END IF;

  UPDATE public.profiles SET app_role = v_target WHERE user_id = p_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_convoyeur_confirme(
  p_user uuid,
  p_confirmed boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET is_convoyeur_confirme = p_confirmed
  WHERE user_id = p_user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_membership(uuid, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_convoyeur_confirme(uuid, boolean) TO authenticated;
