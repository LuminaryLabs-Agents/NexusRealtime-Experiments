# Fogline Relay

Fogline Relay is a NexusRealtime Experiment that validates a first-person fog-forest relay loop with real NexusRealtime runtime-kit composition and the `render-layer-kit` ProtoKit visual pipeline.

## Player promise

You are a lost signal runner in a fogged forest. Link three blue relays while avoiding red wraiths, then cross the gate that opens through the mist.

## How to run

Open `experiments/fogline-relay/index.html` in a browser, or serve the repository with any static file server and visit that path.

This experiment uses CDN module imports:

```txt
NexusRealtime@0.0.1
NexusRealtime-ProtoKits render-layer-kit pinned to commit 0083dde315d094e4406098e4c3004bc6ae149e7a
```

## Controls

```txt
WASD        move
Mouse       look, after clicking canvas for pointer lock
Arrow keys  keyboard look fallback
Hold E      scan a nearby blue relay
R           restart
```

## Folder split

```txt
experiments/fogline-relay/
  index.html
  README.md
  src/
    main.js              browser boot and error handling
    session.js           NexusRealtime imports and kit composition
    level.js             declarative level, visual, relay, gate, hazard data
    fogline-relay-kit.js experiment gameplay kit
    input-adapter.js     browser input to kit API
    renderer.js          Canvas presentation only
    hud.js               tiny three-element HUD binding
    runtime-loop.js      input -> tick -> snapshot -> draw loop
    visual-signals.js    gameplay state to renderer-agnostic visual signals
    urls.js              pinned CDN URLs
    math.js              deterministic helpers
```

## Kit stack

```txt
createRenderDescriptorKit
  Holds sceneRecipe and visualDataset.

createRealismKit
  Produces lighting, atmosphere, quality, post, and material intent.

createForestPlacementKit
  Produces deterministic forest scatter descriptors.

createRenderLayerKit from ProtoKits
  Produces render buckets, material library, fog volumes, volumetric light descriptors, and validation.

createInteractionTargetKit
  Normalizes relay descriptors as scan targets.

createFoglineRelayKit
  Owns first-person movement, relay scanning, gate state, wraith hazards, and sequence prompt state.

createObjectiveFlowKit
  Tracks scan-relays and enter-gate objective steps.
```

## Architecture notes

The Canvas host owns browser concerns only: semantic HTML, input listeners, pointer lock, resize, drawing, HUD text, error panel, and the debug host.

Gameplay rules live in `createFoglineRelayKit`; visual composition lives in the `render-layer-kit` ProtoKit; authored prompt state is exposed as sequence state on the Fogline resource.

## Debugging

The browser exposes:

```js
window.GameHost.getState()
window.GameHost.engine
window.GameHost.tick(1 / 60)
window.GameHost.stop()
window.GameHost.start()
```

Useful state paths:

```js
GameHost.getState().game
GameHost.getState().objective
GameHost.getState().visual.layers.buckets
GameHost.getState().visual.volumetric.lights
GameHost.getState().visual.validation
```

## Current experiment status

This is a playable experiment, not a promoted stable kit. Likely ProtoKit candidates after another pass:

```txt
first-person-input-kit
proximity-scan-kit
gate-objective-bridge-kit
wraith-hazard-director-kit
fogline-diegetic-feedback-kit
```
