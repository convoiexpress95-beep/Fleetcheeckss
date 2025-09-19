param(
  [string]$SupabaseUrl,
  [securestring]$SupabaseAnonKey,
  [securestring]$MapboxToken,
  [securestring]$GoogleMapsApiKey,
  [switch]$WriteLocalEnv,
  [switch]$OnlyLocal
)

function Read-SecretString([string]$prompt) {
  $s = Read-Host -AsSecureString -Prompt $prompt
  return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  )
}

function ConvertTo-PlainText([securestring]$s) {
  if (-not $s) { return $null }
  return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  )
}

Write-Host "=== FleetCheecks · Configuration des variables d'environnement ===" -ForegroundColor Cyan

# Valeurs par défaut: écrire .env local si non précisé
if (-not $PSBoundParameters.ContainsKey('WriteLocalEnv')) { $WriteLocalEnv = $true }

# 1) Collecte des valeurs (prompt si manquantes)
if (-not $SupabaseUrl) { $SupabaseUrl = Read-Host "VITE_SUPABASE_URL (ex: https://xxxx.supabase.co)" }
$SupabaseAnonKeyPlain = ConvertTo-PlainText $SupabaseAnonKey
if (-not $SupabaseAnonKeyPlain) { $SupabaseAnonKeyPlain = Read-SecretString "VITE_SUPABASE_ANON_KEY (entrer la clé publique)" }
$MapboxTokenPlain = ConvertTo-PlainText $MapboxToken
if (-not $MapboxTokenPlain) { $MapboxTokenPlain = Read-SecretString "VITE_MAPBOX_TOKEN (optionnel, laisser vide si non utilisé)" }
$GoogleMapsApiKeyPlain = ConvertTo-PlainText $GoogleMapsApiKey
if (-not $GoogleMapsApiKeyPlain) { $GoogleMapsApiKeyPlain = Read-SecretString "VITE_GOOGLE_MAPS_API_KEY (optionnel, laisser vide si non utilisé)" }

# 2) Ecrire local .env pour dev
if ($WriteLocalEnv) {
  $envPath = Join-Path $PSScriptRoot "..\.env"
  $envPath = [IO.Path]::GetFullPath($envPath)
  Write-Host "Ecriture des variables dans $envPath ..." -ForegroundColor Yellow
  $lines = @()
  $lines += "VITE_SUPABASE_URL=$SupabaseUrl"
  $lines += "VITE_SUPABASE_ANON_KEY=$SupabaseAnonKeyPlain"
  if ($MapboxTokenPlain) { $lines += "VITE_MAPBOX_TOKEN=$MapboxTokenPlain" }
  if ($GoogleMapsApiKeyPlain) { $lines += "VITE_GOOGLE_MAPS_API_KEY=$GoogleMapsApiKeyPlain" }
  $lines += "VITE_SUPABASE_USE_PROXY=1"
  $content = ($lines -join "`n") + "`n"
  Set-Content -Path $envPath -Value $content -Encoding UTF8
  Write-Host "Fichier .env mis à jour (non suivi par Git)." -ForegroundColor Green
}

if ($OnlyLocal) {
  Write-Host "-- Mode OnlyLocal: saisi locale effectuée. Fin." -ForegroundColor Green
  exit 0
}

# 3) Pousser vers Vercel (Production + Preview)
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) {
  Write-Host "Vercel CLI introuvable. Installez-le avec:" -ForegroundColor Red
  Write-Host "  npm i -g vercel" -ForegroundColor Gray
  Write-Host "Puis relancez ce script." -ForegroundColor Gray
  exit 1
}

# Vérifier le lien du projet
$vercelProject = Join-Path $PSScriptRoot "..\.vercel\project.json"
if (-not (Test-Path $vercelProject)) {
  Write-Host "Projet Vercel non lié (/.vercel/project.json manquant)." -ForegroundColor Yellow
  Write-Host "Exécutez: vercel link  (puis sélectionnez l'équipe/projet)" -ForegroundColor Gray
  exit 1
}

function Add-VercelEnv([string]$name, [string]$value, [string]$env) {
  if (-not $value) { return }
  Write-Host "Vercel env add $name ($env)" -ForegroundColor Yellow
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  # Résoudre un binaire exécutable: privilégier vercel.cmd ou exécuter via cmd.exe
  $vercelCmd = $(Get-Command vercel.cmd -ErrorAction SilentlyContinue).Path
  if (-not $vercelCmd) { $vercelCmd = $(Get-Command vercel.exe -ErrorAction SilentlyContinue).Path }
  if (-not $vercelCmd) { $vercelCmd = 'vercel' }
  $psi.FileName = "cmd.exe"
  # La v46 de Vercel ne supporte pas --yes; on pipe la valeur via echo
  $psi.Arguments = "/c echo $value | `"$vercelCmd`" env add $name $env"
  $psi.RedirectStandardInput = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  $null = $proc.Start()
  # La valeur est transmise via echo piping ci-dessus
  $stdout = $proc.StandardOutput.ReadToEnd()
  $stderr = $proc.StandardError.ReadToEnd()
  $proc.WaitForExit()
  if ($proc.ExitCode -ne 0) {
    Write-Host "Erreur Vercel: $stderr" -ForegroundColor Red
  } else {
    Write-Host $stdout -ForegroundColor Green
  }
}

$vars = @{
  'VITE_SUPABASE_URL' = $SupabaseUrl
  'VITE_SUPABASE_ANON_KEY' = $SupabaseAnonKeyPlain
  'VITE_MAPBOX_TOKEN' = $MapboxTokenPlain
  'VITE_GOOGLE_MAPS_API_KEY' = $GoogleMapsApiKeyPlain
}

foreach ($kv in $vars.GetEnumerator()) {
  Add-VercelEnv -name $kv.Key -value $kv.Value -env "production"
  Add-VercelEnv -name $kv.Key -value $kv.Value -env "preview"
}

Write-Host "Terminé. Déployez ensuite: vercel --prod" -ForegroundColor Cyan
