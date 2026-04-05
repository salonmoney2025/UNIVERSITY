@echo off
REM ============================================================================
REM EBKUST University Management System - Stop All Servers
REM ============================================================================

echo.
echo ============================================================================
echo  Stopping EBKUST University Management System
echo ============================================================================
echo.

echo [1/2] Stopping Docker containers...
docker-compose down
echo   ✓ Docker containers stopped

echo.
echo [2/2] Closing server windows...
echo   (Please manually close any open terminal windows)
echo   - Django Backend
echo   - Celery Worker
echo   - Celery Beat
echo   - Frontend (if running separately)

echo.
echo ============================================================================
echo  All servers stopped!
echo ============================================================================
echo.
pause
