-- Script de diagnostic pour vérifier l'état de la base de données
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Vérifier si la fonction upsert_profile existe
SELECT 
    routine_name, 
    routine_type, 
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'upsert_profile' 
AND routine_schema = 'public';

-- 2. Lister toutes les politiques RLS sur la table profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Vérifier si RLS est activé sur profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Vérifier la structure de la table profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier les contraintes sur la table profiles
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public';

-- 6. Test basique de lecture sur profiles (pour vérifier les permissions)
SELECT COUNT(*) as profile_count FROM public.profiles;