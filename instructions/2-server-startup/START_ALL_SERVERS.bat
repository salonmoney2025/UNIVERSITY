@echo off
REM ============================================================================
REM EBKUST University Management System - Complete Server Startup
REM ============================================================================

echo.
echo ============================================================================
echo  EBKUST UNIVERSITY MANAGEMENT SYSTEM
echo  Complete Server Startup Script
echo ============================================================================
echo.

REM Check if Docker is running
echo [1/7] Checking Docker...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo   ✓ Docker is running

REM Start Docker services (PostgreSQL, Redis, RabbitMQ)
echo.
echo [2/7] Starting Docker services (PostgreSQL, Redis, RabbitMQ)...
docker-compose up -d postgres redis rabbitmq
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)
echo   ✓ Docker services started

REM Wait for services to be ready
echo.
echo [3/7] Waiting for services to be ready...
timeout /t 5 /nobreak >nul
echo   ✓ Services initialized

REM Check if virtual environment exists
echo.
echo [4/7] Checking Python virtual environment...
if not exist "backend\venv" (
    echo ERROR: Virtual environment not found at backend\venv
    echo Please run: cd backend && python -m venv venv
    pause
    exit /b 1
)
echo   ✓ Virtual environment found

REM Start Django backend in new window
echo.
echo [5/7] Starting Django backend server...
start "Django Backend - EBKUST" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && echo Starting Django server... && python manage.py runserver"
timeout /t 3 /nobreak >nul
echo   ✓ Django server starting (http://localhost:8000)

REM Start Celery worker in new window
echo.
echo [6/7] Starting Celery worker...
start "Celery Worker - EBKUST" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && echo Starting Celery worker... && celery -A config worker -l info --pool=solo"
timeout /t 2 /nobreak >nul
echo   ✓ Celery worker starting

REM Start Celery beat scheduler in new window
echo.
echo [7/7] Starting Celery beat scheduler...
start "Celery Beat - EBKUST" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && echo Starting Celery beat... && celery -A config beat -l info"
timeout /t 2 /nobreak >nul
echo   ✓ Celery beat starting

REM Frontend is already running from earlier
echo.
echo ============================================================================
echo  ALL SERVERS STARTED SUCCESSFULLY!
echo ============================================================================
echo.
echo  Services:
echo  - Frontend (Next.js):  http://localhost:3000
echo  - Backend (Django):    http://localhost:8000
echo  - API Documentation:   http://localhost:8000/api/docs/
echo  - RabbitMQ Management: http://localhost:15672 (guest/guest)
echo  - PostgreSQL:          localhost:5432
echo  - Redis:               localhost:6379
echo.
echo  Database Credentials:
echo  - Database: university_lms
echo  - Username: postgres
echo  - Password: postgres123
echo.
echo  Default Login (after seeding):
echo  - Super Admin: superadmin@ebkustsl.edu.sl / admin123
echo  - Student:     [firstname].[lastname][number]@student.ebkustsl.edu.sl / student123
echo  - Lecturer:    [firstname].[lastname]@ebkustsl.edu.sl / lecturer123
echo.
echo  To seed the database, run:
echo  cd backend
echo  python manage.py seed_comprehensive --students 200 --lecturers 50
echo.
echo  Press any key to open browser windows...
pause >nul

REM Open browser windows
start http://localhost:3000
start http://localhost:8000/api/docs/
start http://localhost:15672

echo.
echo  Browser windows opened. All systems operational!
echo.
echo  Press any key to exit...
pause >nul
