@echo off
setlocal enabledelayedexpansion

set "BASE_PATH=C:\night-pulse-mtl"

if exist "%BASE_PATH%" (
    echo Directory %BASE_PATH% already exists.
) else (
    mkdir "%BASE_PATH%"
)

rem Create top-level files
for %%F in (docker-compose.yml .env) do (
    if not exist "%BASE_PATH%\%%F" (
        type nul > "%BASE_PATH%\%%F"
    )
)

rem Create db directory and files
mkdir "%BASE_PATH%\db" 2>nul
if not exist "%BASE_PATH%\db\init.sql" (
    type nul > "%BASE_PATH%\db\init.sql"
)

rem Create backend directories and files
mkdir "%BASE_PATH%\backend" 2>nul
for %%F in (Dockerfile requirements.txt app.py utils_privacy.py __init__.py) do (
    if not exist "%BASE_PATH%\backend\%%F" (
        type nul > "%BASE_PATH%\backend\%%F"
    )
)

rem Create backend\static directory and files
mkdir "%BASE_PATH%\backend\static" 2>nul
for %%F in (index.html checkin.html manifest.json sw.js) do (
    if not exist "%BASE_PATH%\backend\static\%%F" (
        type nul > "%BASE_PATH%\backend\static\%%F"
    )
)

endlocal
