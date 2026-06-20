# Make PICO APK Skip Fix

The first issue-triggered run could validate the trigger and skip all later jobs when `author_association` did not resolve as OWNER/MEMBER/COLLABORATOR for connector-created issues.

Fix:

```txt
The Make PICO APK issue trigger now uses exact title matching only.
```

Required issue title:

```txt
[PICO_DEPLOY] make PICO apk
```

Fresh issue events are required after this fix because already-opened issues do not re-run the `issues: opened` trigger.
