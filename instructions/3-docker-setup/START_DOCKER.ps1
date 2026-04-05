# ============================================================================
# EBKUST University Management System - Docker Startup Script (PowerShell)
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  EBKUST UNIVERSITY MANAGEMENT SYSTEM" -ForegroundColor Cyan
Write-Host "  Docker Startup - Complete System" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Get project root
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# ============================================================================
# STEP 1: Check Docker Installation
# ============================================================================
Write-Host "[STEP 1/6] Checking Docker installation..." -ForegroundColor Yellow
Write-Host ""

$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "[ERROR] Docker is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop from:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

$dockerVersion = docker --version
Write-Host $dockerVersion -ForegroundColor Green
Write-Host "[OK] Docker is installed" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 2: Check if Docker Desktop is Running
# ============================================================================
Write-Host "[STEP 2/6] Checking Docker Desktop status..." -ForegroundColor Yellow
Write-Host ""

$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Docker Desktop is not running!" -ForegroundColor Yellow
    Write-Host "[ACTION] Starting Docker Desktop..." -ForegroundColor Cyan
    Write-Host ""

    # Start Docker Desktop
    $dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktopPath) {
        Start-Process $dockerDesktopPath
    } else {
        Write-Host "[ERROR] Docker Desktop not found at expected location" -ForegroundColor Red
        Write-Host "[FIX] Please start Docker Desktop manually" -ForegroundColor Yellow
        pause
        exit 1
    }

    Write-Host "[WAIT] Waiting for Docker Desktop to start (this may take 30-60 seconds)..." -ForegroundColor Yellow
    Write-Host ""

    # Wait for Docker to be ready (max 2 minutes)
    $counter = 0
    $maxAttempts = 24

    while ($counter -lt $maxAttempts) {
        Start-Sleep -Seconds 5
        $testDocker = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Docker Desktop is running!" -ForegroundColor Green
            Write-Host ""
            break
        }

        $counter++
        Write-Host "[WAIT] Still waiting... ($counter/$maxAttempts)" -ForegroundColor Yellow

        if ($counter -eq $maxAttempts) {
            Write-Host "[ERROR] Docker Desktop failed to start within 2 minutes" -ForegroundColor Red
            Write-Host "[FIX] Please start Docker Desktop manually and run this script again" -ForegroundColor Yellow
            pause
            exit 1
        }
    }
} else {
    Write-Host "[OK] Docker Desktop is already running" -ForegroundColor Green
    Write-Host ""
}

# ============================================================================
# STEP 3: Check Environment File
# ============================================================================
Write-Host "[STEP 3/6] Checking environment configuration..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found!" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "[ACTION] Copying from .env.example..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env"
        Write-Host "[SUCCESS] Created .env file" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] .env.example not found!" -ForegroundColor Red
        Write-Host "[FIX] Please create a .env file with your configuration" -ForegroundColor Yellow
        pause
        exit 1
    }
} else {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# STEP 4: Stop Any Running Containers
# ============================================================================
Write-Host "[STEP 4/6] Stopping any existing containers..." -ForegroundColor Yellow
Write-Host ""

docker-compose down 2>&1 | Out-Null
Write-Host "[OK] Cleaned up old containers" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 5: Build and Start All Services
# ============================================================================
Write-Host "[STEP 5/6] Building and starting all Docker services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This may take several minutes on first run..." -ForegroundColor Cyan
Write-Host ""

# Build and start all services
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start Docker services!" -ForegroundColor Red
    Write-Host "[FIX] Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] All services started!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 6: Wait for Services to Be Ready
# ============================================================================
Write-Host "[STEP 6/6] Waiting for services to be healthy..." -ForegroundColor Yellow
Write-Host ""

Write-Host "[WAIT] Database and cache services initializing..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "[WAIT] Backend services starting..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "[WAIT] Frontend compiling..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[OK] Services should be ready!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# DISPLAY STATUS
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SYSTEM STATUS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

docker-compose ps

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  SERVICE URLS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [FRONTEND]  Next.js Application:    " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "  [BACKEND]   Django API:             " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Green
Write-Host "  [API DOCS]  Swagger Documentation:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000/api/docs/" -ForegroundColor Green
Write-Host "  [ADMIN]     Django Admin Panel:     " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000/admin/" -ForegroundColor Green
Write-Host "  [RUST API]  High-Performance API:   " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8081" -ForegroundColor Green
Write-Host "  [RABBITMQ]  Management UI:          " -NoNewline -ForegroundColor White
Write-Host "http://localhost:15672" -ForegroundColor Green
Write-Host "  [NGINX]     Reverse Proxy:          " -NoNewline -ForegroundColor White
Write-Host "http://localhost:80" -ForegroundColor Green
Write-Host ""
Write-Host "  Default Login Credentials:" -ForegroundColor Yellow
Write-Host "  - Username: superadmin@ebkustsl.edu.sl" -ForegroundColor Gray
Write-Host "  - Password: admin123" -ForegroundColor Gray
Write-Host "  - RabbitMQ: guest / guest" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  USEFUL COMMANDS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View logs:           " -NoNewline
Write-Host "docker-compose logs -f" -ForegroundColor Cyan
Write-Host "  View specific logs:  " -NoNewline
Write-Host "docker-compose logs -f backend" -ForegroundColor Cyan
Write-Host "  Stop all services:   " -NoNewline
Write-Host "docker-compose down" -ForegroundColor Cyan
Write-Host "  Restart a service:   " -NoNewline
Write-Host "docker-compose restart backend" -ForegroundColor Cyan
Write-Host "  Execute command:     " -NoNewline
Write-Host "docker-compose exec backend python manage.py ..." -ForegroundColor Cyan
Write-Host "  Database shell:      " -NoNewline
Write-Host "docker-compose exec postgres psql -U postgres university_lms" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# OPEN BROWSER
# ============================================================================
Write-Host "[INFO] Opening browser windows..." -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 3

Start-Process "http://localhost:3000"
Start-Process "http://localhost:8000/api/docs/"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  SYSTEM READY!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  All services are running in Docker containers." -ForegroundColor White
Write-Host "  Check the browser windows that just opened." -ForegroundColor White
Write-Host ""
Write-Host "  To stop all services, run: " -NoNewline -ForegroundColor White
Write-Host "docker-compose down" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press any key to exit (services will keep running in background)..." -ForegroundColor Gray
pause
