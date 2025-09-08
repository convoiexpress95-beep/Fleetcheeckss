# Opérations: Migrations Supabase (Prod)

Ce document explique comment appliquer les migrations SQL au projet Supabase sans le CLI, via `psql`.

## Pré-requis
- `psql` installé (client PostgreSQL)
- Le mot de passe DB (`postgres`) à portée
- Windows PowerShell

## Variables d’environnement
Définir le mot de passe DB dans la session PowerShell courante (non persistant):

```powershell
$env:PGPASSWORD = '<MOT_DE_PASSE_DB>'
```

## Lancement rapide (script)
Depuis la racine du repo:

```powershell
npm run db:migrate
```

Ce script va:
- Tester la connexion
- Exécuter toutes les migrations `supabase/migrations/*.sql` (hors `_hold/`)
- Rendre le bucket `mission-photos` public (option incluse)
- Afficher des vérifications finales (bucket + policies)

Pour cibler des fichiers précis:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/apply-supabase-migrations.ps1 \
  -Host db.lucpsjwaglmiejpfxofe.supabase.co -DbName postgres -User postgres -SslMode require \
  -OnlyThese @(
    '20250905_create_bucket_mission_photos.sql',
    '20250905_storage_policies_mission_photos.sql'
  ) -MakeBucketPublic
```

## Notes
- Si `psql` n’est pas trouvé, installez le client PostgreSQL et assurez-vous que `psql` est dans le PATH.
- En cas d’erreur `must be owner of table objects` sur `ALTER TABLE storage.objects ENABLE RLS`, c’est normal si RLS est déjà actif; les policies sont quand même appliquées.
- Le bucket `mission-photos` est public par défaut ici pour débloquer l’affichage web. Basculer en privé + URLs signées est possible si besoin.
