# Manual Tool: make PICO APK

This repo now supports PICO deployment through a manual GitHub Actions workflow only.

Issue-triggered deployment has been disabled because the repo is public and the PICO deploy job uses a self-hosted runner that can access local hardware.

## Manual workflow

Use:

```txt
Actions → Make PICO APK → Run workflow
```

Optional workflow inputs:

```txt
device_ip
  Optional PICO headset IP address. Leave empty to discover through USB.

adb_serial
  Optional adb serial, e.g. 192.168.x.x:5555. Overrides discovery.

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

## What the workflow does

The workflow is:

```txt
.github/workflows/make-pico-apk.yml
```

It:

```txt
builds the Spatial Authoring OpenXR APK
uploads the APK artifact
runs deploy on a self-hosted runner labeled `pico`
resolves the PICO headset through adb
installs the APK
launches the app
captures recent launch logs
```

## Required local runner setup

A normal GitHub-hosted runner cannot see local headset hardware.

The deploy job requires a self-hosted GitHub runner on a machine that can reach the headset.

Required runner labels:

```txt
self-hosted
pico
```

Required local tools:

```txt
adb / Android Platform Tools
USB access to the headset, or TCP ADB access to the same Wi-Fi network
```

Required headset setup:

```txt
Developer Mode enabled
USB debugging enabled
RSA debugging prompt accepted
headset connected over USB for first discovery, or already reachable over TCP
```

## Security rule

Do not re-enable issue-triggered deployment in the public repo.

The local PICO runner should only be used by manual `workflow_dispatch` runs unless the deploy flow is moved to a private repository.
