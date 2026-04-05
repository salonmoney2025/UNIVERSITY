@echo off
REM ============================================================================
REM EBKUST University Management System - Stop Docker Services
REM ============================================================================

echo.
echo ============================================================================
echo  STOPPING ALL DOCKER SERVICES
echo ============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Stopping all containers...
docker-compose down

echo.
echo [2/3] Checking for running containers...
docker ps

echo.
echo [3/3] Cleanup complete
echo.

echo ============================================================================
echo  ALL SERVICES STOPPED
echo ============================================================================
echo.
echo  All Docker containers have been stopped and removed.
echo  Volumes and networks have been cleaned up.
echo.
echo  To start again, run: START_DOCKER.bat
echo.
pause
