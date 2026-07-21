@echo off
setlocal enabledelayedexpansion

echo.
echo ================================================================
echo =          PROJECT STARTUP SCRIPT - Setup and Run             =
echo ================================================================
echo.

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [1/4] Preparing Gradle wrapper JAR...
set "WRAPPER_DEST=%PROJECT_DIR%backend\backend-springboot\gradle\wrapper\gradle-wrapper.jar"
set "WRAPPER_DIR=%PROJECT_DIR%backend\backend-springboot\gradle\wrapper"
set "WRAPPER_SCRIPT=%PROJECT_DIR%download-gradle-wrapper.ps1"
if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
if exist "%WRAPPER_DEST%" (
    echo [OK] Gradle wrapper already present
) else (
    echo Downloading Gradle wrapper JAR...
    certutil -urlcache -split -f "https://downloads.gradle.org/distributions/gradle-8.5-wrapper.jar" "%WRAPPER_DEST%" >nul 2>&1
    if errorlevel 1 (
        echo [WARN] certutil download failed, trying PowerShell fallback...
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%WRAPPER_SCRIPT%" -Destination "%WRAPPER_DEST%"
    )
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to setup Gradle
        echo.
        echo Please choose an alternative:
        echo   1. Install Docker Desktop and run: docker-compose up -d
        echo   2. Install Gradle manually: https://gradle.org/install/
        echo   3. Install Maven: https://maven.apache.org/install.html
        pause
        exit /b 1
    ) else (
        echo [OK] Gradle wrapper downloaded
    )
)

echo.
echo [2/4] Starting PostgreSQL (if Docker available)...
powershell -NoProfile -Command "& { try { $null = docker ps 2>&1; if ($LASTEXITCODE -eq 0) { docker run --name ecommerce-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine 2>$null; Start-Sleep -Seconds 3; Write-Host '[OK] PostgreSQL started' -ForegroundColor Green } else { Write-Host '[SKIP] Docker not available - will run backend only' -ForegroundColor Yellow } } catch { Write-Host '[SKIP] Docker not available' -ForegroundColor Yellow } }"

echo.
echo [3/4] Starting Spring Boot Backend...
cd /d "%PROJECT_DIR%backend\backend-springboot"
start "Backend (Spring Boot)" cmd /k ".\gradlew.bat bootRun"

echo.
echo [4/4] Starting Vue Frontend...
cd /d "%PROJECT_DIR%frontend"
start "Frontend (Vue 3)" cmd /k "npm install && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                  ✅ STARTUP INITIATED                             ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo Services starting in new windows:
echo   - Backend:   http://localhost:8080/swagger-ui.html
echo   - Frontend:  http://localhost:5000
echo.
echo Wait 30-60 seconds for all services to start, then open browser.
echo.
pause
