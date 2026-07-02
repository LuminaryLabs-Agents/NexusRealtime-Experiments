# Rogue-Lite Hellscape Siege Kit Extraction Feedback

## Purpose

Review `games/rogue-lite-hellscape-siege/` without editing the game. The current route stays playable while extraction candidates are documented for later ProtoKit work.

## Current Route

- Game code read: `games/rogue-lite-hellscape-siege/README.md`, `src/main.js`, `src/protokits/runtime.js`, `src/protokits/hellscape-kits.js`.
- Current local kit stack: input, FX, avatar, inventory, realm/portal, harvest/pickup, build, wave/defense, and Hellscape sequence hint.
- Renderer remains separate in `src/renderer/canvas-renderer.js`.

## Required Player Actions

Hero controls:

- Move through realms.
- Harvest resources.
- Interact with portals and the core.
- Build selected defense structures.
- Start and survive siege waves.

Advanced controls:

- Cycle/select build blueprints.
- Debug through `window.GameHost`.
- Add inventory resources for validation.
- Start waves directly for smoke/proof work.

## Extraction Candidates

| Local behavior | Candidate reusable boundary | Keep local |
| --- | --- | --- |
| input state and key aliases | `action-input-kit` mapping contract | browser event listeners and key labels |
| inventory add/spend/clear | `generic-resource-loop-kit` or `resource-pressure-kit` | Hellscape resource names and copy |
| harvest target damage and drops | `generic-resource-loop-kit` plus bridge | resource table, colors, realm fiction |
| build blueprint spend/place | generic build placement / defense session command | blueprint names, costs, presentation |
| wave queue and enemy pressure | `generic-pressure-loop-kit` and agent director | enemy fantasy, spawn tuning |
| core/player/structure targeting | generic defense DSK boundaries | Hellscape target priorities if unique |
| FX bursts/beams/flashes/shake | feedback descriptor kit | Canvas drawing and visual style |
| sequence hint text | route bridge/preset | exact copy and UI placement |

## Needed Additions Before Code Migration

- A headless smoke that can instantiate the local runtime and prove inventory, build rejection, build success, wave start, and reset behavior without a browser.
- A stable snapshot schema for inventory, build, wave, core, structures, enemies, and route prompt.
- A bridge contract that names which game-specific fields may stay in Hellscape presets.
- A rollback-safe import plan for one kit at a time.
- A comparison packet from `NexusRealtime-KitInjector` showing current local behavior, target ProtoKit surface, and functionality that must not regress.

## Do Not Change Yet

- Do not edit `games/rogue-lite-hellscape-siege/src/main.js`.
- Do not edit `games/rogue-lite-hellscape-siege/src/protokits/hellscape-kits.js`.
- Do not remove local kits before imported ProtoKit coverage is proven.
- Do not claim a second executable route-domain replay lane from docs alone.

## First Safe Implementation Slice Later

Add a browserless smoke around the existing local runtime, then use that smoke as the preservation gate before replacing the inventory/resource loop with an imported reusable kit.
