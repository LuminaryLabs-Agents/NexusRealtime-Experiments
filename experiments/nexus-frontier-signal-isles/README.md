# Nexus Frontier: Signal Isles

## Promise

The player is a field engineer restoring a broken living-island beacon by scanning ruins, harvesting signal shards, building a mast, surviving pressure, unlocking a gate, delivering cargo, and activating the final beacon.

## Core loop

Observe, scan, harvest, build, survive pressure, unlock, route, deliver, activate, inspect debug state, and replay.

## Architecture

This route follows the NexusRealtime rule that a game is composed from Runtime + Kits + Data + Sequences + Host. The browser and Three.js host own presentation, input collection, scene sync, and debug exposure only. Objective truth, resource truth, scan truth, route truth, and completion truth live in kit-shaped state and the experiment composition bridge.

## Kit utilization strategy

The showcase installs or references the broad existing kit graph instead of creating a branded game kit. The level data lists the concrete kit stack, and `game-composition.js` routes facts through the standard GameHost/debug contract.

## Kits used

Foundation and contracts: `foundation-kit`, `token-registry-kit`.

Input and interaction: `action-input-kit`, `spatial-interaction-kit`.

World and environment: `zone-field-kit`, `biome-field-kit`, `vegetation-archetype-kit`, `ground-contact-kit`, `vegetation-lod-kit`, `scatter-object-kit`, `surface-material-kit`.

Scan, progression, route, and cargo: `scan-survey-kit`, `completion-ledger-kit`, `objective-bridge-kit`, `lock-group-kit`, `route-checkpoint-kit`, `cargo-delivery-kit`.

Resources and structures: `resource-pressure-kit`, `resource-node-kit`, `build-placement-kit`, `structure-runtime-kit`.

Pressure, hazards, agents, and health: `timed-pressure-director-kit`, `encounter-director-kit`, `agent-group-kit`, `hazard-director-kit`, `damage-health-kit`.

Feedback and host descriptors: `diegetic-feedback-signal-kit`, `asset-descriptor-kit`, `visual-fidelity-maker-kit`, `audio-event-feedback-maker-kit`, `camera-cinematic-maker-kit`.

QA: `scenario-qa-harness`, `deterministic-replay-harness`, `gamehost-standard-kit`.

## Data model

`src/level-01.js` is declarative data only. It defines one island sector, three scan sites, two resource nodes, one build site, one gate, one route checkpoint, one pressure wave, one hazard field, one agent group, one cargo object, one final beacon, objectives, vegetation descriptors, and the kit utilization inventory.

## Sequences

`src/sequences.js` defines intro, first scan, first resource, first build, pressure wave, gate unlock, cargo delivery, final beacon completion, failure recovery, and restart sequences.

## Host boundary

`src/renderer.js` draws snapshots and performs pointer picking to ids only. It does not mutate completion facts or objectives. `src/input-adapter.js` maps keys and pointer state into composition actions. `src/debug-host.js` exposes the standard inspection surface.

## UI rule

The normal play UI has two visible overlay elements: a tiny objective/status pill and a tiny controls/rejection pill. Deeper inspection is through `window.GameHost`.

## Tests

- `tests/signal-isles-static-smoke.mjs`
- `tests/signal-isles-data-smoke.mjs`
- `tests/signal-isles-replay-smoke.mjs`

## How to run

Open:

```txt
experiments/nexus-frontier-signal-isles/index.html
```

Controls:

```txt
WASD move
Mouse look after pointer lock
F or mouse hold scan
E interact, harvest, cargo, activate
B build
R reset
```

## Debug state

```js
GameHost.getState()
GameHost.getKitStates()
GameHost.getObjectiveState()
GameHost.getSequenceState()
GameHost.getRecentEvents()
GameHost.getLastRejection()
GameHost.getReplaySnapshot()
GameHost.tick(1 / 60)
GameHost.reset()
```

## Promotion decision

No new generic kit was added. The experiment bridge should be split only after one more configuration proves what should become a reusable `inventory-cargo-kit`, `structure-action-kit`, `route-graph-kit`, `hazard-field-kit`, or `gameplay-snapshot-contract-kit`.
