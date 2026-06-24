# Route Notes

Track canonical experiment routes and route cleanup decisions.

Experiments should move toward about 20 strong canonical routes. The number is a target, not a rigid quota.

Routes should validate reusable domain boundaries and higher-level domain combinations. Reusable kit implementation belongs in ProtoKits.

## 2026-06-23 Canonical Route Pruner finding

Added `experiments/canonical-route-pruning-map.json` as a test-visible companion to `experiments/domain-kit-cutover-manifest.json`.

Current manifest-owned canonical routes remain:

- `next-ledge` for traversal/checkpoint/action-input pressure.
- `fogline-relay` for survey/scan/zone/timed-pressure/hazard pressure.
- `nexus-frontier-signal-isles` for broad field-engineer composition and kit-utilization showcase pressure.
- `sora-the-infinite` for aerial/open traversal pressure.
- `zombie-orchard` for survival/horde/resource/hazard pressure.
- `signal-bastion` for strategic tower-defense pressure.
- `rogue-lite-hellscape-siege` for action-defense-extraction pressure.

Pruning rule strengthened: every manifest canonical route now has an explicit route issue that names variants to fold or hold as seed/backlog, manifest/docs updates, local JavaScript that should move toward ProtoKits, smoke/replay coverage to preserve, and whether pruning helps the about-20 portfolio.

Route folders were not deleted in this pass. The safe next destructive step is still gated on unified canonical routes plus fixed-tick smoke/replay coverage.

## 2026-06-23 Canonical Route Pruner import-gate finding

Added `experiments/executable-route-replay-import-gates.json` so the strongest current fold candidate, `signal-bastion` / `strategic-pressure-loop`, could not be treated as executable route replay complete until Experiments could import Core and ProtoKits through stable local package/workspace/path wiring.

## 2026-06-23 Cycle Report Main Push Planner canonicalization update

The Signal Bastion replay gate has moved from blocked to proven for the Node replay path: the route-domain executable replay now imports real Core plus ProtoKits generic-defense DSK aliases through package wiring and keeps browser/renderer ownership excluded.

Canonicalization implication:

- Keep `signal-bastion` as the only canonical route with executable route-domain replay proof for now.
- Do not use that proof to delete defense/survival/action variants yet. The remaining browser-host convenience facade seam should shrink first, while bridge/spec/executable/facade smokes stay green.
- Do not add Signal Bastion V1/V2/V3 forks or route-local replay copies.
- Keep the other canonical routes contract-backed but non-executable until their reusable ProtoKit boundaries exist.
- Treat the 20-route target list as a portfolio lens. A route should join or remain canonical only when it adds reusable DSK pressure and a path to fixed-tick smoke/replay coverage.

## 2026-06-23 Canonical Route Pruner DSK namespace update

Signal Bastion remains the canonical strategic-pressure route, but the browser host now uses the ProtoKit-owned `engine.n.genericDefense` namespace for the migrated replay-facing seam instead of calling broad compatibility surfaces directly:

- `engine.n.genericDefense.sessionFacade` backs snapshot reads, selection, upgrade, wave start, restart, and the executable route replay method paths.
- `engine.n.genericDefense.renderDescriptors` backs renderer-agnostic raw descriptor fallback when the browser presentation stack is unavailable.
- Remaining convenience seams are explicit and guarded: `defenseBuild.setBlueprint`, `defenseBuild.sell`, `defenseWaves.previewNextWave`, `defenseFoundation.getSnapshot`, and `defenseScale.getBudgetSnapshot`.

Canonicalization implication: this is local-JS reduction and boundary clarification, not a destructive route fold. Keep variant pruning metadata-only until Signal Bastion's browser host can either remove or justify each remaining convenience seam without breaking the strategic-pressure replay and static bridge guards.

## 2026-06-24 Canonical Route Pruner placement namespace update

The placement seam that previously sat between route-local browser input and the reusable presentation projector is now guarded as a namespaced DSK bridge:

- ProtoKits owns the implementation proof through `tests/generic-defense-placement-projector-namespace-smoke.test.mjs`, where `createGenericPlacementProjectorKit().confirm()` prefers `engine.n.genericDefense.sessionFacade.build` while compatibility build facades are poisoned.
- Experiments now records that source smoke in `experiments/signal-bastion-route-domain-replay.json` and checks it with `tests/signal-bastion-placement-namespace-contract-smoke.mjs`.
- Signal Bastion's input host still calls `engine.placementProjector.confirm` from browser pointer input, but the route-side contract now forbids direct `engine.defenseBuild.build` or legacy `engine.genericDefense.build` as placement shortcuts.

Canonicalization implication: `signal-bastion` remains the sole executable strategic-pressure canonical route, and this reduces one more reason to preserve defense variants as separate route forks. Do not delete or fold route folders yet; next pruning should continue through metadata, smoke guards, and one remaining browser convenience seam at a time.

## 2026-06-24 ProtoKit Promotion Gate wave-preview namespace update

Signal Bastion's GameHost wave preview now derives from the namespaced DSK session snapshot instead of the broad wave convenience facade:

- `games/signal-bastion/src/boot.js` adds `getSignalBastionWavePreview(engine)`, which reads `engine.n.genericDefense.sessionFacade.getSnapshot()` and derives the next wave from `snapshot.level.waves[snapshot.session.waveIndex]`.
- `globalThis.GameHost.getWavePreview()` now uses that helper instead of `engine.defenseWaves.previewNextWave()`.
- `tests/signal-bastion-host-facade-guard-smoke.mjs` forbids reintroducing the wave preview convenience call and keeps the remaining convenience list limited to build blueprint/sell, foundation snapshot, and scale snapshot seams.

Canonicalization implication: this is a small but real local route-host shrink for the strategic-pressure canonical route. It does not justify destructive route deletion or a second executable lane; it tightens the single strongest route while keeping reusable simulation and descriptor ownership in ProtoKits.

## 2026-06-24 Cycle Report Main Push Planner foundation-seam finding

The next exact canonical route shrink is now the Signal Bastion foundation debug seam. `GameHost.getFoundation()` still calls `engine.defenseFoundation.getSnapshot()` and browser boot still installs `createGenericDefenseFoundationKit`, while adjacent GameHost calls already derive state, wave preview, and budget from `engine.n.genericDefense.sessionFacade` / `engine.n.genericDefense.renderDescriptors`.

A runtime patch was attempted to remove the foundation convenience kit and derive `getFoundation()` from the DSK session snapshot, but the GitHub connector safety layer blocked the code-file write before it reached GitHub. No route code changed in this cycle.

Canonicalization implication: keep `signal-bastion` as the sole executable strategic-pressure route and make the foundation seam the next scoped main-branch patch before touching `defenseBuild.setBlueprint` or `defenseBuild.sell`. Do not delete route variants or add another executable lane as a substitute for this shrink.

## 2026-06-24 Intent Miner README alignment

`README.md` was restored from unrelated outreach documentation to NexusRealtime Experiments documentation. The README now mirrors the canonical route rule, points at `experiments/domain-kit-cutover-manifest.json`, names the current canonical routes, and describes Signal Bastion as the strongest strategic-pressure route using `generic-defense-aaa-dsk-bridge`, seven explicit generic-defense DSK aliases, and `engine.n.genericDefense` seams.

Canonicalization implication: this fixes docs drift only. It does not change the manifest-owned route set, does not fold/delete routes, and does not claim new executable coverage. Continue to treat `signal-bastion` as the only executable route-domain lane while other routes remain contract-backed until their reusable ProtoKit boundaries are actually consumed.
