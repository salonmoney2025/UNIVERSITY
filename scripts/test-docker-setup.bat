@echo off
REM ===========================================
REM EBKUST University Management System
REM Docker Setup Testing Script (Windows)
REM ===========================================

setlocal enabledelayedexpansion

set TESTS_PASSED=0
set TESTS_FAILED=0
set TESTS_TOTAL=0

echo =========================================
echo EBKUST University Docker Setup Tests
echo =========================================
echo.

REM Test 1: Docker installed
set /a TESTS_TOTAL+=1
echo [TEST] Checking if Docker is installed...
docker --version >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] Docker is not installed
    set /a TESTS_FAILED+=1
) else (
    docker --version
    echo   [PASS] Docker is installed
    set /a TESTS_PASSED+=1
)
echo.

REM Test 2: Docker running
set /a TESTS_TOTAL+=1
echo [TEST] Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] Docker is not running
    echo   [INFO] Please start Docker Desktop
    set /a TESTS_FAILED+=1
) else (
    echo   [PASS] Docker is running
    set /a TESTS_PASSED+=1
)
echo.

REM Test 3: Docker Compose installed
set /a TESTS_TOTAL+=1
echo [TEST] Checking if Docker Compose is installed...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] Docker Compose is not installed
    set /a TESTS_FAILED+=1
) else (
    docker compose version
    echo   [PASS] Docker Compose is installed
    set /a TESTS_PASSED+=1
)
echo.

REM Test 4: Environment file exists
set /a TESTS_TOTAL+=1
echo [TEST] Checking environment file...
if exist .env (
    echo   [PASS] Environment file found: .env
    set /a TESTS_PASSED+=1
) else (
    echo   [FAIL] Environment file not found: .env
    echo   [INFO] Copy .env.example to .env
    set /a TESTS_FAILED+=1
)
echo.

REM Test 5: Docker Compose file exists
set /a TESTS_TOTAL+=1
echo [TEST] Checking docker-compose.yml...
if exist docker-compose.yml (
    echo   [PASS] docker-compose.yml found
    set /a TESTS_PASSED+=1
) else (
    echo   [FAIL] docker-compose.yml not found
    set /a TESTS_FAILED+=1
)
echo.

REM Test 6: Dockerfile exists (frontend)
set /a TESTS_TOTAL+=1
echo [TEST] Checking frontend Dockerfile...
if exist frontend\Dockerfile (
    echo   [PASS] frontend/Dockerfile found
    set /a TESTS_PASSED+=1
) else (
    echo   [FAIL] frontend/Dockerfile not found
    set /a TESTS_FAILED+=1
)
echo.

REM Test 7: Dockerfile exists (backend)
set /a TESTS_TOTAL+=1
echo [TEST] Checking backend Dockerfile...
if exist backend\Dockerfile (
    echo   [PASS] backend/Dockerfile found
    set /a TESTS_PASSED+=1
) else (
    echo   [FAIL] backend/Dockerfile not found
    set /a TESTS_FAILED+=1
)
echo.

REM Test 8: Nginx config exists
set /a TESTS_TOTAL+=1
echo [TEST] Checking Nginx configuration...
if exist docker\nginx\nginx.conf (
    echo   [PASS] Nginx configuration found
    set /a TESTS_PASSED+=1
) else (
    echo   [FAIL] Nginx configuration not found
    set /a TESTS_FAILED+=1
)
echo.

REM Test 9: Docker Compose syntax validation
set /a TESTS_TOTAL+=1
echo [TEST] Validating Docker Compose syntax...
docker-compose config >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] Docker Compose syntax validation failed
    set /a TESTS_FAILED+=1
) else (
    echo   [PASS] Docker Compose syntax is valid
    set /a TESTS_PASSED+=1
)
echo.

REM Test 10: Disk space check
set /a TESTS_TOTAL+=1
echo [TEST] Checking disk space...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set SPACE=%%a
if defined SPACE (
    echo   [INFO] Available disk space: %SPACE% bytes
    echo   [PASS] Disk space check completed
    set /a TESTS_PASSED+=1
) else (
    echo   [INFO] Could not determine disk space
    set /a TESTS_PASSED+=1
)
echo.

REM Results Summary
echo =========================================
echo Test Results Summary
echo =========================================
echo Total Tests: %TESTS_TOTAL%
echo Passed: %TESTS_PASSED%
echo Failed: %TESTS_FAILED%
echo =========================================
echo.

if %TESTS_FAILED% EQU 0 (
    echo [SUCCESS] All tests passed!
    echo.
    echo Your Docker setup is ready for deployment!
    echo.
    echo Next steps:
    echo   1. Run: scripts\deploy-development.bat
    echo   2. Access: http://localhost:3000
    echo.
) else (
    echo [WARNING] Some tests failed
    echo.
    echo Please fix the issues above before deploying
    echo.
    echo Common fixes:
    echo   - Install Docker Desktop from docker.com
    echo   - Create .env file: copy .env.example .env
    echo   - Start Docker Desktop
    echo.
)

pause
endlocal
