@echo off
REM ===========================================
REM EBKUST University Management System
REM Stop All Services Script
REM ===========================================

echo =========================================
echo Stopping EBKUST University Services
echo =========================================
echo.

REM Stop production services if running
echo Stopping production services...
docker-compose -f docker-compose.prod.yml down 2>nul
echo [OK] Production services stopped

REM Stop development services if running
echo Stopping development services...
docker-compose down 2>nul
echo [OK] Development services stopped

echo.
echo =========================================
echo All Services Stopped
echo =========================================
echo.

pause
