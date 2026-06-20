#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/spatial-authoring-workbench/}"
ADB_BIN="${ADB_BIN:-adb}"
PORT="${PORT:-5555}"

echo "[Spatial Authoring] Target URL: ${TARGET_URL}"
"${ADB_BIN}" start-server >/dev/null

echo "[Spatial Authoring] Looking for USB-connected PICO/Android device..."
USB_DEVICE=$("${ADB_BIN}" devices | awk 'NR > 1 && $2 == "device" { print $1; exit }')
if [[ -z "${USB_DEVICE}" ]]; then
  echo "No authorized USB device found. Enable Developer Mode + USB debugging, connect USB, and accept the RSA prompt."
  exit 1
fi

DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip route 2>/dev/null | awk '/wlan|scope/ { for (i=1;i<=NF;i++) if ($i=="src") { print $(i+1); exit } }')
if [[ -z "${DEVICE_IP}" ]]; then
  DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip addr show wlan0 2>/dev/null | awk '/inet / { split($2,a,"/"); print a[1]; exit }')
fi
if [[ -z "${DEVICE_IP}" ]]; then
  echo "Could not detect headset Wi-Fi IP. Make sure headset and computer are on the same network."
  exit 1
fi

echo "[Spatial Authoring] USB device: ${USB_DEVICE}"
echo "[Spatial Authoring] Headset IP: ${DEVICE_IP}"
"${ADB_BIN}" -s "${USB_DEVICE}" tcpip "${PORT}" >/dev/null
sleep 2
"${ADB_BIN}" connect "${DEVICE_IP}:${PORT}"
TCP_DEVICE="${DEVICE_IP}:${PORT}"
"${ADB_BIN}" -s "${TCP_DEVICE}" shell am start -a android.intent.action.VIEW -d "${TARGET_URL}"
echo "[Spatial Authoring] Launched WebXR URL over TCP ADB."
