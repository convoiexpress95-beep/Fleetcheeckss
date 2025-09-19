# Welcome to your Lovable project

<!-- Ajout instrumentation DB -->
> Debug DB: définir `VITE_DEBUG_DB=1` pour activer les logs d'instrumentation générique (voir `src/lib/dbTracer.ts`).

## Project info

**URL**: https://lovable.dev/projects/2ef1e4e8-1315-408a-bdf7-f0957274267f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2ef1e4e8-1315-408a-bdf7-f0957274267f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:


## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2ef1e4e8-1315-408a-bdf7-f0957274267f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!


Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Accès aux mini‑apps (Lovable)

Les interfaces FleetMarket et Convoiturage ne sont plus rendues en interne et s’ouvrent dans un nouvel onglet via la top bar. Aucune route interne `/fleetmarket` ou `/convoiturage` n’est exposée dans l’app principale.

- Ouverture depuis l’app: boutons en haut à droite (nouvel onglet)
- Comportement par défaut: liens vers des apps externes Lovable (mode recommandé)

Variables d’environnement pertinentes (fichier `.env`):

```ini
# FleetMarket (Lovable)
VITE_USE_EXTERNAL_LOVABLE=true
VITE_LOVABLE_URL=http://localhost:8080/
VITE_MARKET_HASH_PATH=#/

# Convoiturage (Lovable)
VITE_USE_EXTERNAL_CONVOITURAGE=true
VITE_CONVOITURAGE_URL=http://127.0.0.1:8083/
VITE_CONVOITURAGE_HASH_PATH=#/
```

Notes:
- Quand ces URLs ne sont pas définies, les boutons ne s’affichent pas (pas de fallback interne).
- En production, configurez ces valeurs vers les déploiements Lovable/Vercel correspondants.

Implémentation technique disponible (lib côté app):

- Composants UI: `FleetMarketMissionCard` et hooks/services associés (ex: `useFleetMarketMissions`, `fleetMarketService`)
- Types et migrations Supabase pour `fleetmarket_missions` fournis mais non routés dans l’app principale

Étapes suivantes suggérées:
1. Valider les URLs externes Lovable et leur disponibilité.
2. (Optionnel) Connecter `fleetMarketService` à Supabase au lieu du mock mémoire si l’app principale doit réutiliser ces données.
3. (Optionnel) Ajouter des tests d’intégration e2e sur l’ouverture des onglets externes.

## Règles de crédits – Trajets partagés

Mécanique actuelle (implémentée côté client) :

- Lorsqu’un passager rejoint un trajet: débit 2 crédits au passager (`reservation_trajet`).
- Simultanément: débit 2 crédits au conducteur pour ce passager (`passager_trajet`).
- Vérifications préalables: chacun doit avoir ≥ 2 crédits sinon l’opération échoue.
- Passage du statut du trajet à `complet` lorsque `participants.length === nb_places`.

Fichiers concernés :
- `src/services/credits.ts` (débit wallet + écriture ledger)
- `src/services/trajetsPartages.ts` (fonction `joinTrajet` applique les règles)

Limitations & améliorations futures :
1. Atomicité: aujourd’hui deux débits séparés -> migrer vers une RPC Postgres transactionnelle.
2. Remboursement / annulation: prévoir une fonction inverse (`refundReservation`) si un passager se retire.
3. Pricing dynamique: exposer des constantes centralisées (ex: `COST_PER_PASSENGER = 2`).
4. Monitoring: ajouter un canal realtime ou un compteur de crédits résumés pour rafraîchir le header après adhésion.
5. Sécurité: déplacer logique de vérification sur le serveur (edge function) pour éviter contournement client.

### Nouveau workflow de demandes (pending -> accept/refuse)

Objectif: Permettre remboursement automatique du passager si le conducteur refuse ou n’agit pas.

Étapes:
1. Passager crée une demande (`requestJoinTrajet`): débit de 2 crédits passager uniquement; enregistrement `trajet_join_requests` avec status `pending`.
2. Conducteur accepte (`acceptJoinRequest`): débit 2 crédits conducteur + ajout du passager dans `participants` du trajet.
3. Conducteur refuse (`refuseJoinRequest`): crédit de 2 crédits rendu au passager (reason `refund_reservation`).
4. Expiration (tâche CRON / edge future): demandes > x minutes passent `expired` avec remboursement (reason `refund_expire`).

Tables impliquées:
- `trajet_join_requests` (à créer) : id, trajet_id, passenger_id, convoyeur_id, status, created_at, decided_at, refund_done.
- `trajets_partages` (participants + statut).
- `credits_wallets` / `credits_ledger` (débits/crédits).

Services:
- `src/services/trajetDemands.ts` : request, accept, refuse, expire.
- `src/services/credits.ts` : `debitCredits`, `creditCredits`.

Prochaines améliorations:
- RPC unique côté serveur pour atomicité (vérif sièges + débit + insertion). 
- Notification en temps réel (Supabase Realtime) convoyeur/passager.
- Page conducteur: liste des demandes en attente avec boutons Accepter / Refuser.

### Expiration à l'heure de départ

Une fonction RPC `expire_requests_at_departure` parcourt les demandes `pending` dont le trajet a dépassé son `date_heure` et:
- passe le status à `expired`
- crédite le passager (si pas déjà remboursé)

Déclenchement actuel (temporaire):
- À l'ouverture de la page conducteur (`TrajetsDemandesConducteur`) un appel best‑effort est fait.
- Bouton discret "Expiration départ ↻" force l'appel manuel.

Recommandé en production:
- Planifier un cron externe (Edge Function + Scheduler) toutes les X minutes.
- Ou utiliser Supabase Scheduled Functions (si disponible) pour appeler la RPC.

### Realtime & Flux de crédits

Mise en place Realtime (Supabase) :
- Passager: canal `trajet_join_requests` filtré par `passenger_id` -> mise à jour immédiate des statuts (pending/accepted/refused/expired).
- Conducteur: canal `trajet_join_requests` filtré par `convoyeur_id` -> nouvelles demandes et disparition quand traitées.
- Crédits: canal `credits_ledger` (INSERT) filtré par `user_id` -> rafraîchit instantanément l'affichage du solde.

Fichiers clés:
- `src/pages/TrajetsPartages.tsx` (abonnement passager)
- `src/pages/TrajetsDemandesConducteur.tsx` (abonnement conducteur + déclenche expiration)
- `src/hooks/useRealtimeCredits.ts` (écoute ledger + fallback polling)
- `src/components/CreditsDisplay.tsx` (combine realtime & legacy)

Sécurité & RLS:
- Les abonnements ne retournent que les lignes autorisées par RLS (policies sur `trajet_join_requests` et tables crédits). Important pour ne pas sur-exposer les données.

### Suppression future du polling

Actuellement le composant crédits combine:
- Realtime (ledger) pour mise à jour instantanée
- Polling (`useWalletBalance`) toutes les 15s pour résilience (cas de perte d'événement)

Lorsque le realtime sera jugé stable, on pourra retirer le polling pour réduire la charge.

TODO futur:
- Retirer import `useWalletBalance` de `CreditsDisplay` et ne garder que `useRealtimeCredits` + un rafraîchissement manuel.
- Ajouter mécanisme de re-subscribe si le canal passe en état `CHANNEL_ERROR` ou `TIMED_OUT`.

### Observabilité conseillée

Ajoutez plus tard:
- Table `credits_wallets_audit` (trigger AFTER UPDATE) pour tracer variations anormales.
- Dashboard (Metabase / Supabase Studio) sur: demandes par statut, temps moyen acceptation, taux de refus.


### Page Conducteur – Gestion des demandes

Implémentée dans `src/pages/TrajetsDemandesConducteur.tsx` :
- Affiche toutes les demandes `pending` du conducteur.
- Actions: Accepter (débit conducteur + ajout participant) / Refuser (rembourse passager).
- Rafraîchissement en mémoire après action (suppression de la ligne locale).

Intégration potentielle future:
- Ajouter route/navigation vers cette page (actuellement fichier isolé si pas encore monté au router).
- Ajouter compteur badge (nombre de demandes en attente) dans la barre de navigation.
- Brancher Realtime sur `trajet_join_requests` pour push live.


---

## (Nouveau) RLS & Policies `trajet_join_requests`

RLS activé avec policies:
- SELECT: `auth.uid() = passenger_id OR auth.uid() = convoyeur_id`
- INSERT: `auth.uid() = passenger_id`
- UPDATE / DELETE: bloqués (passage par RPC). Une policy d'annulation `pending` par le passager peut être ajoutée si besoin.

Fichier migration: `supabase/migrations/20250914T150500_trajet_join_requests_rls.sql`.

## (Nouveau) Expiration Automatique via pg_cron

Deux jobs (si extension `pg_cron` présente):
- `expire_trajet_join_requests_every_minute` -> `select public.expire_requests()`
- `expire_trajet_join_requests_at_departure_every_minute` -> `select public.expire_requests_at_departure()`

## (Nouveau) Hook Realtime Résilient

`useSupabaseChannel` : backoff exponentiel (500ms → 8s), resubscribe auto sur erreurs, instrumentation d'état (événement `realtime.channel.status`).

## (Nouveau) Crédit: Suppression Polling

`CreditsDisplay` n'utilise plus le hook de polling; `useWalletBalance` est marqué `@deprecated` et ne sert que de compat temporaire.

## (Nouveau) Système de Toast Avancé

- Variants: `default | success | info | warning | destructive`
- File max 4, auto-dismiss configurable (`durationMs`), dismiss manuel, helper `toast.promise`.
- Instrumentation événement: `toast.show`.

## (Nouveau) Instrumentation / Metrics

Module `src/lib/metrics.ts` fournissant:
- `logEvent(name, payload)` incrémente compteur `event.<name>` + console debug (dev).
- `metrics.snapshot()` pour inspection.
- Helper `time(name, fn)` pour mesurer durée (compteurs: `timer.<name>.count`, `timer.<name>.ms.total`, `timer.<name>.errors`).

## Roadmap Technique Courte

- Ajouter persistance/flush périodique des métriques (Edge Function / API interne).
- Tableau de bord interne pour état des channels realtime.
- Retirer définitivement `useWalletBalance` après validation production.
- Policy d'annulation passager si la règle métier l'exige.
- Observabilité plus profonde (traces + ratios d'acceptation).

## Génération des types Supabase

Les types principaux sont générés dans `src/integrations/supabase/types.ts` via la CLI Supabase, puis enrichis par `src/integrations/supabase/types.extended.ts` (ajouts temporaires: `credits_wallets`, `credits_ledger`, `trajet_join_requests`).

Commande de régénération (ne pas écraser `types.extended.ts`):

```bash
supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/integrations/supabase/types.ts
npx tsc --noEmit
```

Quand une table ajoutée dans l'extension est intégrée officiellement :
1. Supprimer sa définition de `types.extended.ts`.
2. Lancer `npx tsc --noEmit`.
3. Commit.

Documentation détaillée supplémentaire: `supabase/TYPES.md`.


