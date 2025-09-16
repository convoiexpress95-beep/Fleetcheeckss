param(
  [Parameter(Mandatory=$true)][string]$RemoteUrl,              # ex: https://github.com/org/repo.git (ignoré si -SkipPush)
  [Parameter(Mandatory=$true)][string]$StableCommit,           # ex: a738813
  [string]$BranchName = ("restore/{0}-stable" -f (Get-Date -Format "yyyy-MM-dd")),
  [string]$TagBase = ("backup-{0}" -f (Get-Date -Format "yyyy-MM-dd")),
  [string]$ArchiveBaseName = ("fleetcheck-backup-{0}" -f (Get-Date -Format "yyyy-MM-dd")),
  [switch]$RunBuild,
  [switch]$AutoStash,
  [switch]$IncludeEnv,
  [switch]$SkipPush,
  [switch]$VerboseLogs
)

function Log($m){ if($VerboseLogs){ Write-Host "[INFO] $m" -ForegroundColor Cyan } }
function Fail($m){ Write-Host "[ERREUR] $m" -ForegroundColor Red; exit 1 }

if(-not (Get-Command git -ErrorAction SilentlyContinue)){ Fail "Git introuvable." }
if(-not (Test-Path .git)){ Fail "Ce dossier n'est pas un dépôt Git." }

$dirty = (git status --porcelain)
if($dirty){
  if($AutoStash){
    Log "Modifs détectées → stash."
    git stash push -u -m "auto-backup-before-restore $(Get-Date -Format s)" | Out-Null
  } else {
    Write-Host "Modifications locales détectées (utilisez -AutoStash pour stasher)." -ForegroundColor Yellow
  }
}

$existingRemote = (git remote 2>$null | Select-String "^origin$")
if(-not $existingRemote -and -not $SkipPush){
  Log "Ajout remote origin"
  git remote add origin $RemoteUrl 2>$null
} elseif($existingRemote){
  Log "Remote origin présent"
}

git fetch origin *>$null 2>$null

if(-not (git cat-file -t $StableCommit 2>$null)){
  Fail "Commit $StableCommit introuvable (fetch manquant ?)."
}

$branchExists = (git branch --list $BranchName)
if($branchExists){
  Log "Branche $BranchName existe → checkout"
  git checkout $BranchName | Out-Null
  $currentHead = (git rev-parse HEAD).Trim()
  if($currentHead -ne $StableCommit){
    Write-Host "La branche n'est pas sur le commit cible → création branche dérivée." -ForegroundColor Yellow
    $BranchName = "$BranchName-realign"
    git checkout -b $BranchName $StableCommit | Out-Null
  }
} else {
  Log "Création branche $BranchName depuis $StableCommit"
  git checkout -b $BranchName $StableCommit | Out-Null
}

$buildOk = $true
if($RunBuild){
  Log "Lint"
  try { npm run lint --silent } catch { Write-Host "Lint échec (non bloquant)." -ForegroundColor Yellow }
  Log "Build"
  try { npm run build | Out-Null } catch { $buildOk = $false; Write-Host "Build échec." -ForegroundColor Red }
}

function Get-UniqueTag($base){ $t=$base; $i=1; while($(git tag --list $t)){ $t="$base-$i"; $i++ }; return $t }
$TagName = Get-UniqueTag $TagBase

$commitHash = (git rev-parse HEAD).Trim()
"Commit=$commitHash" | Out-File BACKUP_METADATA.txt -Encoding utf8
Get-Date -Format o | Out-File -Append BACKUP_METADATA.txt
"Branch=$BranchName" | Out-File -Append BACKUP_METADATA.txt
"BuildSuccess=$buildOk" | Out-File -Append BACKUP_METADATA.txt
if(Test-Path supabase/migrations){ Get-ChildItem supabase/migrations -File | Select-Object -ExpandProperty Name | Out-File BACKUP_MIGRATIONS.txt -Encoding utf8 }

$archiveDir = Join-Path (Split-Path -Parent $PWD) $ArchiveBaseName
if(Test-Path "$archiveDir.zip"){ Remove-Item "$archiveDir.zip" -Force }
$exclude = @('.git','node_modules','dist','.vercel','.expo')
$allFiles = Get-ChildItem -Recurse -File | Where-Object {
  $rel = $_.FullName.Substring($PWD.Path.Length)
  -not ($exclude | ForEach-Object { $rel -like "*$_*" })
}
$tempStage = Join-Path $env:TEMP ("stage_" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempStage | Out-Null
foreach($f in $allFiles){
  $target = Join-Path $tempStage ($f.FullName.Substring($PWD.Path.Length).TrimStart('\\','/'))
  $targetDir = Split-Path $target
  if(-not (Test-Path $targetDir)){ New-Item -ItemType Directory -Path $targetDir | Out-Null }
  Copy-Item $f.FullName $target
}
Copy-Item BACKUP_METADATA.txt $tempStage
if(Test-Path BACKUP_MIGRATIONS.txt){ Copy-Item BACKUP_MIGRATIONS.txt $tempStage }
if($IncludeEnv -and (Test-Path .env)){ Copy-Item .env (Join-Path $tempStage "env.backup.DO_NOT_COMMIT.txt") }
Compress-Archive -Path (Join-Path $tempStage '*') -DestinationPath "$archiveDir.zip" -Force
Remove-Item $tempStage -Recurse -Force

if(-not $SkipPush){
  Log "Push branche $BranchName"
  git push -u origin $BranchName
  Log "Tag $TagName"
  git tag -a $TagName -m "Backup stable $commitHash ($BranchName)"
  git push origin $TagName
} else {
  Write-Host "Mode SKIP PUSH: aucune interaction distante." -ForegroundColor Yellow
}

Write-Host "`n=== Sauvegarde terminée ===" -ForegroundColor Green
Write-Host "Branche: $BranchName"
Write-Host "Tag (si push): $TagName"
Write-Host "Commit: $commitHash"
Write-Host "Archive: $archiveDir.zip"
Write-Host "Build OK: $buildOk"
if($IncludeEnv){ Write-Host "ENV inclus dans archive (env.backup.DO_NOT_COMMIT.txt)." -ForegroundColor Yellow }
if($SkipPush){ Write-Host "Aucun push distant (utiliser sans -SkipPush une fois le remote configuré)." -ForegroundColor Yellow }
