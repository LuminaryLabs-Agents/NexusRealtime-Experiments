# Deterministic Replay QA

Track scenario QA and deterministic replay coverage.

Replay QA should validate domain communication through resources, events, methods, snapshots, and descriptors.

Scheduled tasks should append durable findings here.

## 2026-06-23 Twenty Game Refiner replay gaps

Replay scenarios should follow the emerging higher-level domains rather than every fantasy seed.

Missing replay lanes:

- Survey-pressure replay: action input sequence for move/look/scan; expected scan progress, zone pressure, hazard event, objective state, and descriptor snapshot hashes.
- Defense/survival replay: build or gear input sequence; expected spawn cadence, resource ledger deltas, target/core health, wave outcome, and HUD descriptor hashes.
- Traversal/cargo replay: checkpoint/cargo/tether input sequence; expected route ledger, carried cargo state, pressure changes, and success/failure snapshot hashes.
- Aerial traversal replay: pitch/bank/boost/checkpoint input sequence; expected position/velocity envelope, checkpoint ledger, camera descriptor, and terrain-window descriptor hashes.
- Economy/social replay: do not canonicalize market/court/broker seeds until decision/economy/social state can replay with deterministic choice windows, ledger deltas, and outcome descriptors.

Replay priority: create one compact scenario per higher-level domain and map canonical routes onto those scenarios before adding route-specific replay files.

## 2026-06-23 Canonical Route Pruner replay map

`experiments/canonical-route-pruning-map.json` now maps each manifest canonical route to a route-level replay lane before any destructive pruning:

- `next-ledge` -> `traversal-cargo-pressure`.
- `fogline-relay` -> `survey-pressure`.
- `nexus-frontier-signal-isles` -> `field-engineer-composition`.
- `sora-the-infinite` -> `aerial-open-traversal`.
- `zombie-orchard` -> `survival-ecology`.
- `signal-bastion` -> `strategic-pressure-loop`.
- `rogue-lite-hellscape-siege` -> `action-defense-extraction`.

This is metadata coverage, not executable replay coverage. The next replay patch should create compact fixtures for the higher-level lanes instead of one-off fantasy-route replay files.

## 2026-06-23 ProtoKit Promotion Gate replay manifest

`experiments/canonical-route-replay-manifest.json` now turns the pruning lanes into a smoke-tested replay contract for every canonical route:

- `signal-bastion` is explicitly backed by ProtoKits `generic-defense-dsk-boundaries` smoke and `generic-defense` deterministic replay coverage. This makes the strategic-pressure route the strongest current promotion-gate proof.
- `fogline-relay`, `nexus-frontier-signal-isles`, `zombie-orchard`, and `rogue-lite-hellscape-siege` point at generic promotion replay primitives where they can reuse pressure/resource/action/affordance behavior, but still need route-level deterministic fixtures.
- `next-ledge` and `sora-the-infinite` remain planned replay fixtures because their route-checkpoint/cargo/tether and aerial traversal DSKs still need executable fixed-tick proof.

The manifest is validated by `tests/canonical-route-replay-manifest-smoke.mjs` and wired into both full and deploy checks. The remaining QA gap is executable route/domain replay per higher-level lane, not route discovery or metadata wiring.

## 2026-06-23 Headless Tick Smoke Builder replay-contract QA

`experiments/headless-lane-replay-contracts.json` now creates a checked replay-contract layer for all higher-level lanes before executable route/domain harnesses exist:

- `traversal-cargo-pressure` / `next-ledge`: checkpoint/cargo/tether semantic methods, route/cargo/pressure resources, and checkpoint/cargo/dropoff descriptors.
- `survey-pressure` / `fogline-relay`: scan/zone/hazard semantic methods, scan/pressure/hazard/objective resources, and scan/zone/hazard/objective descriptors.
- `field-engineer-composition` / `nexus-frontier-signal-isles`: harvest/build/unlock/completion methods, resource/build/objective/pressure resources, and node/build/beacon descriptors.
- `aerial-open-traversal` / `sora-the-infinite`: flight/checkpoint/camera methods, flight/boost/checkpoint/camera resources, and flight/checkpoint/terrain/camera descriptors.
- `survival-ecology` / `zombie-orchard`: pickup/gear/horde/hazard methods, resource/gear/agent/hazard resources, and pickup/gear/horde/health descriptors.
- `strategic-pressure-loop` / `signal-bastion`: ProtoKit-backed generic-defense build/upgrade/wave replay and descriptor coverage.
- `action-defense-extraction` / `rogue-lite-hellscape-siege`: harvest/build/wave/extraction methods, inventory/build/wave/extraction resources, and harvest/defense/core/portal descriptors.

`tests/headless-lane-replay-contracts-smoke.mjs` validates the contracts against the canonical replay manifest and deterministic digest fields. This is durable QA progress, but only the strategic-pressure lane is currently ProtoKit-backed by executable replay. The next QA step is to turn the Signal Bastion bridge contract into a route-level headless smoke that proves the browser host consumes descriptors and semantic methods without duplicating generic-defense simulation.
