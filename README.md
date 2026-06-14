# NexusRealtime Experiments

Browser experiments that compose NexusRealtime kits into playable slices.

## Canonical route rule

Every playable game or experiment should have one base-name route. Do not add V1/V2 gallery cards. Fold successful variants back into the base folder and remove versioned playable routes once the unified implementation is in place.

The current canonical routes are tracked in:

```txt
experiments/domain-kit-cutover-manifest.json
```

## Domain-kit cutover target

New and migrated experiments should compose reusable NexusRealtime / ProtoKit domains, keep game-specific behavior in bridge or preset code, and keep renderers presentation-only.

Core target kits include:

```txt
action-input-kit
timed-pressure-director-kit
zone-field-kit
scan-survey-kit
route-checkpoint-kit
cargo-delivery-kit
agent-group-kit
resource-pressure-kit
hazard-director-kit
content-preset-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
deterministic-replay-harness
gamehost-standard-kit
```

## Next Ledge

`experiments/next-ledge/` is a cinematic grapple-climb validation demo. It imports the real NexusRealtime runtime, composes the Next Ledge cinematic ascent ProtoKit, maps browser input into `engine.nextLedge` APIs, ticks the runtime, and renders `engine.nextLedge.getSnapshot()` with Three.js.

Open `experiments/next-ledge/index.html` in a browser or serve the repository with any static file server.

Controls: Click/tap/Space release or fire grapple, A/D or arrows swing momentum, R restart, N advance sector.

Cutover target: preserve climb feel while migrating action input, route progress, risk/resource pressure, camera, feedback, and replay snapshots into domain-kit-owned state.

## Fogline Relay

`experiments/fogline-relay/` is a first-person fog-forest relay experiment. It imports NexusRealtime 0.0.1, composes stable kits with the ProtoKits render-layer-kit, keeps the Canvas renderer presentation-only, and validates renderer-agnostic visual buckets, fog volumes, volumetric light descriptors, relay scanning, objective flow, and wraith hazards.

Open `experiments/fogline-relay/index.html` in a browser or serve the repository with any static file server.

Controls: WASD move, mouse or arrow keys look, hold E scan, R restart, click canvas for pointer lock.

Cutover target: make this the canonical `scan-survey-kit` + `zone-field-kit` + `timed-pressure-director-kit` + `fogline-survey-pressure-bridge-kit` validation slice.

## Sora The Infinite

`experiments/sora-the-infinite/` is a branded aerial-flight validation demo for the generic aerial ProtoKit stack. It imports the real NexusRealtime runtime, composes `createGenericAerialAdventureKits`, maps keyboard input into `engine.genericFlightInput.setInput()`, ticks the runtime, and renders `engine.genericAerialRenderDescriptor.getState()`.

Open `experiments/sora-the-infinite/index.html` in a browser or serve the repository with any static file server.

Controls: W/S pitch, A/D bank, Space boost, debug key logs debug state.

Cutover target: preserve flight feel while normalizing checkpoint/ring state, updraft/zone state, content presets, visual descriptors, camera descriptors, GameHost state, and replay smoke coverage.

## Zombie Orchard

`experiments/zombie-orchard/` is a kit-composed survival experiment. It intentionally does not define a new engine. The game layer only composes kits, defines content, feeds input into kit APIs/resources, reads snapshots/events, and renders a canvas view.

Open `experiments/zombie-orchard/index.html` in a browser or serve the repository with any static file server.

Controls: WASD/arrows move, Shift sprint, Space dodge, E collect or pick up, mouse/J use equipped gear, 1/2/3 swap, R force next round, P pause.

Cutover target: preserve survival controls and wave pacing while aligning rounds, horde pressure, resources, pickups, weapons, orchard content, and debug state with domain-kit architecture.

## Rogue-Lite Hellscape Siege

`games/rogue-lite-hellscape-siege/` is the canonical base route for the high-fidelity rogue-lite base-defense game.

The old `games/rogue-lite-hellscape-siege-v2/` route has been folded into this base route and removed from the arcade.

Controls: WASD/arrows move, Space or mouse primary, E/Enter interact, B build, Q/C cycle, 1/2/3 select build.

Cutover target: preserve realm portals, inventory, harvesting, pickups, build blueprints, wave/core defense, FX, and renderer-only presentation while replacing local temporary kits with shared domain ProtoKits.
