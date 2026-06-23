# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: shrink the remaining Signal Bastion browser-host convenience facade seam only where the existing strategic-pressure executable replay, bridge smoke, route-domain spec smoke, import-gate smoke, and host-facade guard stay green.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep destructive route folds blocked until the canonical route has real replay coverage plus browser-host migration evidence. Signal Bastion now has executable route-domain replay proof, but its variants should still remain metadata-folded until the browser host stops depending on compatibility convenience facades.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, `experiments/headless-lane-replay-contracts.json`, `experiments/signal-bastion-route-domain-replay.json`, `experiments/executable-route-replay-import-gates.json`, and the Signal Bastion strategic-pressure bridge/spec/import-gate/executable/facade smokes against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, local JavaScript reduction opportunities, package-wiring assumptions, broad compatibility-facade regression, and accidental route-local simulation ownership.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-23-cycle-report-main-push-planner-1730.md`.

Latest Cycle Report Main Push Planner change: reconciled stale `.agent` notes after the strategic-pressure executable replay and Signal Bastion browser DSK bridge migration. The import-wiring backlog is now marked satisfied for the Node replay path, promotion notes now distinguish `generic-defense-dsk-boundaries` from the broad AAA compatibility facade, and the next safe patch is browser-host convenience-facade shrink rather than another executable replay lane.

Latest Twenty Game Refiner change: `experiments/headless-lane-replay-contracts.json` now mirrors Signal Bastion's executable route replay coverage instead of carrying stale strategic-pressure missing-executable text. `tests/headless-lane-replay-contracts-smoke.mjs` now fails if a canonical route records route executable replay coverage but the higher-level lane contract does not mirror it, or if an executable lane keeps stale `missingExecutableFixture` text.

Latest Headless Tick Smoke Builder change: `games/signal-bastion/src/boot.js` now imports the ProtoKits `generic-defense-aaa-dsk-bridge` browser module and composes the seven named generic-defense DSK aliases instead of the broad `createGenericDefenseKits()` compatibility facade. The Signal Bastion static, bridge, route-spec, import-gate, executable, and facade smokes now guard that browser DSK alias migration.

Latest Deterministic Replay QA change: fixed stale Signal Bastion bridge-smoke expectations after the executable replay closure, then added `tests/signal-bastion-host-facade-guard-smoke.mjs` so the remaining foundation/build/wave/scale/authoring convenience facades are explicit and cannot expand back into broad route-local simulation ownership.

Latest Canonical Route Pruner change: `experiments/executable-route-replay-import-gates.json` now records browser import mode as `browser-cdn-dynamic-import-dsk-bridge` and preserves the pruning rule that fake route-local replay, copied ProtoKit fixtures, DOM/Canvas-owned simulation shims, and route forks remain blocked.

Latest ProtoKit Promotion Gate change: the strategic-pressure lane remains the only executable route-domain replay lane; do not repeat the pattern for another canonical lane until a real reusable ProtoKit boundary exists.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
