# Configuration OAuth Google (Web + Mobile)

Ce guide explique comment activer la connexion via Google pour l’application web et mobile sur votre domaine : https://www.fleetcheecks.com

## 1) Supabase – Configuration des URLs

- Dashboard → Authentication → URL Configuration
  - Site URL (production)
    - https://www.fleetcheecks.com
  - Site URL (dev)
    - http://localhost:5173
  - Additional Redirect URLs (une URL par ligne)
    - Production (web): https://www.fleetcheecks.com/auth/callback
    - Dev (web): http://localhost:5173/auth/callback
    - Mobile (natif): fleetcheck://auth/callback

> Remarque: le redirectTo web est déterminé dynamiquement dans le code via `window.location.origin + '/auth/callback'`.

## 2) Supabase – Provider Google

- Dashboard → Authentication → Providers → Google
  - Activez le provider
  - Renseignez le Client ID et le Client Secret (du client « Web » Google)
  - Sauvegardez

## 3) Google Cloud Console – URI de redirection autorisée

- APIs & Services → Credentials → OAuth 2.0 Client IDs → votre « Web application »
  - Authorized redirect URIs :
    - https://<votre-projet>.supabase.co/auth/v1/callback

Remplacez `<votre-projet>` par votre sous-domaine Supabase (ex : vdygbqinodzvkdwegvpq.supabase.co). Google redirige d’abord vers Supabase, qui échange le code et vous renvoie ensuite vers votre `redirectTo` (web/mobile).

## 4) App Mobile (Expo)

- Le schéma de deep link est configuré dans `mobile-app/app.json` :
  - `"scheme": "fleetcheck"`
- Le redirectTo mobile est : `fleetcheck://auth/callback`.
- À la réception du deep link, l’app échange le code en session via Supabase.
- Pour la prod, reconstruisez l’app (EAS Build) après ajout du scheme.

## 5) Routage Web

- La route `/auth/callback` existe et redirige automatiquement vers `/dashboard` une fois la session présente.
- `vercel.json` réécrit déjà les URLs « propres » vers l’app (SPA), `/auth/callback` est donc gérée par le routeur React.

## 6) Tests

- Web (prod)
  1. https://www.fleetcheecks.com/login
  2. « Continuer avec Google »
  3. Retour sur `/auth/callback` → redirection automatique vers `/dashboard`.

- Web (dev)
  1. http://localhost:5173/login
  2. Google → retour http://localhost:5173/auth/callback → redirection `/dashboard`.

- Mobile (Expo)
  1. Ouvrez l’app → Login
  2. « Continuer avec Google »
  3. Retour via `fleetcheck://auth/callback` → session créée → toast succès.

## 7) Dépannage

- « redirect_uri_mismatch » (Google)
  - Ajoutez `https://<projet>.supabase.co/auth/v1/callback` dans Google Cloud → Authorized redirect URIs.
- « Not allowed » (Supabase)
  - Ajoutez `https://www.fleetcheecks.com/auth/callback` et `fleetcheck://auth/callback` dans Supabase → Additional Redirect URLs.
- Expo Go vs Build natif
  - Le scheme custom marche en build natif. En Expo Go, cela fonctionne généralement, sinon prévoir une URL exp:// spécifique.
