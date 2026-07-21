# 🚀 Project Startup Script - Setup & Run

Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          🚀 PROJECT STARTUP SCRIPT - Setup & Run                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

# Step 1: Create Gradle wrapper directory structure
Write-Host "[1/5] Setting up Gradle wrapper..." -ForegroundColor Cyan
$wrapperDir = "$projectDir\backend\backend-springboot\gradle\wrapper"
$wrapperJar = "$wrapperDir\gradle-wrapper.jar"

if (!(Test-Path $wrapperDir)) {
    New-Item -ItemType Directory -Path $wrapperDir -Force | Out-Null
    Write-Host "    Created directory structure" -ForegroundColor Gray
}

# Step 2: Download Gradle wrapper JAR if missing
if (!(Test-Path $wrapperJar)) {
    Write-Host "    Downloading gradle-wrapper.jar..." -ForegroundColor Yellow
    try {
        $source = "https://services.gradle.org/distributions/gradle-8.5-wrapper.jar"
        Invoke-WebRequest -Uri $source -OutFile $wrapperJar -TimeoutSec 60 -ErrorAction Stop
        Write-Host "    ✅ Gradle wrapper downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "    ⚠️  Could not download Gradle wrapper (network issue)" -ForegroundColor Yellow
        Write-Host "    Will attempt to run without it..." -ForegroundColor Gray
    }
}

# Step 3: Check PostgreSQL
Write-Host "`n[2/5] Checking PostgreSQL..." -ForegroundColor Cyan
$postgresRunning = $false
try {
    $result = docker ps 2>$null | Select-String "ecommerce-postgres"
    if ($result) {
        $postgresRunning = $true
        Write-Host "    ✅ PostgreSQL already running" -ForegroundColor Green
    } else {
        Write-Host "    Starting PostgreSQL container..." -ForegroundColor Yellow
        docker run --name ecommerce-postgres `
            -e POSTGRES_PASSWORD=postgres `
            -p 5432:5432 `
            -v postgres_data:/var/lib/postgresql/data `
            -d postgres:15-alpine 2>$null | Out-Null
        Start-Sleep -Seconds 3
        Write-Host "    ✅ PostgreSQL started" -ForegroundColor Green
        $postgresRunning = $true
    }
} catch {
    Write-Host "    ⚠️  Docker not available - database functionality limited" -ForegroundColor Yellow
    Write-Host "    Please install Docker or use Docker Desktop" -ForegroundColor Gray
}

# Step 4: Start Backend
Write-Host "`n[3/5] Starting Spring Boot Backend..." -ForegroundColor Cyan
Write-Host "    Location: backend/backend-springboot" -ForegroundColor Gray
$backendPath = "$projectDir\backend\backend-springboot"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; `$host.ui.RawUI.WindowTitle = 'Backend (Spring Boot - Port 8080)'; Write-Host 'Starting backend...`n'; .\gradlew.bat bootRun"
Write-Host "    ⏳ Backend window opened (startup takes 30-60 seconds)" -ForegroundColor Yellow

Start-Sleep -Seconds 5

# Step 5: Start Frontend
Write-Host "`n[4/5] Starting Vue Frontend..." -ForegroundColor Cyan
Write-Host "    Location: frontend" -ForegroundColor Gray
$frontendPath = "$projectDir\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; `$host.ui.RawUI.WindowTitle = 'Frontend (Vue 3 - Port 5000)'; Write-Host 'Installing dependencies...`n'; npm install 2>$null; Write-Host 'Starting dev server...`n'; npm run dev"
Write-Host "    ⏳ Frontend window opened (startup takes 30-45 seconds)" -ForegroundColor Yellow

# Step 6: Summary
Write-Host "`n[5/5] Showing summary..." -ForegroundColor Cyan
Write-Host "`n╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ SERVICES STARTING                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 SERVICE STATUS:" -ForegroundColor Cyan
Write-Host "  Database:      PostgreSQL 15 (port 5432)" -ForegroundColor White
if ($postgresRunning) {
    Write-Host "                 ✅ Running" -ForegroundColor Green
} else {
    Write-Host "                 ⚠️  Not available" -ForegroundColor Yellow
}

Write-Host "  Backend:       Spring Boot (port 8080)" -ForegroundColor White
Write-Host "                 ⏳ Starting..." -ForegroundColor Yellow
Write-Host "  Frontend:      Vue 3 MFE (port 5000)" -ForegroundColor White
Write-Host "                 ⏳ Starting..." -ForegroundColor Yellow

Write-Host "`n📍 URLS (Wait 30-60 seconds after seeing startup messages):" -ForegroundColor Cyan
Write-Host "  Frontend:      http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Backend API:   http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "  Swagger UI:    http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "  pgAdmin:       http://localhost:5050 (if available)" -ForegroundColor Cyan

Write-Host "`n⚡ NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Wait for both windows to show 'ready' or 'listening' messages" -ForegroundColor White
Write-Host "  2. Open http://localhost:5000 in your browser" -ForegroundColor White
Write-Host "  3. Register a new account or login" -ForegroundColor White
Write-Host "  4. Test the application (browse products, add to cart, etc.)" -ForegroundColor White

Write-Host "`n📋 TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host "  - If backend won't start: Check Java 17 is installed (java -version)" -ForegroundColor White
Write-Host "  - If frontend won't start: Check Node.js v20 is installed (node -version)" -ForegroundColor White
Write-Host "  - If database issues: Install Docker Desktop" -ForegroundColor White
Write-Host "  - Check console messages in the new windows for errors" -ForegroundColor White

Write-Host "`n[KEYBOARD SHORTCUTS]:" -ForegroundColor Cyan
Write-Host "  - Ctrl+C in any window: Stop that service" -ForegroundColor White
Write-Host "  - Backend window: Shows startup progress and API logs" -ForegroundColor White
Write-Host "  - Frontend window: Shows Vite dev server info" -ForegroundColor White

Write-Host "`n✨ Services are starting! Check the new windows for progress...`n" -ForegroundColor Green

# Wait a bit then offer to open browser
Start-Sleep -Seconds 10

Write-Host "Opening browser in 10 seconds... Press Ctrl+C to skip" -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Try to open browser
try {
    Start-Process "http://localhost:5000"
    Write-Host "✅ Browser opened to http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not auto-open browser. Manually visit: http://localhost:5000" -ForegroundColor Yellow
}

Write-Host "`n✅ Setup complete! The project is now running.`n" -ForegroundColor Green
