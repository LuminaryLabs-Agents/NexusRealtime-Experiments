# Spatial Authoring Workbench

Hands-only PICO/WebXR spatial authoring demo built from the NexusRealtime hand-authoring DSK stack.

This is the generic version of the earlier SeedSpatial workbench naming. The concept is now framed as a reusable spatial authoring application rather than a single branded proposal.

## DSK stack

- `webxr-hand-adapter-dsk`
- `openxr-hand-adapter-dsk`
- `hand-gesture-dsk`
- `spatial-scene-graph-dsk`
- `selection-dsk`
- `transform-dsk`
- `widget-dsk`
- `interaction-dsk`
- `persistence-dsk`

## UX loop

```txt
show hands
point at panel
pinch to select
pinch-hold and move hand to drag
two-hand pinch apart/together to resize
pinch + Note / Timer buttons to create widgets
pinch Save to capture a persistence snapshot
```

## Architecture rule

```txt
WebXR hand tracking
→ webxr-hand-adapter-dsk
→ hand-gesture-dsk
→ selection / transform / widget / interaction / persistence DSKs
→ spatial-scene-graph-dsk patches
→ renderer draws state
```

The renderer does not own authoring state. Raw XR runtime objects stay in the host/adapter boundary. DSK resources only store plain serializable state.

## Run

```txt
https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/spatial-authoring-workbench/
```

## PICO TCP launch

```bash
cd experiments/spatial-authoring-workbench
chmod +x pico-tcp-deploy.sh
./pico-tcp-deploy.sh
```

## Native path

The native OpenXR APK shell lives at:

```txt
native/spatial-authoring-openxr-apk/
```
