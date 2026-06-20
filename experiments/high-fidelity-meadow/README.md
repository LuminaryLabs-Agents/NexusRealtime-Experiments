# High Fidelity Meadow

A WebGL-only NexusRealtime Experiment for validating a high-fidelity procedural meadow scene on branch `0.0.2`.

## Cutover boundary

This experiment now owns the playable app layer:

- semantic HTML host
- Three.js/WebGL renderer setup
- scene-specific mesh assembly
- shader source used by this proof
- post-processing pass
- 20-minute procedural countryside audio arrangement
- camera controls and `window.GameHost`

ProtoKits now stay in their intended role: reusable renderer-independent domain services and descriptors.

The active experiment imports current `NexusRealtime-ProtoKits@0.0.2/protokits/high-fidelity-meadow-kits/index.js` for:

- terrain field sampling
- wind field sampling
- grass instance buffer intent
- procedural structure descriptors
- particle VFX descriptors
- creature/herd descriptors
- creature animation descriptors
- fur/wool/hair descriptors
- sky atmosphere descriptors
- meadow visual target descriptors
- meadow simulation mode diagnostics

No playable meadow app, Three.js scene, Canvas host, requestAnimationFrame loop, or WebGL mesh creation belongs in ProtoKits.

## Current files

- `index.html` — semantic experiment shell.
- `src/main-aaa.js` — experiment boot, Three.js scene, renderer loop, debug host, and audio unlock.
- `src/meadow-experiment-scene.js` — experiment-owned scene descriptor generator composed from current ProtoKit domains.
- `src/procedural-renderers-cutover.js` — experiment-owned Three.js mesh assembly for grass, cottage, sheep, pollen, sky, and camera controls.
- `src/aaa-terrain-cutover.js` — experiment-owned terrain mesh adapter using the experiment scene sampler.
- `src/aaa-clouds.js` — high distant cloud deck.
- `src/aaa-postprocess.js` — post-process pass.
- `src/aaa-audio.js` — soft procedural countryside audio.

## Controls

- Drag: orbit camera
- Wheel: dolly camera
- Space: change cinematic camera beat
- R: regenerate wind-phase timing
- Click/tap/key: unlock procedural audio

## Validation intent

The experiment should prove whether the general meadow/domain ProtoKits can support a good-looking, playable, inspectable WebGL composition without putting app code into the ProtoKits repo.
