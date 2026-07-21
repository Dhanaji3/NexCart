# Setup Gradle Wrapper
param(
    [string]$GradleVersion = "8.5"
)

$WrapperDir = "gradle/wrapper"
$WrapperJarUrl = "https://github.com/gradle/gradle/releases/download/v$GradleVersion/gradle-$GradleVersion-bin.zip"
$GradleUserHome = if ($env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME } else { "$env:USERPROFILE\.gradle" }
$DistDir = "$GradleUserHome/wrapper/dists"

Write-Host "Setting up Gradle Wrapper v$GradleVersion..." -ForegroundColor Cyan

# Create directories if they don't exist
if (!(Test-Path $WrapperDir)) {
    New-Item -ItemType Directory -Path $WrapperDir -Force | Out-Null
}

# Download gradle-wrapper.jar if it doesn't exist
$WrapperJarPath = "$WrapperDir/gradle-wrapper.jar"
if (!(Test-Path $WrapperJarPath)) {
    Write-Host "Downloading gradle-wrapper.jar..." -ForegroundColor Yellow
    
    # Try to get from gradle repository
    $WrapperJarUrl = "https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar"
    
    try {
        Invoke-WebRequest -Uri $WrapperJarUrl -OutFile $WrapperJarPath -ErrorAction Stop
        Write-Host "✓ gradle-wrapper.jar downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to download gradle-wrapper.jar" -ForegroundColor Red
        Write-Host "Attempting alternative method..." -ForegroundColor Yellow
        Exit 1
    }
} else {
    Write-Host "✓ gradle-wrapper.jar already exists" -ForegroundColor Green
}

# Verify gradlew.bat exists and is executable
if ((Test-Path "gradlew.bat")) {
    Write-Host "✓ gradlew.bat found" -ForegroundColor Green
}

if ((Test-Path "gradlew")) {
    Write-Host "✓ gradlew found" -ForegroundColor Green
}

Write-Host "Gradle wrapper setup complete!" -ForegroundColor Green
Write-Host "" 
Write-Host "Next: Run './gradlew bootRun' to start the Spring Boot application" -ForegroundColor Cyan
