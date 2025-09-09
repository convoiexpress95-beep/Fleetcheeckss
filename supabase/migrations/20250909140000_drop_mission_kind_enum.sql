-- Migration: drop mission_kind enum and related column if safe
-- WARNING: Ensure no code depends on missions.kind before applying.

ALTER TABLE public.missions DROP COLUMN IF EXISTS kind;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_kind') THEN
    DROP TYPE public.mission_kind;
  END IF;
END $$;
