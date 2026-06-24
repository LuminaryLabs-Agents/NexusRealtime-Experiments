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

## 2026-06-23 Canonical Route Pruner import-gate replay QA

`experiments/executable-route-replay-import-gates.json` and `tests/executable-route-replay-import-gates-smoke.mjs` now make the replay-gate option from the previous planner concrete.

The gate records that `signal-bastion` is ProtoKit-backed at the lane/spec layer but still blocked from a true browserless executable replay because Experiments has no stable local dependency, workspace, or path wiring for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`. The route boot currently uses browser CDN dynamic imports, including Core from `LuminaryLabs-Dev/NexusRealtime@main` and ProtoKits generic-defense/presentation imports from `LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1`.

Replay QA implication: do not claim executable route replay until the harness imports the real Core runtime and ProtoKit generic-defense DSK aliases locally, advances the checked strategic-pressure fixed tick plan, and asserts resources, events, methods, snapshots, descriptors, and digest fields without DOM, Canvas, WebGL, Three.js, pointer lock, browser audio, asset loading, browser CDN imports, or route-local simulation copies.

## 2026-06-23 ProtoKit Promotion Gate executable route replay QA

`tests/signal-bastion-executable-route-replay-smoke.mjs` now closes the first executable route/domain replay for the canonical portfolio.

Coverage:

- imports real Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits/generic-defense-dsk-boundaries` through package wiring rather than browser CDN URLs;
- composes the Signal Bastion debug preset through the seven named generic-defense DSK aliases: map, economy wallet, build placement, wave/agent director, combat resolver, session facade, and render descriptors;
- runs the checked strategic-pressure fixed tick plan with semantic build, upgrade, wave-start, and snapshot inputs;
- asserts deterministic resource/snapshot/descriptor digest equality across fresh runs;
- keeps DOM, Canvas, WebGL, Three.js, requestAnimationFrame, browser audio, and asset loading outside the Node replay.

Remaining QA gap: the browser `games/signal-bastion/src/boot.js` still imports the broad generic-defense compatibility facade via CDN. That is acceptable for browser compatibility, but local JavaScript will not materially shrink until the route migrates toward the smallest proven DSK aliases. The next executable replay lane should not be added until a real reusable ProtoKit boundary exists; otherwise keep it as a contract-only lane.

## 2026-06-23 Deterministic Replay QA host-facade drift fix

`tests/signal-bastion-replay-bridge-smoke.mjs` was stale after the executable Signal Bastion route replay landed: it still expected a missing route-level executable fixture even though `experiments/canonical-route-replay-manifest.json` now records `routeExecutableReplayCoverage` and an empty `missingExecutableFixtures` list for `signal-bastion`.

Fix:

- `tests/signal-bastion-replay-bridge-smoke.mjs` now asserts that the executable replay gap is closed and that the manifest points at `tests/signal-bastion-executable-route-replay-smoke.mjs`.
- `tests/signal-bastion-host-facade-guard-smoke.mjs` now guards the remaining local-JS reduction seam: the browser host may keep the explicitly allowed foundation/build/wave/scale/authoring convenience facades beside the seven DSK aliases, but it must not reintroduce the broad `createGenericDefenseKits()` compatibility facade or bypass the generic-defense/session/presentation surfaces through lower-level route-owned simulation state.
- The guard is wired into both full and deploy checks because it is static and does not need package dependency install stability.

Replay QA implication: the strategic-pressure lane now has executable replay proof plus a browser-host guard for the remaining convenience-facade gap. The next executable route replay should still wait for a real reusable ProtoKit boundary in another higher-level lane; otherwise keep those lanes as checked contracts only.

## 2026-06-23 Twenty Game Refiner lane-contract replay QA closure

`experiments/headless-lane-replay-contracts.json` now mirrors the executable `signal-bastion` route replay coverage already recorded in `experiments/canonical-route-replay-manifest.json`.

Replay QA implication:

- `strategic-pressure-loop` remains the only executable route-domain lane because it is backed by real Core plus ProtoKits generic-defense DSK aliases.
- The stale strategic-pressure missing-executable text is removed from the lane contract and replaced with `routeExecutableReplayCoverage` plus the remaining browser-host facade reduction note.
- `tests/headless-lane-replay-contracts-smoke.mjs` now fails if a route gains executable replay coverage but its higher-level lane contract does not mirror that coverage, or if stale `missingExecutableFixture` text remains on an executable lane.

Next replay priority: shrink Signal Bastion browser convenience facades only where the executable replay, bridge smoke, spec smoke, and host-facade guard stay green. Keep all other lanes as contract-only until reusable ProtoKit boundaries exist.

## 2026-06-24 Canonical Route Pruner placement namespace replay guard

The ProtoKits placement projector namespace patch is now reflected in Experiments replay QA. `tests/signal-bastion-placement-namespace-contract-smoke.mjs` guards the Signal Bastion placement route-domain seam from the route side:

- the route replay spec points at ProtoKits `tests/generic-defense-placement-projector-namespace-smoke.test.mjs` as the reusable source of truth;
- `placementProjector.confirm` remains bridged to `n.genericDefense.sessionFacade.build`;
- the input host does not directly call `engine.defenseBuild.build` or legacy `engine.genericDefense.build`;
- remaining build convenience seams are explicitly limited to `setBlueprint` and `sell`.

Replay QA implication: placement is now a namespaced DSK bridge rather than an unresolved compatibility build seam. This does not add a second executable lane and does not move kit implementation into Experiments. The next strategic-pressure shrink target should be one of the remaining browser convenience seams only if the Signal Bastion executable replay plus static route guards stay green.

## 2026-06-24 ProtoKit Promotion Gate wave-preview replay guard

Signal Bastion's browser wave-preview bridge now uses the replay-facing DSK session snapshot instead of the broad wave preview convenience facade:

- `GameHost.getWavePreview()` calls `getSignalBastionWavePreview(engine)`.
- `getSignalBastionWavePreview(engine)` reads `engine.n.genericDefense.sessionFacade.getSnapshot()` and derives the next wave from `snapshot.level.waves[snapshot.session.waveIndex]`.
- `tests/signal-bastion-host-facade-guard-smoke.mjs` blocks `engine.defenseWaves.previewNextWave()` from reappearing in the browser host.

Replay QA implication: this is local host shrink on the already executable strategic-pressure lane, not a new replay lane. The remaining browser convenience seams are foundation snapshot, scale snapshot, build blueprint selection, and sell. Do not claim another executable lane until a different route consumes a real reusable ProtoKit DSK boundary.
