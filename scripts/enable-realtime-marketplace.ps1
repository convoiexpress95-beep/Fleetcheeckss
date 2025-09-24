<#
  One-click: Enable realtime publication for marketplace tables via Edge Function

  This script will:
  - Ensure the Supabase CLI is available
  - (Optionally) login and link the project
  - Deploy the function: enable-realtime-marketplace
  - Set required secrets on the function (EDGE_ADMIN_BEARER, DB_* )
  - Call the function with Authorization: Bearer <EDGE_ADMIN_BEARER>

  IMPORTANT: Do NOT commit secrets. This script prompts or accepts parameters.
#>

param(
  [string]$ProjectRef = "lucpsjwaglmiejpfxofe",
  [string]$EdgeAdminBearer = "",
  [string]$DbHost = "",  # Default computed from ProjectRef if empty
  [int]$DbPort = 5432,
  [string]$DbName = "postgres",
  [string]$DbUser = "postgres",
  [securestring]$DbPasswordSecure,
  [ValidateSet('disable','allow','prefer','require','verify-ca','verify-full')] [string]$DbSSL = "require",
  [switch]$SkipLogin,
  [switch]$SkipLink
)

function Write-Section($Text){ Write-Host "`n=== $Text ===" -ForegroundColor Cyan }
function Write-Ok($Text)     { Write-Host "[OK] $Text" -ForegroundColor Green }
function Write-Warn($Text)   { Write-Host "[WARN] $Text" -ForegroundColor Yellow }
function Write-Err($Text)    { Write-Host "[ERR] $Text" -ForegroundColor Red }

Write-Section "Prerequisites"
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabase) {
  Write-Err "Supabase CLI introuvable. Installez-le: npm i -g supabase"
  exit 1
}
Write-Ok "Supabase CLI trouvé: $($supabase.Source)"

if (-not $SkipLogin) {
  Write-Section "Login Supabase (browser)"
  Write-Warn "Une fenêtre peut s'ouvrir pour authentifier le CLI. Si déjà connecté, vous pouvez ajouter -SkipLogin."
  supabase login
}

if (-not $SkipLink) {
  Write-Section "Link projet"
  supabase link --project-ref $ProjectRef
  if ($LASTEXITCODE -ne 0) { Write-Err "Echec du link vers $ProjectRef"; exit 2 }
}

Write-Section "Paramètres"
if (-not $EdgeAdminBearer) {
  $EdgeAdminBearer = Read-Host "EDGE_ADMIN_BEARER (choisissez un token fort)"
}
if (-not $DbHost) { $DbHost = "db.$ProjectRef.supabase.co" }
if (-not $DbPasswordSecure) {
  $DbPasswordSecure = Read-Host "DB_PASSWORD (mot de passe Postgres projet)" -AsSecureString
}
${script:DbPasswordPlain} = $null
${script:DbPasswordPtr} = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPasswordSecure)
try { ${script:DbPasswordPlain} = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(${script:DbPasswordPtr}) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR(${script:DbPasswordPtr}) }
Write-Host "ProjectRef: $ProjectRef" -ForegroundColor DarkCyan
Write-Host "DB Host   : $DbHost" -ForegroundColor DarkCyan

Write-Section "Deploy function"
supabase functions deploy enable-realtime-marketplace --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { Write-Err "Echec du déploiement de la fonction"; exit 3 }
Write-Ok "Fonction déployée"

Write-Section "Set function secrets"
supabase functions secrets set `
  "EDGE_ADMIN_BEARER=$EdgeAdminBearer" `
  "DB_HOST=$DbHost" `
  "DB_PORT=$DbPort" `
  "DB_NAME=$DbName" `
  "DB_USER=$DbUser" `
  "DB_PASSWORD=${script:DbPasswordPlain}" `
  "DB_SSL=$DbSSL" `
  --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { Write-Err "Echec lors du paramétrage des secrets"; exit 4 }
Write-Ok "Secrets configurés"

Write-Section "Call function"
$funcUrl = "https://$ProjectRef.functions.supabase.co/enable-realtime-marketplace"
try {
  $resp = Invoke-RestMethod -Method Post -Uri $funcUrl -Headers @{ Authorization = "Bearer $EdgeAdminBearer" } -ContentType 'application/json'
  Write-Host "Réponse:" (ConvertTo-Json $resp -Depth 5)
  Write-Ok "Publication realtime appliquée"
} catch {
  Write-Err "Appel fonction échoué: $($_.Exception.Message)"
  exit 5
}

Write-Section "Done"
Write-Ok "Tout est en place."
