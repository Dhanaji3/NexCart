param(
    [Parameter(Mandatory = $true)]
    [string]$Destination
)

$source = 'https://downloads.gradle.org/distributions/gradle-8.5-wrapper.jar'

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {
    # ignore if older PowerShell versions don't support TLS12 assignment
}

try {
    $directory = Split-Path $Destination
    if (!(Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($source, $Destination)
    Write-Host '[OK] Gradle wrapper downloaded' -ForegroundColor Green
    exit 0
} catch {
    Write-Host '[ERROR] Failed to download Gradle wrapper' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}
