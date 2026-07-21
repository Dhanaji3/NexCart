@echo off
REM Setup Gradle Wrapper for Windows
setlocal enabledelayedexpansion

set GRADLE_VERSION=8.5
set WRAPPER_DIR=gradle\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\gradle-wrapper.jar
set WRAPPER_JAR_URL=https://raw.githubusercontent.com/gradle/gradle/v%GRADLE_VERSION%/gradle/wrapper/gradle-wrapper.jar

echo.
echo Setting up Gradle Wrapper v%GRADLE_VERSION%...
echo.

REM Create wrapper directory if it doesn't exist
if not exist "%WRAPPER_DIR%" (
    mkdir "%WRAPPER_DIR%"
    echo Created wrapper directory
)

REM Check if gradle-wrapper.jar exists
if not exist "%WRAPPER_JAR%" (
    echo Downloading gradle-wrapper.jar...
    
    REM Try to download using PowerShell
    powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%WRAPPER_JAR_URL%' -OutFile '%WRAPPER_JAR%'"
    
    if exist "%WRAPPER_JAR%" (
        echo ✓ gradle-wrapper.jar downloaded successfully
    ) else (
        echo ✗ Failed to download gradle-wrapper.jar
        echo.
        echo Alternative: Copy gradle-wrapper.jar from an existing Gradle installation
        exit /b 1
    )
) else (
    echo ✓ gradle-wrapper.jar already exists
)

echo.
echo Gradle wrapper setup complete!
echo.
echo Next: Run 'gradlew bootRun' to start the Spring Boot application
echo.
