@echo off
setlocal

REM Safe entrypoint for Stock Look Up publishing.
REM Default: build + validate + dry-run only.
REM Explicit live publish: sync_and_publish.bat --live

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
if not defined STOCK_LOOKUP_BACKEND_DIR set "STOCK_LOOKUP_BACKEND_DIR=%SCRIPT_DIR%"
if not defined STOCK_LOOKUP_WEB_DIR set "STOCK_LOOKUP_WEB_DIR=%SCRIPT_DIR%"
if not defined STOCK_LOOKUP_PYTHON set "STOCK_LOOKUP_PYTHON=python"
REM STOCK_LOOKUP_PRODUCER_DIR: the stock-core-private checkout holding tools\publish_release.py.
REM Not user-configured -> try both known layouts (direct sibling, e.g. WEB_DIR=dashboard-runtime;
REM one level deeper, e.g. WEB_DIR=worktrees\market-dashboard-main) before giving up and letting
REM the explicit existence check below fail closed with guidance.
if not defined STOCK_LOOKUP_PRODUCER_DIR (
  if exist "%SCRIPT_DIR%\..\stock-core-private\tools\publish_release.py" (
    set "STOCK_LOOKUP_PRODUCER_DIR=%SCRIPT_DIR%\..\stock-core-private"
  ) else if exist "%SCRIPT_DIR%\..\..\stock-core-private\tools\publish_release.py" (
    set "STOCK_LOOKUP_PRODUCER_DIR=%SCRIPT_DIR%\..\..\stock-core-private"
  )
)

echo ============================================================
echo STOCK LOOK UP - BUILD / SYNC / PUBLISH
echo Backend : %STOCK_LOOKUP_BACKEND_DIR%
echo Web repo: %STOCK_LOOKUP_WEB_DIR%
echo Mode    : %*
echo ============================================================

if not exist "%STOCK_LOOKUP_BACKEND_DIR%\screen_snapshot.csv" (
  echo [ERROR] Missing backend artifact: screen_snapshot.csv
  exit /b 1
)
if not exist "%STOCK_LOOKUP_WEB_DIR%\publish_dashboard.py" (
  echo [ERROR] Missing publisher in web repo: publish_dashboard.py
  exit /b 1
)
if not exist "%STOCK_LOOKUP_WEB_DIR%\build_frontend.bat" (
  echo [ERROR] Missing frontend build script: build_frontend.bat
  exit /b 1
)

cd /d "%STOCK_LOOKUP_WEB_DIR%"

call "%STOCK_LOOKUP_WEB_DIR%\build_frontend.bat"
set "RC=%errorlevel%"
if not "%RC%"=="0" (
  echo [ERROR] Frontend build failed with exit code %RC%. Aborting publish.
  exit /b %RC%
)
git rev-parse --show-toplevel
if errorlevel 1 exit /b 1
git branch --show-current
if errorlevel 1 exit /b 1
git remote -v
if errorlevel 1 exit /b 1
git rev-parse HEAD
if errorlevel 1 exit /b 1

REM Trusted-subset release (analysis_bundle.json + bundle_manifest.json + focus_extract.json
REM + statement_taxonomy_sidecar.json) must land as one hash-verified unit BEFORE
REM publish_dashboard.py ever touches analysis_bundle.json — see
REM stock-core-private\docs\dashboard_release_session_contract.md and commit fbaf1fe
REM (2026-08-05), where skipping this step produced a manifest/bundle mismatch that failed
REM CI and blocked the Pages deploy. Skipped only when there is no separate backend to
REM publish from (single-root invocation) -- nothing outside WEB_ROOT to release in that case.
if /I "%STOCK_LOOKUP_BACKEND_DIR%"=="%STOCK_LOOKUP_WEB_DIR%" (
  echo [INFO] Backend=Web ^(single-root^); skipping trusted-subset release step.
) else (
  if not exist "%STOCK_LOOKUP_PRODUCER_DIR%\tools\publish_release.py" (
    echo [ERROR] Missing trusted-subset release publisher: %STOCK_LOOKUP_PRODUCER_DIR%\tools\publish_release.py
    echo [ERROR] Set STOCK_LOOKUP_PRODUCER_DIR to the stock-core-private checkout.
    exit /b 1
  )
  echo ============================================================
  echo TRUSTED-SUBSET RELEASE ^(publish_release.py^) - must land before dashboard data publish
  echo ============================================================
  "%STOCK_LOOKUP_PYTHON%" "%STOCK_LOOKUP_PRODUCER_DIR%\tools\publish_release.py" --source "%STOCK_LOOKUP_BACKEND_DIR%" --destination "%STOCK_LOOKUP_WEB_DIR%" %*
  REM NOTE: deliberately "if errorlevel 1", not "set RC=%errorlevel%" + "%RC%" — inside a
  REM parenthesized block, %RC% would expand at parse time (stale), not at this line's
  REM execution; "if errorlevel" is evaluated live regardless of parenthesization.
  if errorlevel 1 (
    echo [ERROR] Trusted-subset release publisher failed. Aborting publish.
    exit /b 1
  )
)

"%STOCK_LOOKUP_PYTHON%" "%STOCK_LOOKUP_WEB_DIR%\publish_dashboard.py" %*
set "RC=%errorlevel%"
if not "%RC%"=="0" (
  echo [ERROR] Publisher failed with exit code %RC%.
  exit /b %RC%
)

echo [OK] Publisher completed. Without --live, no stage/commit/push occurred.
exit /b 0
