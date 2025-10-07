@echo off
setlocal enabledelayedexpansion

set "BASE_PATH=C:\night-pulse-mtl"

echo Creating Night Pulse structure at %BASE_PATH%

if exist "%BASE_PATH%" (
    echo Directory %BASE_PATH% already exists.
) else (
    mkdir "%BASE_PATH%"
    echo Created %BASE_PATH%
)

rem Create top-level files
for %%F in (docker-compose.yml .env) do (
    if not exist "%BASE_PATH%\%%F" (
        type nul > "%BASE_PATH%\%%F"
        echo Created %BASE_PATH%\%%F
    ) else (
        echo Skipped existing file %BASE_PATH%\%%F
    )
)

rem Create db directory and files
mkdir "%BASE_PATH%\db" 2>nul
if errorlevel 1 (
    echo db directory already exists.
) else (
    echo Created db directory.
)
if not exist "%BASE_PATH%\db\init.sql" (
    type nul > "%BASE_PATH%\db\init.sql"
    echo Created %BASE_PATH%\db\init.sql
) else (
    echo Skipped existing file %BASE_PATH%\db\init.sql
)

rem Create backend directories and files
mkdir "%BASE_PATH%\backend" 2>nul
if errorlevel 1 (
    echo backend directory already exists.
) else (
    echo Created backend directory.
)
for %%F in (Dockerfile requirements.txt app.py utils_privacy.py __init__.py) do (
    if not exist "%BASE_PATH%\backend\%%F" (
        type nul > "%BASE_PATH%\backend\%%F"
        echo Created %BASE_PATH%\backend\%%F
    ) else (
        echo Skipped existing file %BASE_PATH%\backend\%%F
    )
)

rem Create backend\static directory and files
mkdir "%BASE_PATH%\backend\static" 2>nul
if errorlevel 1 (
    echo backend\static directory already exists.
) else (
    echo Created backend\static directory.
)
for %%F in (index.html checkin.html manifest.json sw.js) do (
    if not exist "%BASE_PATH%\backend\static\%%F" (
        type nul > "%BASE_PATH%\backend\static\%%F"
        echo Created %BASE_PATH%\backend\static\%%F
    ) else (
        echo Skipped existing file %BASE_PATH%\backend\static\%%F
    )
)

echo.
echo Night Pulse directory structure is ready.
endlocal
