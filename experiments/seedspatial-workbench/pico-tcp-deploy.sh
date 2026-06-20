#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/seedspatial-workbench/}"
ADB_BIN="${ADB_BIN:-adb}"
PORT="${PORT:-5555}"

echo "[SeedSpatial] Target URL: ${TARGET_URL}"
echo "[SeedSpatial] Starting adb server..."
"${ADB_BIN}" start-server >/dev/null

echo "[SeedSpatial] Looking for USB-connected PICO/Android device..."
USB_DEVICE=$("${ADB_BIN}" devices | awk 'NR > 1 && $2 == "device" { print $1; exit }')
if [[ -z "${USB_DEVICE}" ]]; then
  echo "No authorized USB device found."
  echo "Enable Developer Mode + USB debugging on the headset, connect USB, and accept the RSA prompt."
  exit 1
fi

echo "[SeedSpatial] USB device: ${USB_DEVICE}"
DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip route 2>/dev/null | awk '/wlan|scope/ { for (i=1;i<=NF;i++) if ($i=="src") { print $(i+1); exit } }')
if [[ -z "${DEVICE_IP}" ]]; then
  DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip addr show wlan0 2>/dev/null | awk '/inet / { split($2,a,"/"); print a[1]; exit }')
fi
if [[ -z "${DEVICE_IP}" ]]; then
  echo "Could not detect headset Wi-Fi IP. Make sure the headset and computer are on the same network."
  exit 1
fi

echo "[SeedSpatial] Headset IP: ${DEVICE_IP}"
echo "[SeedSpatial] Switching adb daemon to TCP:${PORT}..."
"${ADB_BIN}" -s "${USB_DEVICE}" tcpip "${PORT}" >/dev/null
sleep 2

echo "[SeedSpatial] Connecting over TCP..."
"${ADB_BIN}" connect "${DEVICE_IP}:${PORT}"
TCP_DEVICE="${DEVICE_IP}:${PORT}"

echo "[SeedSpatial] Launching WebXR build URL on headset..."
"${ADB_BIN}" -s "${TCP_DEVICE}" shell am start -a android.intent.action.VIEW -d "${TARGET_URL}"

echo "[SeedSpatial] Done. If the browser opens but WebXR fails, confirm HTTPS, PICO browser WebXR support, and hand-tracking permission."
