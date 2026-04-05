@echo off
REM ===========================================
REM EBKUST University Management System
REM Development Environment Deployment Script
REM ===========================================
REM
REM This script starts the development environment
REM on Windows systems
REM
REM Usage: scripts\deploy-development.bat
REM
REM ===========================================

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.yml
set ENV_FILE=.env

echo =========================================
echo EBKUST University Development Deployment
echo =========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Check if .env exists
if not exist "%ENV_FILE%" (
    echo [ERROR] .env file not found
    echo Copying .env.example to .env...
    copy .env.example .env
    echo [INFO] Please configure .env before continuing
    pause
    exit /b 1
)
echo [OK] Environment file found

REM Stop existing containers
echo.
echo Stopping existing containers...
docker-compose -f %COMPOSE_FILE% down
echo [OK] Containers stopped

REM Pull latest images (optional)
echo.
echo Pulling latest images...
docker-compose -f %COMPOSE_FILE% pull
echo [OK] Images pulled

REM Build and start services
echo.
echo Building and starting services...
docker-compose -f %COMPOSE_FILE% up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)
echo [OK] Services started

REM Wait for services to be ready
echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM Run migrations
echo.
echo Running database migrations...
docker-compose -f %COMPOSE_FILE% exec backend python manage.py migrate
if errorlevel 1 (
    echo [WARNING] Migrations failed - you may need to run them manually
)

REM Show service status
echo.
echo =========================================
echo Service Status
echo =========================================
docker-compose -f %COMPOSE_FILE% ps

echo.
echo =========================================
echo Development Environment Ready!
echo =========================================
echo.
echo Access your application:
echo   Frontend: http://localhost:3000
echo   Admin Panel: http://localhost/admin
echo   API v1: http://localhost/api/v1/
echo   API v2: http://localhost/api/v2/
echo   RabbitMQ Management: http://localhost:15672 (guest/guest)
echo.
echo Useful commands:
echo   View logs: docker-compose -f %COMPOSE_FILE% logs -f
echo   Stop: docker-compose -f %COMPOSE_FILE% down
echo   Restart: docker-compose -f %COMPOSE_FILE% restart
echo.
echo Press any key to view logs (Ctrl+C to exit)...
pause >nul

docker-compose -f %COMPOSE_FILE% logs -f

endlocal
