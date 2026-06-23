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

## 2026-06-23 Deterministic Replay QA bridge smoke

`tests/signal-bastion-replay-bridge-smoke.mjs` now adds a route-level bridge guard for the currently strongest replay lane, `strategic-pressure-loop` / `signal-bastion`.

The smoke is intentionally static and renderer-host focused: it does not create reusable kit implementation in Experiments and does not replace ProtoKits `generic-defense-replay-smoke.test.mjs`. It verifies that the canonical replay manifest and lane contract still point at generic-defense ProtoKit replay, then checks the Signal Bastion host boundary:

- boot composes generic-defense simulation and presentation from ProtoKits and exposes `engine.genericDefense.getSnapshot()` / `engine.defensePresentationStack.getSnapshot()` instead of local simulation state;
- input bridges browser events into semantic DSK-facing methods such as placement confirmation, wave start, upgrade, restart, and snapshot reads;
- renderer code consumes `presentation.rawSnapshot`, UI descriptors, and Canvas/DOM presentation surfaces without owning runtime creation, kit construction, fixed ticks, or frame timing;
- host files avoid obvious replay-breaking local randomness such as `Math.random`, `Date.now`, or `crypto.getRandomValues`.

This closes a drift-visibility gap, not the executable route-domain replay gap. The remaining safest replay patch is still a browserless route-domain harness that imports the actual generic-defense DSK boundary aliases, advances fixed ticks, and proves Signal Bastion can be represented by descriptors and semantic methods without depending on Canvas, DOM, animation frames, or pointer/browser timing.

## 2026-06-23 Signal Bastion route-domain replay spec

`experiments/signal-bastion-route-domain-replay.json` now records a checked route-domain replay spec for `strategic-pressure-loop` / `signal-bastion`.

The spec captures:

- the same fixed tick plan as `experiments/headless-lane-replay-contracts.json`;
- the seven named generic-defense DSK boundaries and their resource/event/method/snapshot/descriptor surfaces;
- semantic route inputs for build placement, upgrade, wave start, and descriptor snapshot reads;
- expected resource, event, method, snapshot, descriptor, and digest fields;
- explicit browser/renderer ownership exclusions so Canvas, DOM, animation frames, pointer timing, assets, and audio stay out of reusable kit logic.

`tests/signal-bastion-route-domain-replay-spec-smoke.mjs` validates the spec against the canonical replay manifest, lane contract, existing bridge smoke, and Signal Bastion host files, and is wired into both full and deploy checks. This narrows the gap from "bridge smoke only" to "checked route-domain replay spec," but still leaves the executable replay harness open.

Next replay priority: create the executable browserless Signal Bastion harness that imports Core plus ProtoKits generic-defense DSK aliases, advances the fixed tick sequence, and asserts descriptor digests without browser presentation dependencies.

## 2026-06-23 Cycle Report Main Push Planner replay gate

The direct-main planner should not close the remaining Signal Bastion replay gap by adding fake or route-local simulation inside Experiments. The route already uses CDN imports in browser boot, while the Experiments package has no stable local dependency wiring for Core or ProtoKits imports in Node checks.

Safest next replay patch:

- either add stable package/workspace import wiring for `LuminaryLabs-Dev/NexusRealtime` and `LuminaryLabs-Agents/NexusRealtime-ProtoKits`, then write the executable browserless Signal Bastion replay against the real generic-defense DSK aliases;
- or keep the next Experiments patch to a guard smoke that asserts the executable replay remains blocked until real package imports are available, while keeping `generic-defense` simulation ownership in ProtoKits.

Do not add reusable kit logic or a duplicate defense interpreter under Experiments just to make `npm run check` execute a route replay. That would make the local JavaScript larger and blur the DSK boundary the current manifests are trying to protect.