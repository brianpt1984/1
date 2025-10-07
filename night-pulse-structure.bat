@echo off
setlocal enabledelayedexpansion
rem -----------------------------------------------------------------
rem Night Pulse bootstrap script
rem Usage: double-click or run `night-pulse-structure.bat [target-dir]`
rem        The optional target directory overrides the default path.
rem -----------------------------------------------------------------

set "DEFAULT_BASE=C:\night-pulse-mtl"

if "%~1"=="" (
    set "BASE_PATH=%DEFAULT_BASE%"
) else (
    set "BASE_PATH=%~1"
)

if "%BASE_PATH%"=="" (
    echo [error] The destination path could not be determined.
    echo         Provide a folder path as the first argument or edit DEFAULT_BASE.
    goto :eof
)

if "%BASE_PATH:~-1%"=="\" set "BASE_PATH=%BASE_PATH:~0,-1%"

call :header "Creating Night Pulse structure at %BASE_PATH%"
call :ensure_dir "%BASE_PATH%"

rem Top-level files
for %%F in (docker-compose.yml .env) do (
    call :ensure_file "%BASE_PATH%\%%F"
)

rem Database folder and seed file
call :ensure_dir "%BASE_PATH%\db"
call :ensure_file "%BASE_PATH%\db\init.sql"

rem Backend application folder
call :ensure_dir "%BASE_PATH%\backend"
for %%F in (Dockerfile requirements.txt app.py utils_privacy.py __init__.py) do (
    call :ensure_file "%BASE_PATH%\backend\%%F"
)

rem Static assets for the backend
call :ensure_dir "%BASE_PATH%\backend\static"
for %%F in (index.html checkin.html manifest.json sw.js) do (
    call :ensure_file "%BASE_PATH%\backend\static\%%F"
)

call :footer "%BASE_PATH%"
pause
exit /b 0

:ensure_dir
set "TARGET=%~1"
if exist "%TARGET%" (
    echo [skip] %TARGET% already exists
) else (
    mkdir "%TARGET%"
    if errorlevel 1 (
        echo [error] Failed to create %TARGET%
    ) else (
        echo [create] Directory %TARGET%
    )
)
exit /b 0

:ensure_file
set "TARGET=%~1"
if exist "%TARGET%" (
    echo [skip] %TARGET% already exists
) else (
    type nul > "%TARGET%"
    if errorlevel 1 (
        echo [error] Failed to create %TARGET%
    ) else (
        echo [create] File %TARGET%
    )
)
exit /b 0

:header
set "MESSAGE=%~1"
echo --------------------------------------------------
echo %MESSAGE%
echo --------------------------------------------------
exit /b 0

:footer
set "ROOT=%~1"
echo.
echo Night Pulse directory structure is ready at %ROOT%
echo.
if exist "%ROOT%" (
    tree "%ROOT%" /f
)
echo --------------------------------------------------
exit /b 0
