# SeedSpatial Native OpenXR APK

Native Android/OpenXR shell for PICO / Android XR validation.

This is the first native APK target for the SeedSpatial Workbench initiative. It is intentionally a shell: Android NativeActivity creates an OpenXR instance/session, uses OpenGL ES swapchains, enters a stereo frame loop, and stages the SeedSpatial DSK runtime contract as an asset.

## Current scope

Included:

- Android Gradle project
- NativeActivity manifest
- OpenXR loader + OpenGL ES CMake build
- OpenXR Android loader init
- OpenXR instance, system, session, local reference space
- stereo swapchains
- frame wait/begin/end loop
- simple per-eye clear rendering
- staged `seedspatial-runtime-contract.json`
- build script
- PICO ADB-over-TCP install script
- GitHub Actions APK build workflow

Deferred:

- Native JS engine bridge for NexusRealtime runtime execution
- Native DSK event bridge
- Native hand-joint gesture routing
- panel mesh rendering
- persistence backend
- release signing

## Why this is native OpenXR

The APK uses Android NativeActivity and the Khronos OpenXR loader path. The C++ entry point creates OpenXR runtime objects directly and renders through OpenXR swapchains. This is separate from the WebXR experiment at `experiments/seedspatial-workbench/`.

## Build locally

Install Android Studio or Android SDK command-line tools, including:

```txt
Android SDK Platform 35
Android Build Tools 35.0.0
Android NDK 27.2.12479018
CMake 3.22.1+
Gradle 8.10.2+
```

Then:

```bash
cd native/seedspatial-openxr-apk
chmod +x build-openxr-apk.sh
./build-openxr-apk.sh
```

Output:

```txt
native/seedspatial-openxr-apk/app/build/outputs/apk/debug/app-debug.apk
```

## Build with GitHub Actions

Run the workflow:

```txt
Build SeedSpatial OpenXR APK
```

It uploads:

```txt
seedspatial-openxr-debug-apk
```

## Push/install to PICO over TCP after USB identification

1. Enable Developer Mode / USB debugging on the headset.
2. Connect the headset by USB.
3. Accept the RSA debugging prompt inside the headset.
4. Make sure headset and workstation are on the same Wi-Fi network.
5. Build the APK.
6. Run:

```bash
cd native/seedspatial-openxr-apk
chmod +x push-openxr-pico-tcp.sh
./push-openxr-pico-tcp.sh
```

The script does this:

```txt
adb devices
adb shell ip route
adb tcpip 5555
adb connect <device-ip>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p dev.luminarylabs.seedspatial.openxr -c android.intent.category.LAUNCHER 1
```

## Debug logs

After install:

```bash
adb devices
adb -s <device-ip>:5555 logcat | grep SeedSpatialOpenXR
```

## Important limitation

This native APK proves the OpenXR app shell and deployment route. It does not yet run the JavaScript NexusRealtime DSK runtime natively. The next milestone is a bridge layer that loads the DSK state/commands into a native runtime surface or embeds a small JS engine.
