# Make PICO APK Trigger Example

Use this issue title to trigger the chat-driven deployment workflow:

```txt
[PICO_DEPLOY] make PICO apk
```

Default body:

```txt
device_ip:
adb_serial:
adb_port: 5555
launch_after_install: true
```

Leaving `device_ip` and `adb_serial` empty makes the self-hosted `pico` runner discover the headset over USB first, switch it to TCP ADB, install the APK, and launch it.
