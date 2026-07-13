@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  sync_and_push.bat
REM  Dong bo du lieu tu thu muc VNSTOCK sang repo web,
REM  sau do pull / add / commit / push len GitHub (branch main).
REM  Luu y: file nay dung tieng Viet khong dau de tranh loi
REM  encoding cua cmd.exe voi file .bat
REM ============================================================

REM SRC = DEST = thu muc chua file .bat nay (khong hardcode ten user/duong dan
REM tuyet doi, script chay duoc tren may nao/username nao cung duoc)
set "SRC=%~dp0"
set "SRC=%SRC:~0,-1%"
set "DEST=%~dp0"

cd /d "%DEST%"

echo.
echo ============================================================
echo    DONG BO DU LIEU VNSTOCK + DAY CODE LEN GITHUB PAGES
echo ============================================================

REM ---------- BUOC 1: COPY DU LIEU ----------
echo.
echo [1/5] Dang copy du lieu tu thu muc VNSTOCK...

if not exist "%SRC%\screen_snapshot.csv" (
    echo    [LOI] Khong tim thay file "%SRC%\screen_snapshot.csv" !
    goto :error
)
copy /Y "%SRC%\screen_snapshot.csv" "%DEST%screen_snapshot.csv" >nul
echo    [OK] Da copy screen_snapshot.csv

REM --- Tim file bao cao AI (.md) moi nhat. Ten file dang
REM     ai_report_YYYYMMDD.md nen sap theo ten /o:n = sap theo ngay,
REM     file cuoi cung trong danh sach la file moi nhat.
set "LATEST_MD="
for /f "delims=" %%F in ('dir /b /a:-d /o:n "%SRC%\ai_report_*.md" 2^>nul') do set "LATEST_MD=%%F"
if defined LATEST_MD (
    copy /Y "%SRC%\!LATEST_MD!" "%DEST%ai_report_latest.md" >nul
    echo    [OK] Bao cao AI moi nhat: !LATEST_MD!  --^>  ai_report_latest.md
) else (
    echo    [CANH BAO] Khong tim thay file ai_report_*.md nao trong thu muc nguon.
)

REM --- Tim file bao cao AI (.json) moi nhat ---
set "LATEST_JSON="
for /f "delims=" %%F in ('dir /b /a:-d /o:n "%SRC%\ai_report_*.json" 2^>nul') do set "LATEST_JSON=%%F"
if defined LATEST_JSON (
    copy /Y "%SRC%\!LATEST_JSON!" "%DEST%ai_report_latest.json" >nul
    echo    [OK] Du lieu JSON moi nhat: !LATEST_JSON!  --^>  ai_report_latest.json
) else (
    echo    [CANH BAO] Khong tim thay file ai_report_*.json nao trong thu muc nguon.
)

REM ---------- KIEM TRA GIT ----------
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo.
    echo    [LOI] Thu muc nay chua phai la Git repository!
    echo    Hay chay: git init -b main  va  git remote add origin ^<URL-repo-cua-ban^>
    goto :error
)

REM ---------- BUOC 2: GIT PULL ----------
echo.
echo [2/5] Dang keo code moi nhat ve (git pull origin main)...
git pull origin main
if errorlevel 1 (
    echo    [LOI] git pull that bai! Kiem tra ket noi mang hoac conflict.
    goto :error
)

REM ---------- BUOC 3: GIT ADD ----------
echo.
echo [3/5] Dang them thay doi vao stage (git add .)...
git add .
echo    [OK] Da add toan bo thay doi.

REM ---------- BUOC 4: GIT COMMIT ----------
echo.
echo [4/5] Dang tao commit...
git commit -m "Auto-update data %date%"
if errorlevel 1 (
    echo    [THONG BAO] Khong co thay doi moi nao de commit. Bo qua buoc push.
    goto :done
)

REM ---------- BUOC 5: GIT PUSH ----------
echo.
echo [5/5] Dang day code len GitHub (git push origin main)...
git push origin main
if errorlevel 1 (
    echo    [LOI] git push that bai! Kiem tra remote hoac quyen truy cap.
    goto :error
)

:done
echo.
echo ============================================================
echo    HOAN TAT! Du lieu da duoc dong bo va day len GitHub.
echo    GitHub Pages se tu dong cap nhat sau 1-2 phut.
echo ============================================================
echo.
pause
exit /b 0

:error
echo.
echo ============================================================
echo    CO LOI XAY RA! Vui long doc thong bao phia tren.
echo ============================================================
echo.
pause
exit /b 1
