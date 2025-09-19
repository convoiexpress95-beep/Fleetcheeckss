# Configuration Supabase Auth (Windows / PowerShell)

Ce guide vous permet de configurer automatiquement:
- site_url (Auth)
- Allowed Redirect URLs (Auth → uri_allow_list)

Il reste à configurer manuellement (ou plus tard via IaC):
- API → Allowed Origins (CORS)

Prérequis
- Un Personal Access Token Supabase (PAT)
- Le Project Ref de votre projet Supabase

Obtenir un PAT
- Dashboard Supabase → Account → Tokens → Generate new token
- Copiez le token (format: sbp_xxx)

Trouver le Project Ref
- Dans l’URL du Dashboard projet: https://supabase.com/dashboard/project/<PROJECT_REF>/...
- Ou via CLI: supabase projects list

Exécution (PowerShell)

``powershell
# Dans le dossier racine du repo
$env:SUPABASE_ACCESS_TOKEN = "sbp_votre_token_ici"

# Paramètres
$projectRef   = "lucpsjwaglmiejpfxofe"         # votre project ref
$primaryDomain = "fleetcheecks.com"             # votre domaine apex
$previewUrl    = "https://app-syncer-main-ultims-projects.vercel.app"  # optionnel

# Lancer le script
./scripts/setup-supabase-auth.ps1 -ProjectRef $projectRef -PrimaryDomain $primaryDomain -PreviewUrl $previewUrl
``

Ce que fait le script
- Définit site_url = https://www.<primaryDomain> (sauf si déjà défini sur ce domaine)
- Fusionne les URLs autorisées sans doublon:
  - https://www.<primaryDomain>
  - https://<primaryDomain>
  - <previewUrl> si fourni
- Affiche la configuration finale

Configurer CORS (Allowed Origins)
- Dans Supabase Dashboard → Settings → API → Allowed Origins, ajoutez:
  - https://www.fleetcheecks.com
  - https://fleetcheecks.com
  - https://app-syncer-main-ultims-projects.vercel.app (si vous utilisez la preview)

Notes
- L’endpoint Management API `PATCH /v1/projects/{ref}/config/auth` ne gère pas CORS (API). C’est normal.
- Le code d’inscription utilise `window.location.origin` pour `emailRedirectTo` — il faut donc autoriser tous les domaines où l’appli tourne.
- Vous pouvez relancer le script sans risque: il merge proprement les valeurs existantes.
