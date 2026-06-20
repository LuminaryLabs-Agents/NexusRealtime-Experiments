#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT_DIR}"
GRADLE_BIN="${GRADLE_BIN:-gradle}"
if [[ -x "${ROOT_DIR}/gradlew" ]]; then GRADLE_BIN="${ROOT_DIR}/gradlew"; fi

echo "[Spatial Authoring OpenXR] Building debug APK..."
"${GRADLE_BIN}" :app:assembleDebug --no-daemon
APK="${ROOT_DIR}/app/build/outputs/apk/debug/app-debug.apk"
if [[ ! -f "${APK}" ]]; then echo "Expected APK not found: ${APK}" >&2; exit 1; fi
echo "[Spatial Authoring OpenXR] Built: ${APK}"
