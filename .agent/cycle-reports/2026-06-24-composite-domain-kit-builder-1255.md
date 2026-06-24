# Composite Domain Kit Builder — 2026-06-24 12:55 ET

## Reviewed memory

- ProtoKits `.agent/intent.md`, `.agent/architecture.md`, `.agent/dsk-boundaries.md`, `.agent/cycle-state.md`, `.agent/domain-backlog.md`, `.agent/protokit-map.md`, `.agent/candidate-promotions.md`, `.agent/smoke-tests.md`, `.agent/replay-qa.md`, `.agent/route-canonicalization.md`, and `.agent/scheduled-task-cycle.md`.
- Experiments `.agent/intent.md`, `.agent/architecture.md`, `.agent/dsk-boundaries.md`, `.agent/cycle-state.md`, `.agent/domain-backlog.md`, `.agent/experiment-map.md`, `.agent/candidate-promotions.md`, `.agent/smoke-tests.md`, and `.agent/replay-qa.md`.
- Core repo was reachable, but `.agent/intent.md` and `.agent/architecture.md` were still unavailable on `main`, so Core `.agent` memory remains unreviewed and should not be treated as a source of durable intent until the folder exists.

## What changed

Pushed an Experiments-only guard/plan hardening patch for the route-cargo/extraction composite lane:

1. Added `experiments/next-ledge-route-cargo-extraction-plan.json`.
2. Added `tests/next-ledge-route-cargo-extraction-plan-smoke.mjs`.
3. Wired the new smoke into both full and deploy check suites through `scripts/run-checks.mjs`.
4. Updated `.agent/cycle-state.md` so future cycles see the checked composite-consumption gate.

No reusable kit implementation moved into Experiments. No route source was migrated to `createGenericRouteCargoExtractionKit` in this pass.

## Long-form intent from `.agent`

The durable intent remains cumulative DSK expansion: Core owns stable runtime/promoted contracts, ProtoKits owns reusable pre-Core domain kits, and Experiments stays thin by composing kits, presets, bridges, manifests, docs, tests, deterministic route specs, and renderer-only presentation. DSKs must communicate through resources, events, methods, snapshots, and descriptors rather than becoming monolithic game engines or route-local gap fillers.

## Repo state versus `.agent`

Repo state matches the memory constraints for this patch:

- Reusable composite implementation remains in ProtoKits as `generic-route-cargo-extraction-kit`.
- Experiments received only a plan JSON, a static smoke guard, check-suite wiring, and `.agent` memory.
- `next-ledge` still consumes only the atomic route-progress DSK through `engine.n.genericRouteProgress`.
- The full traversal/cargo executable lane remains explicitly unclaimed until route source consumes cargo/resource/pressure DSKs.

## DSK boundary clarity

Clearer. The new checked plan makes `engine.n.genericRouteCargoExtraction` the only acceptable future composite facade for Next Ledge route/cargo/extraction source migration, and it requires the composite to coordinate these child namespaces:

- `engine.n.genericRouteProgress`
- `engine.n.genericResourceLoop`
- `engine.n.genericPressureLoop`

The plan also keeps the route host responsible for tether physics, grapple/collision sweep, camera/visual trail state, browser input bridge, route fiction, renderer presentation, assets, and audio.

## Local experiment JavaScript

No new local JavaScript reduction is claimed. This was intentionally a guard/plan hardening patch. The actual shrink remains a future source migration that removes or centralizes real cargo/resource/pressure bookkeeping through `generic-route-cargo-extraction-kit` without moving climb physics, collision, camera, renderer, DOM, browser input, route fiction, or assets into reusable kits.

## Higher-level domains emerging

The strongest composite lane remains `delivery/extraction loop` / `traversal-cargo-pressure` above route progress, cargo/resource ledgers, and pressure channels.

Still contract-only or incubation lanes:

- `strategic-pressure-loop` remains the only executable route-domain lane through Signal Bastion.
- `survey-pressure-loop` remains planned around scan/zone/hazard/pressure.
- `aerial/open-traversal` remains planned around flight/checkpoint/camera/terrain descriptors.
- `survival-ecology` remains planned around pickups/gear/horde/hazards/resources.
- `spatial-platformer-loop` remains ProtoKits incubation only.

## ProtoKit decisions

- Keep `generic-route-progress-kit` atomic; do not rebuild another route/checkpoint kit.
- Keep `generic-route-cargo-extraction-kit` composite-only; it may coordinate route/cargo/pressure DSKs but must not absorb browser collision, route fiction, camera, renderer, DOM, Canvas/WebGL, asset loading, or hazard simulation.
- Do not promote route/cargo to Core until at least one Experiments route consumes the composite source-side and adds executable replay/spec proof.

## Experiment decisions

- Keep `next-ledge` as the first route/cargo composite candidate.
- Keep Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, and Floodplain Rescue folded as variant pressure instead of filler canonical routes.
- Keep Signal Bastion as the only executable route-domain lane until another lane consumes real reusable ProtoKit boundaries.

## Missing smoke/replay

Still missing:

1. A `next-ledge` source migration that imports/installs `generic-route-cargo-extraction-kit` only when real cargo/resource/pressure state can move behind the composite boundary.
2. A route-level fixed-tick replay or checked spec proving route progress, cargo/resource deltas, pressure deltas, descriptors, and deterministic digest fields together.
3. Evidence that local experiment JavaScript shrank from the composite migration rather than merely adding a second domain surface.
4. Core `.agent` review remains blocked because the expected files are absent on `main`.

## Safest next main-branch patch

The next safe patch is not another ProtoKit. It is a narrow Next Ledge source migration candidate:

1. Import `createGenericRouteCargoExtractionKit` from ProtoKits on `main` only if a concrete cargo/resource/pressure ledger is removed or centralized.
2. Replace the standalone route-progress kit with the composite child route-progress config while preserving `domain.routeProgress` snapshot compatibility.
3. Add `domain.routeCargoExtraction` snapshots from `engine.n.genericRouteCargoExtraction.getSnapshot()`.
4. Add one route-level spec or replay smoke that keeps `fullLaneExecutableClaim: false` until a deterministic fixed-tick route/cargo replay exists.
5. Keep all browser, DOM, Canvas, WebGL, Three.js, pointer lock, audio, asset loading, camera, collision, tether physics, and route fiction in the host.
