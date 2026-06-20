# Spatial Authoring Native OpenXR APK

Generic native Android/OpenXR shell for headset validation.

This replaces the earlier SeedSpatial-specific naming with a reusable Spatial Authoring target.

## Current milestone

The native APK is now a right-controller guided demo for headsets that do not support hand tracking.

It includes a lightweight native DSK bridge that owns:

```txt
plain spatial object state
scene graph-like object list
selection state
transform-style scale/move methods
widget creation method
snapshot counter
native render descriptors
right-controller click progression
right-controller aim cursor when available
inverse 3DOF head-pose cursor fallback
```

The OpenXR renderer reads bridge state and draws panel-like colored objects, a controller/gaze cursor, progress pips, and a save-state indicator into stereo swapchains.

## What the headset demo shows

This is a guided spatial-authoring proof, not full freeform authoring yet.

The user only needs the right-hand controller:

```txt
Aim with right controller.
Press trigger/select to advance each authoring step.
```

The guided loop is:

```txt
1. Select an existing panel/object.
2. Move a note using controller aim.
3. Create a new widget at the cursor.
4. Resize the timer widget.
5. Capture a persistence snapshot.
6. Press again to reset for the next viewer.
```

If controller aim pose is not available, the cursor falls back to inverse 3DOF head orientation so the demo still communicates the guided build flow.

## Included

- Android Gradle project
- NativeActivity manifest
- OpenXR loader + OpenGL ES CMake build
- OpenXR Android loader init
- OpenXR instance, system, session, local reference space
- right-hand OpenXR action set for select/click and aim pose
- stereo swapchains
- frame wait/begin/end loop
- native DSK bridge state
- bridge-state OpenGL ES overlay rendering
- staged `spatial-authoring-runtime-contract.json`
- build script
- PICO ADB-over-TCP install script
- manual GitHub Actions APK/deploy workflow for a self-hosted runner

## Deferred

- full world-space panel mesh rendering
- embedded JavaScript engine for NexusRealtime JS execution
- native persistence backend
- release signing
- full hand-tracking mode for devices that support it

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
cd native/spatial-authoring-openxr-apk
chmod +x build-openxr-apk.sh
./build-openxr-apk.sh
```

Output:

```txt
native/spatial-authoring-openxr-apk/app/build/outputs/apk/debug/app-debug.apk
```

## Build and deploy with GitHub Actions

Run manually:

```txt
Actions → Make PICO APK → Run workflow
```

Artifact:

```txt
spatial-authoring-openxr-debug-apk
```

The workflow builds the APK on a GitHub-hosted runner, uploads the APK artifact, then installs it from a self-hosted runner labeled:

```txt
self-hosted
pico
```

The self-hosted runner must be a machine that can actually reach the headset over USB and/or the same local Wi-Fi network. It must have `adb` installed and available on `PATH`.

Workflow inputs:

```txt
device_ip
  Optional headset IP address. Leave empty to discover through USB.

adb_serial
  Optional adb serial. Overrides discovery.

adb_port
  Defaults to 5555.

launch_after_install
  Defaults to true.
```

Recommended first run:

```txt
device_ip: empty
adb_serial: empty
adb_port: 5555
launch_after_install: true
```

That path expects the self-hosted runner machine to have the PICO connected by USB with debugging authorized. The workflow will identify the USB device, discover the headset IP, switch ADB to TCP, connect to the headset, install the APK, launch the app, and capture recent logs.

## Push/install to PICO locally over TCP after USB identification

1. Enable Developer Mode / USB debugging on the headset.
2. Connect the headset by USB.
3. Accept the RSA debugging prompt inside the headset.
4. Make sure headset and workstation are on the same Wi-Fi network.
5. Build the APK.
6. Run:

```bash
cd native/spatial-authoring-openxr-apk
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
adb shell monkey -p dev.luminarylabs.spatialauthoring.openxr -c android.intent.category.LAUNCHER 1
```

## Debug logs

```bash
adb devices
adb -s <device-ip>:5555 logcat | grep SpatialAuthoringOpenXR
```

## Demo script

Say:

```txt
This is the Spatial Authoring Workbench running as a native OpenXR APK on PICO.
This device does not support hand tracking, so this demo uses a single right controller.
The point is to prove the authoring pipeline: controller input enters the runtime, the DSK bridge owns the meaning, and OpenXR renders the result.
```

Then perform:

```txt
1. Aim at the workbench and press trigger.
   The selected object highlights.

2. Aim somewhere else and press trigger.
   The note moves, demonstrating transform-dsk behavior.

3. Aim at an empty area and press trigger.
   A new widget appears, demonstrating widget-dsk creation.

4. Press trigger again.
   The timer resizes, demonstrating another transform patch.

5. Press trigger again.
   The lower save indicator turns green/pulses, demonstrating persistence snapshot.

6. Press trigger once more.
   The demo resets for the next person.
```

Close with:

```txt
This is not the final authoring UI. It validates the headset pipeline, native OpenXR runtime, controller input route, DSK-owned state changes, and deploy loop. The next step is replacing the guided controller steps with real object-level editing commands.
```
