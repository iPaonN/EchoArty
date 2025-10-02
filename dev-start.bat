@echo off
REM EchoArty Development Environment Startup Script for Windows
REM This script starts the complete development environment

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║           🎨  EchoArty Development Mode  🎨          ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed!
    echo    Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check Docker Compose
docker compose version >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set DOCKER_COMPOSE=docker compose
) else (
    docker-compose --version >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set DOCKER_COMPOSE=docker-compose
    ) else (
        echo ❌ Docker Compose is not installed!
        pause
        exit /b 1
    )
)

echo 📦 Step 1: Checking Dependencies...
echo.

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed!
    echo    Please install Python 3: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check and install Python packages
python -c "import flask" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Installing Python dependencies...
    pip install -r requirements.txt
    echo ✅ Python dependencies installed
) else (
    echo ✅ Python dependencies ready
)

echo.
echo 📋 Step 2: Environment Configuration...
echo.

REM Backup current .env if it exists
if exist .env (
    if not exist .env.cloud (
        copy .env .env.cloud >nul
        echo ✅ Backed up cloud .env to .env.cloud
    ) else (
        echo ℹ️  Cloud backup already exists
    )
)

REM Use Docker environment
if exist .env.docker (
    copy .env.docker .env >nul
    echo ✅ Using Docker environment (.env.docker)
) else (
    echo ⚠️  Creating default .env.docker
    (
        echo DB_USER="echoarty_user"
        echo DB_PASSWORD="echoartypassword"
        echo DB_HOST="localhost"
        echo DB_PORT="3306"
        echo DB_NAME="echoart"
        echo SECRET_KEY="dev-secret-key-change-in-production"
    ) > .env.docker
    copy .env.docker .env >nul
)

echo.
echo 🐳 Step 3: Starting Docker Containers...
echo.

REM Create logs directory
if not exist docker\logs mkdir docker\logs

REM Check if port 3306 is available
netstat -ano | findstr :3306 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 3306 is already in use
    echo    This might be a local MySQL/MariaDB service
    echo    Please stop it manually or use a different port
    set /p continue="Continue anyway? (y/n): "
    if /i not "!continue!"=="y" (
        echo Aborted.
        pause
        exit /b 1
    )
)

REM Start Docker containers
%DOCKER_COMPOSE% up -d

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Check container health
docker ps | findstr echoarty_mariadb >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ MariaDB container is running
) else (
    echo ❌ Failed to start MariaDB
    echo Check logs: %DOCKER_COMPOSE% logs mariadb
    pause
    exit /b 1
)

docker ps | findstr echoarty_phpmyadmin >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ phpMyAdmin container is running
) else (
    echo ⚠️  phpMyAdmin container not running
)

echo.
echo 🚀 Step 4: Starting Flask Applications...
echo.

REM Kill any existing Flask processes
taskkill /F /IM python.exe /FI "WINDOWTITLE eq api_app*" >nul 2>nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq app.py*" >nul 2>nul

REM Start API Backend
echo Starting API Backend (port 5000)...
start "EchoArty API Backend" /MIN python api_app.py
timeout /t 3 /nobreak >nul
echo ✅ API Backend started

REM Start Frontend
echo Starting Frontend (port 8080)...
start "EchoArty Frontend" /MIN python app.py
timeout /t 2 /nobreak >nul
echo ✅ Frontend started

REM Success banner
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║          ✨  Development Environment Ready!  ✨      ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Service information
echo 📊 Services:
echo    • Frontend:    http://localhost:8080
echo    • API:         http://localhost:5000
echo    • phpMyAdmin:  http://localhost:8081
echo    • Database:    localhost:3306
echo.
echo 🔐 Database Credentials:
echo    • Database: echoart
echo    • User:     echoarty_user / echoartypassword
echo    • Root:     root / rootpassword
echo.
echo 👤 Test Accounts:
echo    • Admin:    admin / admin123
echo    • Staff:    staff / staff123
echo    • Customer: customer / customer123
echo.
echo 🛑 To Stop:
echo    dev-stop.bat
echo.
echo ✨ Happy coding! ✨
echo.
pause
