@echo off
setlocal
cd /d "%~dp0"

where pnpm.cmd >nul 2>nul
if errorlevel 1 (
  echo pnpm.cmd was not found. Run npm install -g pnpm@10.13.1, then try again.
  exit /b 1
)

set NEXT_DIST_DIR=.next-local
set NEXT_TELEMETRY_DISABLED=1

if not exist "apps\web\node_modules\next\dist\bin\next" (
  echo Repairing local dependencies for this folder...
  pnpm.cmd install
  if errorlevel 1 exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$root=(Resolve-Path '.').Path; $envPath=Join-Path $root '.env'; $webEnv=Join-Path $root 'apps\web\.env.local'; if (Test-Path -LiteralPath $envPath) { $lines=Get-Content -LiteralPath $envPath; $azure=$lines | Where-Object { $_ -match '^AZURE_OPENAI_(API_KEY|CHAT_COMPLETIONS_URL)=' -and $_ -notmatch '^AZURE_OPENAI_API_KEY=$' }; if ($azure) { Set-Content -LiteralPath $webEnv -Value $azure } }"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$root=(Resolve-Path '.').Path; $trace=Join-Path $root 'apps\web\.next-local\trace'; if (Test-Path -LiteralPath $trace) { Remove-Item -LiteralPath $trace -Force -ErrorAction SilentlyContinue }; $cache=Split-Path -Parent $trace; if (!(Test-Path -LiteralPath $cache)) { New-Item -ItemType Directory -Force -Path $cache | Out-Null }"

pnpm.cmd --filter @portfolio/web dev
