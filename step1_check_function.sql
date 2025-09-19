-- ÉTAPE 1: Vérifier si la fonction upsert_profile existe
SELECT 
    routine_name, 
    routine_type, 
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'upsert_profile' 
AND routine_schema = 'public';