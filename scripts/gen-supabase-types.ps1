param(
  [Parameter(Mandatory=$true)] [string]$DbHost,
  [string]$DbName = "postgres",
  [string]$User = "postgres",
  [ValidateSet('disable','allow','prefer','require','verify-ca','verify-full')] [string]$SslMode = "require",
  [string]$OutFile = "src/integrations/supabase/types.ts",
  [string]$AccessToken
)

function Write-Section($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }
function Write-Ok($text)      { Write-Host "[OK] $text" -ForegroundColor Green }
function Write-Err($text)     { Write-Host "[ERR] $text" -ForegroundColor Red }

Write-Section "Préparation"
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Err "npx introuvable (Node.js requis)"; exit 1
}

${null} = $plain

# Mode remote si un token est fourni (paramètre ou variable d'environnement)
$useRemote = $false
if ($AccessToken -and $AccessToken.Trim() -ne '') {
  $env:SUPABASE_ACCESS_TOKEN = $AccessToken
  $useRemote = $true
} elseif ($env:SUPABASE_ACCESS_TOKEN -and $env:SUPABASE_ACCESS_TOKEN.Trim() -ne '') {
  $useRemote = $true
}

if (-not $useRemote) {
  # Chemin DB direct: demander le mot de passe si absent
  if (-not $env:PGPASSWORD) {
    $secure = Read-Host "Mot de passe DB ($User@$DbHost)" -AsSecureString
    try {
      $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
      $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
      if ($bstr) { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    }
  } else {
    $plain = $env:PGPASSWORD
  }
}

# Escape URI components
$encUser = [System.Uri]::EscapeDataString($User)
$encPwd  = [System.Uri]::EscapeDataString($plain)
$encHost = $DbHost
$encDb   = [System.Uri]::EscapeDataString($DbName)

if ($useRemote) {
  # Lire le project_id depuis supabase/config.toml
  $configPath = Join-Path (Get-Location) "supabase/config.toml"
  if (-not (Test-Path $configPath)) { Write-Err "supabase/config.toml introuvable"; exit 2 }
  $content = Get-Content $configPath -Raw
  $projectId = ($content | Select-String -Pattern 'project_id\s*=\s*"([^"]+)"').Matches.Groups[1].Value
  if (-not $projectId) { Write-Err "project_id introuvable dans config.toml"; exit 2 }

  Write-Section "Génération des types (remote) depuis le projet $projectId"
  try {
    $types = & npx -y supabase@latest gen types typescript --project-id "$projectId" --schema public
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec de génération (remote)"; exit 2 }
    $dir = Split-Path -Parent $OutFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $types | Set-Content -Encoding UTF8 $OutFile
    Write-Ok "Types écrits dans $OutFile"
  } catch {
    Write-Err $_.Exception.Message
    exit 3
  }
} else {
  $DbUrl = "postgresql://${encUser}:${encPwd}@${encHost}:5432/${encDb}?sslmode=${SslMode}"
  Write-Section "Génération des types depuis la base ($DbHost/$DbName)"
  try {
    $types = & npx -y supabase@latest gen types typescript --db-url "$DbUrl" --schema public
    if ($LASTEXITCODE -ne 0) { Write-Err "Échec de génération"; exit 2 }
    $dir = Split-Path -Parent $OutFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $types | Set-Content -Encoding UTF8 $OutFile
    Write-Ok "Types écrits dans $OutFile"
  } catch {
    Write-Err $_.Exception.Message
    exit 3
  }
}
