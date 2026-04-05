@echo off
REM ============================================================================
REM EBKUST University Management System - Docker Startup Script
REM ============================================================================
REM This script starts ALL services using Docker Compose
REM ============================================================================

echo.
echo ============================================================================
echo  EBKUST UNIVERSITY MANAGEMENT SYSTEM
echo  Docker Startup - Complete System
echo ============================================================================
echo.

REM Navigate to project root
cd /d "%~dp0"

REM ============================================================================
REM STEP 1: Check Docker Installation
REM ============================================================================
echo [STEP 1/6] Checking Docker installation...
echo.

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

docker --version
echo [OK] Docker is installed
echo.

REM ============================================================================
REM STEP 2: Check if Docker Desktop is Running
REM ============================================================================
echo [STEP 2/6] Checking Docker Desktop status...
echo.

docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker Desktop is not running!
    echo [ACTION] Starting Docker Desktop...
    echo.

    REM Start Docker Desktop
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    echo [WAIT] Waiting for Docker Desktop to start (this may take 30-60 seconds)...
    echo.

    REM Wait for Docker to be ready (max 2 minutes)
    set /a counter=0
    :wait_loop
    timeout /t 5 /nobreak >nul
    docker ps >nul 2>&1
    if %ERRORLEVEL% EQU 0 goto docker_ready

    set /a counter+=1
    if %counter% GEQ 24 (
        echo [ERROR] Docker Desktop failed to start within 2 minutes
        echo [FIX] Please start Docker Desktop manually and run this script again
        pause
        exit /b 1
    )

    echo [WAIT] Still waiting... (%counter%/24)
    goto wait_loop

    :docker_ready
    echo [SUCCESS] Docker Desktop is running!
    echo.
) else (
    echo [OK] Docker Desktop is already running
    echo.
)

REM ============================================================================
REM STEP 3: Check Environment File
REM ============================================================================
echo [STEP 3/6] Checking environment configuration...
echo.

if not exist ".env" (
    echo [WARNING] .env file not found!
    echo [ACTION] Copying from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [SUCCESS] Created .env file
    ) else (
        echo [ERROR] .env.example not found!
        echo [FIX] Please create a .env file with your configuration
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file exists
)
echo.

REM ============================================================================
REM STEP 4: Stop Any Running Containers
REM ============================================================================
echo [STEP 4/6] Stopping any existing containers...
echo.

docker-compose down >nul 2>&1
echo [OK] Cleaned up old containers
echo.

REM ============================================================================
REM STEP 5: Build and Start All Services
REM ============================================================================
echo [STEP 5/6] Building and starting all Docker services...
echo.
echo This may take several minutes on first run...
echo.

REM Build and start all services
docker-compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Docker services!
    echo [FIX] Check the error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] All services started!
echo.

REM ============================================================================
REM STEP 6: Wait for Services to Be Ready
REM ============================================================================
echo [STEP 6/6] Waiting for services to be healthy...
echo.

echo [WAIT] Database and cache services initializing...
timeout /t 10 /nobreak >nul

echo [WAIT] Backend services starting...
timeout /t 15 /nobreak >nul

echo [WAIT] Frontend compiling...
timeout /t 10 /nobreak >nul

echo.
echo [OK] Services should be ready!
echo.

REM ============================================================================
REM DISPLAY STATUS
REM ============================================================================
echo ============================================================================
echo  SYSTEM STATUS
echo ============================================================================
echo.

docker-compose ps

echo.
echo ============================================================================
echo  SERVICE URLS
echo ============================================================================
echo.
echo  [FRONTEND]  Next.js Application:  http://localhost:3000
echo  [BACKEND]   Django API:           http://localhost:8000
echo  [API DOCS]  Swagger Documentation: http://localhost:8000/api/docs/
echo  [ADMIN]     Django Admin Panel:   http://localhost:8000/admin/
echo  [RUST API]  High-Performance API: http://localhost:8081
echo  [RABBITMQ]  Management UI:        http://localhost:15672
echo  [NGINX]     Reverse Proxy:        http://localhost:80
echo.
echo  Default Login Credentials:
echo  - Username: superadmin@ebkustsl.edu.sl
echo  - Password: admin123
echo  - RabbitMQ: guest / guest
echo.
echo ============================================================================
echo  USEFUL COMMANDS
echo ============================================================================
echo.
echo  View logs:           docker-compose logs -f
echo  View specific logs:  docker-compose logs -f backend
echo  Stop all services:   docker-compose down
echo  Restart a service:   docker-compose restart backend
echo  Execute command:     docker-compose exec backend python manage.py ...
echo  Database shell:      docker-compose exec postgres psql -U postgres university_lms
echo.
echo ============================================================================
echo.

REM ============================================================================
REM OPEN BROWSER
REM ============================================================================
echo [INFO] Opening browser windows...
echo.

timeout /t 3 /nobreak >nul

start http://localhost:3000
start http://localhost:8000/api/docs/

echo.
echo ============================================================================
echo  SYSTEM READY!
echo ============================================================================
echo.
echo  All services are running in Docker containers.
echo  Check the browser windows that just opened.
echo.
echo  To stop all services, run: docker-compose down
echo.
echo  Press any key to exit (services will keep running in background)...
pause >nul
