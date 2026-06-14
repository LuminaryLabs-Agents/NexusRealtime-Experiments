# Rogue-Lite Hellscape Siege

Canonical base route for the high-fidelity Rogue-Lite Hellscape Siege experiment.

Open:

```txt
/games/rogue-lite-hellscape-siege/
```

## Unified version rule

This folder is the only gallery-facing route. The earlier `rogue-lite-hellscape-siege-v2` variant has been folded into this base folder and removed from the arcade route list.

## Current implementation

The base route now owns the kit-shaped high-fidelity implementation that added:

```txt
local runtime-style kits
realm/portal loop
inventory and cargo-like resources
harvest and pickup loop
build blueprints
wave/core defense
FX descriptors consumed by the renderer
renderer-only presentation
GameHost debug hooks
```

## Controls

```txt
WASD / Arrow Keys: Move
Mouse / Space: Harvest, attack, or primary action
E / Enter: Interact
B: Build selected blueprint
Q / C: Cycle build blueprint
1 / 2 / 3: Select build blueprint
```

## Domain-kit cutover target

Next pass should replace the local temporary kits with shared ProtoKits from `NexusRealtime-ProtoKits`:

```txt
action-input-kit
resource-pressure-kit
cargo-delivery-kit
agent-group-kit
hazard-director-kit
route-checkpoint-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
gamehost-standard-kit
```

Game-specific realm, build, wave, and economy mapping should live in a Hellscape bridge/preset, not in generic domain kits.
