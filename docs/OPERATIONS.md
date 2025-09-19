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
 - Appliquer la config Realtime pour `public.messages` (replica identity full). L'ajout à la publication `supabase_realtime` peut nécessiter des privilèges owner.

Pour cibler des fichiers précis:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/apply-supabase-migrations.ps1 \
  -Host db.lucpsjwaglmiejpfxofe.supabase.co -DbName postgres -User postgres -SslMode require \
  -OnlyThese @(
    '20250905_create_bucket_mission_photos.sql',
    '20250905_storage_policies_mission_photos.sql'
  ) -MakeBucketPublic
```

## Realtime – activation des tables

### Marketplace (messages)

L'UI consomme les changements Realtime sur `public.messages`. Pour l'activer complètement:

1) Vérifiez que la table est en `replica identity full` (la migration `20250916124000_messages_realtime.sql` le fait):

```sql
alter table if exists public.messages replica identity full;
```

2) Ajoutez la table à la publication Realtime si vous avez les privilèges owner:

```sql
alter publication supabase_realtime add table public.messages;
```

Sinon, via Dashboard Supabase:

- Database → Replication → supabase_realtime → Add table → `public.messages`.

> Remarque: L'opération « add table to publication » peut échouer via compte restreint (erreur « must be owner »). Utilisez le Dashboard avec un rôle owner.

### Covoiturage (rides, reservations, messages)

Les écrans covoiturage utilisent Realtime sur `rides`, `ride_reservations`, `ride_messages`, `ride_message_reads`.

1) Vérifiez que ces tables sont en `replica identity full` (la migration `20250916124500_covoiturage_realtime.sql` le fait):

```sql
alter table if exists public.rides replica identity full;
alter table if exists public.ride_reservations replica identity full;
alter table if exists public.ride_messages replica identity full;
alter table if exists public.ride_message_reads replica identity full;
```

2) Ajoutez-les à la publication Realtime si vous avez les privilèges owner:

```sql
alter publication supabase_realtime add table public.rides;
alter publication supabase_realtime add table public.ride_reservations;
alter publication supabase_realtime add table public.ride_messages;
alter publication supabase_realtime add table public.ride_message_reads;
```

Sinon, via Dashboard Supabase:

- Database → Replication → supabase_realtime → Add tables → rides, ride_reservations, ride_messages, ride_message_reads.

> Astuce: côté frontend, définissez `VITE_RTC_DEBUG=1` pour afficher des logs de statut de channel et des payloads dans la console (Marketplace et Covoiturage). 

## Notes
- Si `psql` n’est pas trouvé, installez le client PostgreSQL et assurez-vous que `psql` est dans le PATH.
- En cas d’erreur `must be owner of table objects` sur `ALTER TABLE storage.objects ENABLE RLS`, c’est normal si RLS est déjà actif; les policies sont quand même appliquées.
- Le bucket `mission-photos` est public par défaut ici pour débloquer l’affichage web. Basculer en privé + URLs signées est possible si besoin.
