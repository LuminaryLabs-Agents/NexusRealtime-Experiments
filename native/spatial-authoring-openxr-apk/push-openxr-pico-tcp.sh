#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APK="${1:-${ROOT_DIR}/app/build/outputs/apk/debug/app-debug.apk}"
ADB_BIN="${ADB_BIN:-adb}"
PORT="${PORT:-5555}"
PACKAGE="dev.luminarylabs.spatialauthoring.openxr"

if [[ ! -f "${APK}" ]]; then
  echo "APK not found: ${APK}"
  echo "Run ./build-openxr-apk.sh first."
  exit 1
fi

"${ADB_BIN}" start-server >/dev/null
USB_DEVICE=$("${ADB_BIN}" devices | awk 'NR > 1 && $2 == "device" && $1 !~ /:/ { print $1; exit }')
if [[ -z "${USB_DEVICE}" ]]; then
  echo "No authorized USB device found. Enable USB debugging and accept the RSA prompt in the headset."
  exit 1
fi

DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip route 2>/dev/null | awk '/wlan|scope/ { for (i=1;i<=NF;i++) if ($i=="src") { print $(i+1); exit } }')
if [[ -z "${DEVICE_IP}" ]]; then
  DEVICE_IP=$("${ADB_BIN}" -s "${USB_DEVICE}" shell ip addr show wlan0 2>/dev/null | awk '/inet / { split($2,a,"/"); print a[1]; exit }')
fi
if [[ -z "${DEVICE_IP}" ]]; then
  echo "Could not detect headset Wi-Fi IP. Confirm headset and workstation are on the same network."
  exit 1
fi

echo "[Spatial Authoring OpenXR] USB device: ${USB_DEVICE}"
echo "[Spatial Authoring OpenXR] Headset IP: ${DEVICE_IP}"
"${ADB_BIN}" -s "${USB_DEVICE}" tcpip "${PORT}" >/dev/null
sleep 2
"${ADB_BIN}" connect "${DEVICE_IP}:${PORT}"
TCP_DEVICE="${DEVICE_IP}:${PORT}"
"${ADB_BIN}" -s "${TCP_DEVICE}" install -r "${APK}"
"${ADB_BIN}" -s "${TCP_DEVICE}" shell monkey -p "${PACKAGE}" -c android.intent.category.LAUNCHER 1

echo "[Spatial Authoring OpenXR] Done. Logs: ${ADB_BIN} -s ${TCP_DEVICE} logcat | grep SpatialAuthoringOpenXR"
