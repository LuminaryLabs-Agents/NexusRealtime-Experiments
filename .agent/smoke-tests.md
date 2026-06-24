# Headless Tick Smoke Tests

Track headless validation coverage for routes, kits, domain boundaries, and scenarios.

Every meaningful domain boundary should move toward fixed-tick validation without relying on browser rendering.

Scheduled tasks should append durable findings here.

## 2026-06-23 Twenty Game Refiner gaps

The current strongest route pressure is not a route-count problem; it is a fixed-tick boundary coverage problem.

Missing or under-specified smoke coverage:

- Canonical cutover manifest smoke: assert each `canonicalRoutes[]` entry has an existing route `index.html`, non-empty `domainCutover`, and a bridge/preset ownership note, then separately assert seed routes are not silently treated as canonical.
- Survey-pressure smoke: fixed seed scan target registration, zone pressure tick progression, hazard escalation, objective completion, and renderer-agnostic descriptor snapshot for `fogline-relay` plus cartographer/survey seeds.
- Defense/survival smoke: path/wave spawn, build or pickup action, resource spend/gain, vital target damage, wave completion, and descriptor-only HUD/event output for `signal-bastion`, `zombie-orchard`, and `rogue-lite-hellscape-siege`.
- Traversal/cargo smoke: checkpoint enter/exit, cargo pickup/dropoff, tether or vehicle contact, resource pressure change, and route-complete snapshot for `next-ledge`, `tideglass-salvage`, `skyrig-suture`, and courier/harbor seeds.
- Aerial traversal smoke: deterministic flight input ticks, updraft/terrain-window descriptors, checkpoint crossing, camera rig snapshot, and route completion for `sora-the-infinite` / `the-open-above` harnesses.
- Economy/social smoke: keep `clockwork-verdict`, `rift-bazaar`, `market` and broker seeds non-canonical until a decision/economy/social DSK can expose headless resources, events, methods, snapshots, and descriptors.

## 2026-06-23 Cycle Report Main Push Planner smoke closure

- Added `tests/domain-cutover-manifest-smoke.mjs` so the canonical cutover manifest now proves each canonical entry has a real route `index.html`, non-empty `domainCutover`, bridge/preset ownership, and a generated gallery route/id match.
- Wired the new smoke into both `npm run check` and `npm run check:deploy` through `scripts/run-checks.mjs`, which also removes the overlong inline test command from `package.json`.
- This closes the first manifest-vs-gallery drift visibility gap without deleting routes or promoting seed/backlog routes.

Next smoke priority: route-level smoke/replay manifests that map each canonical route to the ProtoKit/domain replay scenario it validates.

## 2026-06-23 Canonical Route Pruner smoke closure

- Added `tests/canonical-route-pruning-map-smoke.mjs` and wired it into both full and deploy check suites.
- Added `experiments/canonical-route-pruning-map.json` so every manifest-owned canonical route now has a test-visible pruning issue with variants/backlog to fold, manifest/docs updates, local JavaScript to move toward ProtoKits, smoke/replay lanes to preserve, and about-20 portfolio effect.
- This closes the route-level replay-manifest metadata gap noted by the prior cycle report, but it does not yet add executable fixed-tick route simulations.

## 2026-06-23 ProtoKit Promotion Gate replay-manifest closure

- Added `experiments/canonical-route-replay-manifest.json` so every canonical route now has one route-level replay contract mapped to its pruning lane, host role, ProtoKit replay coverage when available, missing executable fixtures, and local JavaScript reduction opportunities.
- Added `tests/canonical-route-replay-manifest-smoke.mjs` and wired it into full and deploy checks so replay mapping cannot drift away from the cutover manifest or pruning map.
- Signal Bastion now explicitly points at ProtoKits `tests/generic-defense-dsk-boundaries-smoke.test.mjs` and `tests/generic-defense-replay-smoke.test.mjs` as its reusable strategic-pressure replay proof.
- Other canonical routes remain planned fixtures, but their missing replay lanes are now test-visible instead of implicit.

Next smoke priority: implement one compact fixed-tick route/domain scenario per higher-level lane: survey pressure, strategic pressure bridge consumption, survival ecology, traversal/cargo, aerial traversal, field-engineer composition, and action-defense-extraction.

## 2026-06-23 Headless Tick Smoke Builder lane-contract closure

- Added `experiments/headless-lane-replay-contracts.json` so each higher-level lane now has a compact fixed-tick replay contract with semantic inputs, minimal config/entities, required resource/event/method/snapshot/descriptor assertions, deterministic digest fields, browser ownership exclusions, missing executable fixture notes, and local JavaScript reduction pressure.
- Added `tests/headless-lane-replay-contracts-smoke.mjs` and wired it into both full and deploy check suites. The smoke asserts lane contracts stay aligned with `experiments/canonical-route-replay-manifest.json`, preserve renderer-free ownership boundaries, cover every canonical route assigned to each lane, and keep the five DSK communication surfaces visible.
- This turns the replay-lane gap into a checked contract layer before adding executable simulations. It is not yet a substitute for route/domain code that imports Core/Protokits and advances real fixed ticks.

Next smoke priority: convert one contract into executable headless replay. Safest first lane is `strategic-pressure-loop`, because Signal Bastion already has ProtoKit-backed generic-defense replay coverage; the route-level bridge smoke should assert the host consumes descriptors without re-owning defense simulation.

## 2026-06-23 Deterministic Replay QA bridge-smoke closure

- Added `tests/signal-bastion-replay-bridge-smoke.mjs` and wired it into both full and deploy check suites through `scripts/run-checks.mjs`.
- The smoke guards the `strategic-pressure-loop` / `signal-bastion` replay lane by checking the replay manifest, lane contract, ProtoKit generic-defense coverage, boot composition, input semantic bridge methods, renderer descriptor consumption, and absence of obvious route-local randomness.
- This is a bridge-boundary smoke, not a browserless executable route replay. It keeps the remaining gap explicit while preventing regression where Signal Bastion drifts back into owning defense simulation, runtime construction in renderer/input files, or browser-timing-dependent replay state.

Next smoke priority: replace the remaining static bridge gap with a compact browserless Signal Bastion route-domain replay that imports the smallest generic-defense DSK aliases, runs fixed ticks, and asserts descriptor digests plus semantic-method/event/snapshot boundaries.

## 2026-06-23 Signal Bastion route-domain replay spec closure

- Added `experiments/signal-bastion-route-domain-replay.json` to pin the strategic-pressure replay shape for `signal-bastion`: fixed tick plan, semantic replay inputs, seven generic-defense DSK boundaries, expected resources/events/methods/snapshots/descriptors, renderer-free digest fields, and host ownership exclusions.
- Added `tests/signal-bastion-route-domain-replay-spec-smoke.mjs` and wired it into both full and deploy checks. The smoke validates the spec against the canonical replay manifest, headless lane contract, Signal Bastion route host files, and the existing bridge smoke.
- This is stronger than the prior static bridge check because the replay plan now has a checked route-domain spec, but it is still not the final browserless executable replay that imports Core plus ProtoKits and advances real fixed ticks.

Next smoke priority: replace the spec with, or supplement it by, an executable route replay harness that imports the generic-defense DSK aliases from ProtoKits and Core, runs the fixed-tick strategic-pressure sequence, and asserts descriptor digests without Canvas, DOM, animation frames, browser audio, asset loading, or pointer timing.

## 2026-06-23 Canonical Route Pruner import-gate smoke closure

- Added `experiments/executable-route-replay-import-gates.json` and `tests/executable-route-replay-import-gates-smoke.mjs`.
- Wired the import-gate smoke into both full and deploy check suites.
- The smoke protects the remaining `signal-bastion` executable replay gap by proving the route still uses browser CDN dynamic imports, Experiments still lacks stable local Core/ProtoKits package wiring, and any future package-wiring change must update the gate before an executable replay can be claimed.
- The smoke also forbids route-local generic-defense interpreters, copied ProtoKit fixtures under Experiments, browser CDN imports inside Node replay, DOM/Canvas-owned simulation shims, and V1/V2/V3 Signal Bastion route forks as replay shortcuts.

Next smoke priority: add stable local package/workspace/path wiring for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`, then add the real browserless Signal Bastion executable replay against generic-defense DSK aliases.

## 2026-06-23 ProtoKit Promotion Gate executable replay closure

- Added package-level dev dependency wiring for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`, then updated `experiments/executable-route-replay-import-gates.json` from blocked to `satisfied-by-package-wiring`.
- Added `tests/signal-bastion-executable-route-replay-smoke.mjs`. It imports real Core plus ProtoKits `generic-defense-dsk-boundaries`, composes the Signal Bastion debug preset through the seven named DSK aliases, runs the checked 30 x 0.1s fixed-tick strategic-pressure plan, compares deterministic resource/snapshot/descriptor digests across fresh runs, and asserts browser ownership exclusions.
- Wired the executable replay into the full `npm run check` suite only. It is intentionally not in `check:deploy` yet so dependency install behavior can settle before deploy checks depend on GitHub package imports.
- This closes the first browserless route-domain executable replay for the strongest canonical route without adding reusable kit logic or copied ProtoKit fixtures to Experiments.

Next smoke priority: migrate the browser Signal Bastion host from broad generic-defense compatibility imports toward the smallest proven DSK aliases, then repeat the executable-replay pattern for the next lane only after a real ProtoKit boundary exists.

## 2026-06-23 Headless Tick Smoke Builder browser DSK bridge closure

- `games/signal-bastion/src/boot.js` now imports the ProtoKits `generic-defense-aaa-dsk-bridge` CDN module and composes the seven named generic-defense DSK aliases instead of calling the broad `createGenericDefenseKits()` compatibility facade.
- Signal Bastion bridge/spec/import-gate/static smokes now assert the browser host keeps the DSK alias set explicit while still leaving Canvas, DOM, frame timing, and descriptor projection in the route host.
- The route still keeps minimal host convenience facades for foundation/build/wave/scale APIs so existing input and UI bridges remain compatible; this is a smaller browser surface than the broad compatibility bundle but not a full local-JS shrink to only direct DSK methods.

Next smoke priority: guard the remaining host convenience facades, then replace facade calls with direct DSK semantic methods only where the browser route stays compatible and the executable replay remains green.

## 2026-06-23 Deterministic Replay QA host-facade guard closure

- Fixed stale `tests/signal-bastion-replay-bridge-smoke.mjs` expectations after the executable route replay closure. The bridge smoke now requires the `signal-bastion` manifest entry to keep `missingExecutableFixtures` empty and list `tests/signal-bastion-executable-route-replay-smoke.mjs` as route executable replay coverage.
- Added `tests/signal-bastion-host-facade-guard-smoke.mjs` to guard the remaining convenience-facade seam in the browser host. It allows only the named generic-defense DSK bundle plus foundation/build/wave/scale/authoring convenience exports, blocks the broad `createGenericDefenseKits()` facade, preserves the seven DSK alias IDs, blocks lower-level browser-host bypasses such as `engine.defenseCombat`, and keeps renderer/input code outside reusable simulation ownership.
- Wired the facade guard into both full and deploy checks. The executable replay remains full-check-only, but this static guard can run during deploy checks without requiring dependency install behavior for GitHub package imports.

Next smoke priority: reduce the remaining Signal Bastion browser host convenience calls only where existing bridge/spec/executable/facade smokes stay green. Do not add another executable route replay lane until a real reusable ProtoKit boundary exists for that lane.

## 2026-06-23 Twenty Game Refiner lane-contract drift closure

- Updated `experiments/headless-lane-replay-contracts.json` so the `strategic-pressure-loop` contract no longer carries stale missing-executable text after `signal-bastion` gained `tests/signal-bastion-executable-route-replay-smoke.mjs` coverage.
- Strengthened `tests/headless-lane-replay-contracts-smoke.mjs` so route executable replay coverage in `experiments/canonical-route-replay-manifest.json` must be mirrored by the lane contract, and executable coverage must replace stale `missingExecutableFixture` text.
- The lane remains `protokit-backed`, not a second game-local implementation: the executable route replay imports real Core plus ProtoKits generic-defense DSK aliases and keeps renderer/browser ownership excluded.

Next smoke priority: keep the strategic-pressure lane as the only executable route-domain lane until another reusable ProtoKit boundary exists. The next safe reduction is Signal Bastion browser-host facade shrink, guarded by bridge/spec/executable/facade smokes.

## 2026-06-24 Headless Tick Smoke Builder placement-bridge drift note

- Re-checked Signal Bastion route memory against ProtoKits and found a precise remaining bridge drift: `experiments/signal-bastion-route-domain-replay.json` records `placementProjector.confirm` as bridged to `n.genericDefense.sessionFacade.build`, while the reusable ProtoKits placement projector still prefers `engine.defenseBuild?.build` and legacy `engine.genericDefense?.build` internally.
- This means the browser route is not re-owning simulation, but the reusable presentation projector has not fully caught up to the namespaced DSK bridge contract.
- ProtoKits `.agent/smoke-tests.md` now records the exact implementation/test plan: make `createGenericPlacementProjectorKit().confirm()` prefer `engine.n?.genericDefense?.sessionFacade?.build`, then add a headless smoke that keeps the synced namespace alive while poisoning/reassigning legacy `engine.genericDefense`.

Next smoke priority: implement the ProtoKits placement projector namespace preference and matching headless smoke before claiming the placement seam fully shrunk to the DSK namespace.
