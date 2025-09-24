-- Script de test pour vérifier les missions dans la base de données
-- À exécuter dans le dashboard Supabase SQL Editor

-- 1. Vérifier si la table missions existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'missions';

-- 2. Voir la structure de la table missions
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'missions'
ORDER BY ordinal_position;

-- 3. Compter le nombre total de missions
SELECT COUNT(*) as total_missions FROM public.missions;

-- 4. Voir les dernières missions créées
SELECT id, title, reference, created_by, created_at 
FROM public.missions 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Vérifier les politiques RLS sur la table missions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'missions';

-- 6. Vérifier si RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'missions';