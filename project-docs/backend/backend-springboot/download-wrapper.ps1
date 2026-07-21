$url = 'https://services.gradle.org/distributions/gradle-8.5-wrapper.jar'
$output = '.\gradle\wrapper\gradle-wrapper.jar'

Write-Host "Downloading gradle-wrapper.jar..." -ForegroundColor Cyan

$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop

if (Test-Path $output) {
    Write-Host "Successfully downloaded gradle-wrapper.jar" -ForegroundColor Green
} else {
    Write-Host "Failed to download" -ForegroundColor Red
    exit 1
}
