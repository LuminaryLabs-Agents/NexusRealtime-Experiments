# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: keep `signal-bastion` as the only executable route-domain lane while shrinking its browser-host seams toward `engine.n.genericDefense` one guarded seam at a time. The placement seam has cross-repo proof, the wave-preview GameHost seam now reads `engine.n.genericDefense.sessionFacade.getSnapshot()` instead of `engine.defenseWaves.previewNextWave()`, and the scale/budget GameHost seam now derives from `engine.n.genericDefense.sessionFacade.getSnapshot()` plus `engine.n.genericDefense.renderDescriptors.getSnapshot()` without installing `createGenericDefenseScaleKit`. In parallel, `next-ledge` is now manifest/test-aligned with `generic-route-progress-kit`, `generic-route-cargo-extraction-kit`, `generic-resource-loop-kit`, and `generic-pressure-loop-kit` as the traversal/cargo consumer candidate, but it must remain `planned-fixture` until route source actually imports those ProtoKits and drops local checkpoint/cargo bookkeeping.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep destructive route folds blocked until the canonical route has real replay coverage plus browser-host migration evidence. Do not add Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, or other checkpoint/cargo variants as filler canonical routes; fold their pressure into the `next-ledge` delivery/extraction loop until they prove a distinct reusable DSK boundary.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, `experiments/headless-lane-replay-contracts.json`, `experiments/signal-bastion-route-domain-replay.json`, `experiments/executable-route-replay-import-gates.json`, the Signal Bastion strategic-pressure bridge/spec/import-gate/executable/facade/static/placement smokes, and the Next Ledge route/cargo cutover smoke against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, local JavaScript reduction opportunities, package-wiring assumptions, broad compatibility-facade regression, legacy `engine.genericDefense` browser calls, accidental route-local simulation ownership, wave preview fallback to `engine.defenseWaves.previewNextWave`, budget fallback to `engine.defenseScale.getBudgetSnapshot`, stale route-checkpoint/cargo-delivery placeholders, and premature route-progress/cargo-extraction replay claims before a route actually consumes the new ProtoKits.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-24-cycle-report-main-push-planner-0528.md`.

Latest Cycle Report Main Push Planner update: reviewed the latest ProtoKits route-progress/cargo-extraction memory and Experiments Signal Bastion host state. The next safe shrink seam is the foundation debug snapshot: `GameHost.getFoundation()` still calls `engine.defenseFoundation.getSnapshot()` and boot still installs `createGenericDefenseFoundationKit`, while the rest of the route is already migrating toward `engine.n.genericDefense.sessionFacade` and `engine.n.genericDefense.renderDescriptors`. A code push was attempted for `games/signal-bastion/src/boot.js`, but the connector safety layer blocked the runtime-file write before it reached GitHub. The safe next patch is now explicit in `.agent/cycle-reports/2026-06-24-cycle-report-main-push-planner-0528.md`.

Latest Twenty Game Refiner change: `experiments/domain-kit-cutover-manifest.json` now maps `next-ledge` to the concrete route/cargo ProtoKits instead of stale traversal placeholders, `tests/next-ledge-route-cargo-cutover-smoke.mjs` guards the manifest/replay planned-vs-executable boundary, and `scripts/run-checks.mjs` wires that smoke into both full and deploy checks. This is manifest/test hardening only; no local experiment JavaScript shrink is claimed until `next-ledge` actually consumes the route/cargo DSKs.

Latest Headless Tick Smoke Builder change: `games/signal-bastion/src/boot.js` now implements `getSignalBastionBudgetSnapshot(engine)` from the namespaced generic-defense session snapshot and render descriptor snapshot. The browser boot no longer installs `createGenericDefenseScaleKit`, and `tests/signal-bastion-host-facade-guard-smoke.mjs` forbids returning to `engine.defenseScale.getBudgetSnapshot`. This is a small local-JS/facade shrink in Experiments; no reusable kit implementation moved into Experiments.

Latest ProtoKit Promotion Gate change: `games/signal-bastion/src/boot.js` now implements `getSignalBastionWavePreview(engine)` through `engine.n.genericDefense.sessionFacade.getSnapshot()` and `tests/signal-bastion-host-facade-guard-smoke.mjs` forbids returning to `engine.defenseWaves.previewNextWave`. This is a small but real local-JS/facade shrink in Experiments; no reusable kit implementation moved into Experiments.

Latest Canonical Route Pruner change: `experiments/signal-bastion-route-domain-replay.json` now records the ProtoKits placement-projector namespace smoke as source coverage, and `tests/signal-bastion-placement-namespace-contract-smoke.mjs` is wired into both full and deploy checks. The smoke guards the route-side placement bridge: `placementProjector.confirm` must stay bridged to `n.genericDefense.sessionFacade.build`, the input host must not call direct compatibility build facades, and only `setBlueprint` / `sell` remain explicit build convenience seams. This is a boundary/shrink guard, not a destructive route fold.

Latest Domain Merge Consolidator change: `experiments/canonical-route-replay-manifest.json` now consolidates `traversal-cargo-pressure` away from stale `route-checkpoint-kit` / `cargo-delivery-kit` placeholders and onto the concrete ProtoKit DSKs `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`. `tests/canonical-route-replay-manifest-smoke.mjs` now guards that Next Ledge points at both ProtoKits smokes while still remaining `planned-fixture` with an explicit missing executable route-domain replay. This is metadata/test consolidation only; no local experiment JavaScript shrink is claimed yet.

Latest Twenty Experiment Seeder change: recorded the `next-ledge` / `traversal-cargo-pressure` lane as the first seed candidate for `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`. This is an `.agent` memory update only; no local experiment JavaScript shrink is claimed yet.

Latest Composite Domain Kit Builder update: ProtoKits now has `generic-route-cargo-extraction-kit` as a composite over route progress, resource/cargo ledger, and pressure channels. Experiments should reflect this as a delivery/extraction opportunity before migrating route-host code.

Latest Atomic Domain Kit Expander update: ProtoKits now has `generic-route-progress-kit` as the smallest route/checkpoint/objective progress boundary. Experiments should use it to test whether checkpoint-heavy canonical routes can shrink route-local ledgers without moving browser collision, route fiction, rendering, or camera into reusable kits.

Latest Cycle Report Main Push Planner change: reconciled stale `.agent` notes after the strategic-pressure executable replay and Signal Bastion browser DSK bridge migration. The import-wiring backlog is now marked satisfied for the Node replay path, promotion notes now distinguish `generic-defense-dsk-boundaries` from the broad AAA compatibility facade, and the next safe strategic-pressure patch is browser-host convenience-facade shrink rather than another executable replay lane.

Latest Twenty Game Refiner change: `experiments/headless-lane-replay-contracts.json` now mirrors Signal Bastion's executable route replay coverage instead of carrying stale strategic-pressure missing-executable text. `tests/headless-lane-replay-contracts-smoke.mjs` now fails if a canonical route records route executable replay coverage but the higher-level lane contract does not mirror it, or if an executable lane keeps stale `missingExecutableFixture` text.

Latest Browser DSK bridge change: `games/signal-bastion/src/boot.js` imports the ProtoKits `generic-defense-aaa-dsk-bridge` browser module and composes the seven named generic-defense DSK aliases instead of the broad `createGenericDefenseKits()` compatibility facade. The Signal Bastion static, bridge, route-spec, import-gate, executable, and facade smokes guard that browser DSK alias migration.

Latest Deterministic Replay QA change: fixed stale Signal Bastion bridge-smoke expectations after the executable replay closure, then added `tests/signal-bastion-host-facade-guard-smoke.mjs` so the remaining foundation/build/wave/authoring convenience facades are explicit and cannot expand back into broad route-local simulation ownership.

Latest ProtoKit Promotion Gate constraint: the strategic-pressure lane remains the only executable route-domain replay lane; do not repeat the pattern for another canonical lane until a real reusable ProtoKit boundary exists and the route consumes it.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
