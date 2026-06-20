$ErrorActionPreference = "Stop"

Write-Host "[PICO Runner] Checking adb..."
$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
  Write-Error "adb not found. Install Android Platform Tools and add it to PATH."
}
adb version

Write-Host "[PICO Runner] Checking connected devices..."
$devices = adb devices
$devices | ForEach-Object { Write-Host $_ }
$authorized = $devices | Select-String -Pattern "\tdevice$"
if (-not $authorized) {
  Write-Warning "No authorized device found. Connect PICO by USB, enable USB debugging, and accept the RSA prompt in-headset."
} else {
  Write-Host "[PICO Runner] Authorized adb device found."
}

Write-Host "[PICO Runner] Checking GitHub runner directory..."
$runnerDir = "C:\actions-runner"
if (Test-Path $runnerDir) {
  Write-Host "[PICO Runner] Runner directory exists: $runnerDir"
} else {
  Write-Warning "Runner directory does not exist yet: $runnerDir"
}

Write-Host "[PICO Runner] Expected labels: self-hosted,pico"
Write-Host "[PICO Runner] Preflight complete."
