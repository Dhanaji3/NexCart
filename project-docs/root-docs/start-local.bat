@echo off
REM Quick start script for local development on Windows

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   Vue Micro-Frontends - Local Development Quick Start         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check Docker
where docker >nul 2>nul
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    echo    Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✓ Docker detected

REM Check Docker Compose
docker compose version >nul 2>nul
if errorlevel 1 (
    docker-compose --version >nul 2>nul
    if errorlevel 1 (
        echo ❌ Docker Compose not found
        pause
        exit /b 1
    )
    set DOCKER_COMPOSE=docker-compose
) else (
    set DOCKER_COMPOSE=docker compose
)

echo ✓ Docker Compose detected
echo.

REM Start services
echo 🚀 Starting all services...
%DOCKER_COMPOSE% up -d

if errorlevel 1 (
    echo ❌ Failed to start services
    %DOCKER_COMPOSE% logs
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 5 /nobreak

REM Check PostgreSQL
echo   Checking PostgreSQL...
for /L %%i in (1,1,30) do (
    %DOCKER_COMPOSE% exec -T postgres pg_isready -U postgres >nul 2>nul
    if not errorlevel 1 (
        echo   ✓ PostgreSQL is ready
        goto check_backend
    )
    timeout /t 1 /nobreak >nul
)
echo   ⚠ PostgreSQL check timeout

:check_backend
echo   Checking Backend...
for /L %%i in (1,1,30) do (
    powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:8080/api/health' -ErrorAction Ignore).StatusCode" >nul 2>nul
    if not errorlevel 1 (
        echo   ✓ Backend is ready
        goto check_frontend
    )
    timeout /t 1 /nobreak >nul
)
echo   ⚠ Backend check timeout (still starting)

:check_frontend
echo   Checking Frontend...
for /L %%i in (1,1,10) do (
    powershell -Command "(Invoke-WebRequest -Uri 'http://localhost' -ErrorAction Ignore).StatusCode" >nul 2>nul
    if not errorlevel 1 (
        echo   ✓ Frontend is ready
        goto success
    )
    timeout /t 1 /nobreak >nul
)
echo   ⚠ Frontend still loading

:success
cls
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ All services started successfully!
echo.
echo 📱 ACCESS POINTS:
echo    • Frontend:     http://localhost
echo    • Backend API:  http://localhost:8080/api
echo    • Swagger UI:   http://localhost:8080/swagger-ui.html
echo    • pgAdmin:      http://localhost:5050
echo.
echo 🛑 TO STOP SERVICES:
echo    docker-compose down
echo.
echo 📝 TO VIEW LOGS:
echo    docker-compose logs -f backend
echo    docker-compose logs -f frontend
echo    docker-compose logs -f postgres
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
