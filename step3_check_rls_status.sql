-- ÉTAPE 3: Vérifier si RLS est activé sur la table profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';