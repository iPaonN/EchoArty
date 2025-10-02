@echo off
REM EchoArty Development Environment Stop Script for Windows

setlocal

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║        🛑  Stopping Development Environment  🛑      ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Use docker compose or docker-compose
docker compose version >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

echo Stopping Flask applications...

REM Stop Flask processes
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *EchoArty*" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Stopped Flask applications
) else (
    echo ℹ️  No Flask applications running
)

echo.
echo Stopping Docker containers...
%DOCKER_COMPOSE% down

echo.
echo Restoring cloud environment...
if exist .env.cloud (
    copy .env.cloud .env >nul
    echo ✅ Restored .env from .env.cloud
) else (
    echo ⚠️  No cloud backup found, keeping current .env
)

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║          ✅  Development Environment Stopped  ✅     ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.

echo 💡 Tips:
echo    • Start again: dev-start.bat
echo    • Clean data: %DOCKER_COMPOSE% down -v
echo.
pause
