# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: shrink the remaining Signal Bastion browser-host convenience facade seam only where the existing strategic-pressure executable replay, bridge smoke, route-domain spec smoke, import-gate smoke, host-facade guard, static smoke, and browser compatibility assumptions stay green. The browser host now routes common snapshot, selection, upgrade, wave-start, restart, and replay-facing calls through `engine.n.genericDefense.sessionFacade` and render fallback through `engine.n.genericDefense.renderDescriptors`; remaining convenience seams are blueprint/sell, wave preview, foundation digest, and scale budget.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep destructive route folds blocked until the canonical route has real replay coverage plus browser-host migration evidence. Signal Bastion now has executable route-domain replay proof and a browser DSK-namespace migration, but its variants should still remain metadata-folded until the remaining host convenience seams are either namespaced or explicitly justified.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, `experiments/headless-lane-replay-contracts.json`, `experiments/signal-bastion-route-domain-replay.json`, `experiments/executable-route-replay-import-gates.json`, and the Signal Bastion strategic-pressure bridge/spec/import-gate/executable/facade/static smokes against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, local JavaScript reduction opportunities, package-wiring assumptions, broad compatibility-facade regression, legacy `engine.genericDefense` browser calls, and accidental route-local simulation ownership.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-23-canonical-route-pruner-2100.md`.

Latest Cycle Report Main Push Planner change: reconciled stale `.agent` notes after the strategic-pressure executable replay and Signal Bastion browser DSK bridge migration. The import-wiring backlog is now marked satisfied for the Node replay path, promotion notes now distinguish `generic-defense-dsk-boundaries` from the broad AAA compatibility facade, and the next safe patch is browser-host convenience-facade shrink rather than another executable replay lane.

Latest Twenty Game Refiner change: `experiments/headless-lane-replay-contracts.json` now mirrors Signal Bastion's executable route replay coverage instead of carrying stale strategic-pressure missing-executable text. `tests/headless-lane-replay-contracts-smoke.mjs` now fails if a canonical route records route executable replay coverage but the higher-level lane contract does not mirror it, or if an executable lane keeps stale `missingExecutableFixture` text.

Latest Headless Tick Smoke Builder change: `games/signal-bastion/src/boot.js` now imports the ProtoKits `generic-defense-aaa-dsk-bridge` browser module and composes the seven named generic-defense DSK aliases instead of the broad `createGenericDefenseKits()` compatibility facade. The Signal Bastion static, bridge, route-spec, import-gate, executable, and facade smokes now guard that browser DSK alias migration.

Latest Deterministic Replay QA change: fixed stale Signal Bastion bridge-smoke expectations after the executable replay closure, then added `tests/signal-bastion-host-facade-guard-smoke.mjs` so the remaining foundation/build/wave/scale/authoring convenience facades are explicit and cannot expand back into broad route-local simulation ownership.

Latest Canonical Route Pruner change: Signal Bastion's browser host now uses the ProtoKit DSK namespace for the migrated strategic-pressure bridge seam: `engine.n.genericDefense.sessionFacade` backs snapshot, selection, upgrade, wave-start, restart, and executable replay method paths; `engine.n.genericDefense.renderDescriptors` backs raw descriptor fallback. The host still keeps only explicit remaining convenience seams for build blueprint/sell, wave preview, foundation digest, and scale budget.

Latest ProtoKit Promotion Gate change: the strategic-pressure lane remains the only executable route-domain replay lane; do not repeat the pattern for another canonical lane until a real reusable ProtoKit boundary exists.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
