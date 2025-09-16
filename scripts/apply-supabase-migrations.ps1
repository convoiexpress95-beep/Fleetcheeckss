param(
  [Parameter(Mandatory=$true)] [string]$DbHost,
  [string]$DbName = "postgres",
  [string]$User = "postgres",
  [ValidateSet('disable','allow','prefer','require','verify-ca','verify-full')] [string]$SslMode = "require",
  [string]$WorkspaceRoot = $(if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }),
  [switch]$MakeBucketPublic,
  [string[]]$OnlyThese,
  [string]$Password
)

function Write-Section($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }
function Write-Ok($text)      { Write-Host "[OK] $text" -ForegroundColor Green }
function Write-Warn($text)    { Write-Host "[WARN] $text" -ForegroundColor Yellow }
function Write-Err($text)     { Write-Host "[ERR] $text" -ForegroundColor Red }

Write-Section "Préflight"
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) { Write-Err "psql introuvable. Installe PostgreSQL client et/ou ajoute psql au PATH."; exit 1 }

if (-not $env:PGPASSWORD) {
  if ($Password) {
    # Utilise le mot de passe passé en paramètre (attention: visible dans l'historique de commande)
    $env:PGPASSWORD = $Password
  } else {
    Write-Warn "PGPASSWORD non défini dans cette session. Il sera demandé une fois (non affiché)."
    $secure = Read-Host "Mot de passe DB ($User@$DbHost)" -AsSecureString
    try {
      $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
      $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
      if ($bstr) { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    }
    $env:PGPASSWORD = $plain
  }
}

$Conn = "host=$DbHost port=5432 dbname=$DbName user=$User sslmode=$SslMode"
Write-Section "Test de connexion"
& psql "$Conn" -c "select current_user, current_database();" | Out-Host
if ($LASTEXITCODE -ne 0) { Write-Err "Echec de connexion"; exit 2 }

$migrationsDir = Join-Path $WorkspaceRoot "supabase/migrations"
if (-not (Test-Path $migrationsDir)) { Write-Err "Dossier migrations introuvable: $migrationsDir"; exit 3 }

# Construire la liste des fichiers
if ($OnlyThese -and $OnlyThese.Count -gt 0) {
  $files = $OnlyThese | ForEach-Object {
    $p = $_
    if (-not (Test-Path $p)) { Join-Path $migrationsDir $p } else { $p }
  }
} else {
  $files = Get-ChildItem -Path $migrationsDir -Filter *.sql -Recurse |
           # Exclure les sous-dossiers nommés _hold (regex: début ou antislash, puis _hold, puis antislash ou fin)
           Where-Object { $_.FullName -notmatch '(^|\\)_hold(\\|$)' } |
           Sort-Object Name |
           Select-Object -ExpandProperty FullName
}

Write-Section "Application des migrations ($($files.Count))"
foreach ($file in $files) {
  Write-Host ("-> " + (Resolve-Path $file)) -ForegroundColor DarkCyan
  & psql "$Conn" -f $file | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "Echec (continuation): $file"
  } else {
    Write-Ok "OK: $file"
  }
}

if ($MakeBucketPublic) {
  Write-Section "Rendre mission-photos public"
  & psql "$Conn" -c "update storage.buckets set public = true where id = 'mission-photos';" | Out-Host
}

Write-Section "Vérifications finales"
& psql "$Conn" -c "select id, public from storage.buckets where id='mission-photos';" | Out-Host
& psql "$Conn" -c "select policyname, roles, cmd from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'mission-photos%';" | Out-Host

Write-Ok "Terminé"
