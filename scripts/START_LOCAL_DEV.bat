@echo off
REM ============================================================================
REM EBKUST University Management System - Local Development Startup
REM ============================================================================
REM This script starts the system WITHOUT Docker for local development
REM ============================================================================

echo.
echo ============================================================================
echo  EBKUST UNIVERSITY MANAGEMENT SYSTEM
echo  Local Development Mode (No Docker Required)
echo ============================================================================
echo.

REM Get the script directory
set PROJECT_ROOT=%~dp0

echo [INFO] Starting servers for local development...
echo.

REM ============================================================================
REM 1. START DJANGO BACKEND
REM ============================================================================
echo [1/3] Starting Django Backend Server...
echo.

cd /d "%PROJECT_ROOT%backend"

REM Check if virtual environment exists
if not exist "venv" (
    echo [WARNING] Virtual environment not found. Creating one...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        echo [FIX] Make sure Python is installed: https://python.org
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
    echo [INFO] Installing dependencies...
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    echo [OK] Virtual environment found
)

REM Start Django in a new window
echo [STARTING] Django backend on http://localhost:8000
start "Django Backend - EBKUST" cmd /k "cd /d %PROJECT_ROOT%backend && venv\Scripts\activate && python manage.py runserver"
timeout /t 3 /nobreak >nul

REM ============================================================================
REM 2. START NEXT.JS FRONTEND
REM ============================================================================
echo.
echo [2/3] Starting Next.js Frontend Server...
echo.

cd /d "%PROJECT_ROOT%frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] node_modules not found. Running npm install...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        echo [FIX] Make sure Node.js is installed: https://nodejs.org
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
) else (
    echo [OK] node_modules found
)

REM Start Next.js in a new window
echo [STARTING] Next.js frontend on http://localhost:3000
start "Next.js Frontend - EBKUST" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"
timeout /t 3 /nobreak >nul

REM ============================================================================
REM 3. START RUST API (OPTIONAL)
REM ============================================================================
echo.
echo [3/3] Starting Rust API Server (Optional)...
echo.

REM Check if Rust is installed
where cargo >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    cd /d "%PROJECT_ROOT%rust"
    if exist "Cargo.toml" (
        echo [STARTING] Rust API on http://localhost:8081
        echo [NOTE] First compile may take 5-10 minutes...
        start "Rust API - EBKUST" cmd /k "cd /d %PROJECT_ROOT%rust && cargo run --bin api"
        timeout /t 2 /nobreak >nul
    ) else (
        echo [SKIP] Rust project not found
    )
) else (
    echo [SKIP] Rust not installed (optional - system works without it)
    echo [INFO] To install Rust: https://rustup.rs/
)

REM ============================================================================
REM SUMMARY
REM ============================================================================
echo.
echo ============================================================================
echo  SERVERS STARTED SUCCESSFULLY!
echo ============================================================================
echo.
echo  Running Services:
echo  - Django Backend:  http://localhost:8000
echo  - Next.js Frontend: http://localhost:3000
echo  - Rust API:        http://localhost:8081 (optional)
echo.
echo  Quick Links:
echo  - Application:     http://localhost:3000
echo  - API Docs:        http://localhost:8000/api/docs/
echo  - Django Admin:    http://localhost:8000/admin/
echo.
echo  Database: SQLite (backend/db.sqlite3)
echo  No Docker required for local development!
echo.
echo  To stop servers:
echo  - Close each terminal window OR press Ctrl+C in each window
echo  - Or run: STOP_SERVERS.ps1
echo.
echo ============================================================================
echo.

REM Open browser
timeout /t 3 /nobreak
start http://localhost:3000
start http://localhost:8000/api/docs/

echo [SUCCESS] All systems ready! Check the browser windows.
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
