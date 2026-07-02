# Repeatable Experiment Structure

## Purpose

Future experiment duplication should preserve playable routes while making reusable kit boundaries obvious. The route owns presentation, input binding, page shell, game-specific presets, and bridges. ProtoKits own reusable domain behavior.

## Standard Route Shape

```txt
experiments/<route-slug>/
  README.md
  index.html
  src/
    main.js
    <route-slug>-preset.js
    <route-slug>-bridge.js
    session.js
    runtime-loop.js
    renderer.js
    input-adapter.js
```

Use this shape for new canonical experiments when the route is complex enough to need files beyond a single HTML page.

## Ownership

- `README.md`: route purpose, controls, current kit stack, validation command.
- `index.html`: browser shell only.
- `main.js`: boot wiring only.
- `*-preset.js`: game-specific constants, tuning, copy, palettes, route fiction.
- `*-bridge.js`: maps route input/content into imported kit APIs.
- `session.js`: route state adapter around reusable kit surfaces.
- `runtime-loop.js`: browser frame loop and fixed/variable tick policy.
- `renderer.js`: presentation only; no reusable domain state ownership.
- `input-adapter.js`: browser input mapping only.

## Feedback Folder Shape

```txt
feedback/
  <route-slug>/
    kit-extraction-feedback.md
    kit-injector/
      context-packet.md
      response.md
```

Feedback folders are the first stop for game-specific review. They may describe extraction candidates, missing harnesses, and user-facing gaps, but they should not change gameplay by themselves.

## Kit Extraction Flow

1. Read `memory.md`, `.agent/START_HERE.md`, `.agent/cycle-state.md`, and `.agent/protokit-map.md`.
2. Read the current route README and source files.
3. Identify game-local behavior that is reusable across routes.
4. Classify each candidate as domain logic, bridge/preset logic, renderer logic, or browser/input logic.
5. Write feedback under `feedback/<route-slug>/`.
6. Use `NexusRealtime-KitInjector` to build a context packet and optional NIM proposal.
7. Implement only after a human accepts the proposal and the target repo for reusable implementation is clear.

## Do Not Move

- DOM, Canvas, WebGL, Three.js, pointer lock, browser audio, asset loading, and route-specific copy stay in the route.
- Game-specific tuning stays in presets or bridges.
- Reusable simulation, resource ledgers, pressure loops, hazards, descriptors, and replayable domain contracts move toward ProtoKits.
