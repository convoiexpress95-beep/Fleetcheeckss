# Requires: SUPABASE_ACCESS_TOKEN env var (PAT) and SUPABASE_PROJECT_REF
# Usage (PowerShell):
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."; ./scripts/setup-supabase-auth.ps1 -ProjectRef "lucpsjwaglmiejpfxofe" -PrimaryDomain "fleetcheecks.com" -PreviewUrl "https://app-syncer-main-ultims-projects.vercel.app"
# What it does:
# - Sets Auth site_url to https://www.<PrimaryDomain>
# - Adds Allowed Redirect URLs (uri_allow_list) for:
#     https://www.<PrimaryDomain>
#     https://<PrimaryDomain>
#     <PreviewUrl>
# - Optionally appends existing allow list (no duplicates)
# - Prints final auth config summary
# Notes:
# - This uses Supabase Management API v1.
# - CORS/API Allowed Origins are not in auth config; configure in Dashboard Settings > API, or push via supabase/config.toml if supported.

param(
  [Parameter(Mandatory=$true)][string]$ProjectRef,
  [Parameter(Mandatory=$true)][string]$PrimaryDomain,
  [Parameter(Mandatory=$false)][string]$PreviewUrl = ""
)

$ErrorActionPreference = "Stop"

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Error "Missing SUPABASE_ACCESS_TOKEN env var. Create a PAT in Supabase Dashboard > Account > Tokens."
}

$base = "https://api.supabase.com/v1/projects/$ProjectRef"
$headers = @{ Authorization = "Bearer $($env:SUPABASE_ACCESS_TOKEN)"; 'Content-Type' = 'application/json' }

# Build target values
$apex = "https://$PrimaryDomain"
$www = "https://www.$PrimaryDomain"
$allow = @($www, $apex)
if ($PreviewUrl -and $PreviewUrl.Trim() -ne "") { $allow += $PreviewUrl.Trim() }

# 1) Get current auth config
Write-Host "Fetching current auth config..."
try {
  $authConfig = Invoke-RestMethod -Method GET -Uri "$base/config/auth" -Headers $headers -ErrorAction Stop
} catch {
  $resp = $_.Exception.Response
  $status = if ($resp) { [int]$resp.StatusCode } else { -1 }
  $body = $null
  if ($resp) { try { $sr = New-Object System.IO.StreamReader($resp.GetResponseStream()); $body = $sr.ReadToEnd(); $sr.Close() } catch {} }
  Write-Error ("Failed to fetch auth config. HTTP {0} Body: {1}" -f $status, $body)
}

$currentSiteUrl = $authConfig.site_url
$currentAllow = @()
if ($authConfig.uri_allow_list) {
  $currentAllow = $authConfig.uri_allow_list -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
}

# Merge without duplicates
$mergedAllow = New-Object System.Collections.Generic.HashSet[string]
$currentAllow | ForEach-Object { [void]$mergedAllow.Add($_) }
$allow | ForEach-Object { [void]$mergedAllow.Add($_) }
$mergedCsv = ($mergedAllow.ToArray() | Sort-Object) -join ","

$targetSiteUrl = $www
if ($currentSiteUrl -and $currentSiteUrl.Trim() -ne "") {
  # Keep current if already set to a production domain
  if ($currentSiteUrl -like "https://*.$PrimaryDomain" -or $currentSiteUrl -eq $apex -or $currentSiteUrl -eq $www) {
    $targetSiteUrl = $currentSiteUrl
  }
}

# 2) Patch auth config
Write-Host "Updating auth config (site_url + uri_allow_list)..."
$body = @{ site_url = $targetSiteUrl; uri_allow_list = $mergedCsv } | ConvertTo-Json
try {
  $updated = Invoke-RestMethod -Method PATCH -Uri "$base/config/auth" -Headers $headers -Body $body -ErrorAction Stop
} catch {
  $resp = $_.Exception.Response
  $status = if ($resp) { [int]$resp.StatusCode } else { -1 }
  $bodyTxt = $null
  if ($resp) { try { $sr = New-Object System.IO.StreamReader($resp.GetResponseStream()); $bodyTxt = $sr.ReadToEnd(); $sr.Close() } catch {} }
  Write-Error ("Failed to update auth config. HTTP {0} Body: {1}" -f $status, $bodyTxt)
}

Write-Host "Done. Summary:"
Write-Host ("  site_url:        {0}" -f $updated.site_url)
Write-Host ("  uri_allow_list:  {0}" -f $updated.uri_allow_list)

# 3) Print a reminder for API CORS (manual)
Write-Host "Reminder: Configure CORS Allowed Origins in Dashboard > Settings > API > Allowed Origins to include:" -ForegroundColor Yellow
$allow | ForEach-Object { Write-Host (" - {0}" -f $_) -ForegroundColor Yellow }
