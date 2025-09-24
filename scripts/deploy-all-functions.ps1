Param(
  [string]$ProjectRef = ""
)

if (-not $ProjectRef) {
  Write-Error "Usage: .\scripts\deploy-all-functions.ps1 -ProjectRef <supabase-project-ref>"
  exit 1
}

$funcRoot = Join-Path $PSScriptRoot "..\supabase\functions"
Write-Host "Scanning functions in $funcRoot"

Get-ChildItem -Path $funcRoot -Directory | ForEach-Object {
  $name = $_.Name
  Write-Host "Deploying $name"
  supabase functions deploy $name --project-ref $ProjectRef
}

Write-Host "All function directories processed."
