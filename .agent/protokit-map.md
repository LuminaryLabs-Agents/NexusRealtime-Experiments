# ProtoKit Map

Track reusable kits that Experiments consume.

Kit implementation belongs in ProtoKits. Experiments should stay as routes, presets, bridges, manifests, docs, and tests.

When kits combine, look for higher-level domains.

## 2026-06-23 Canonical Route Pruner import wiring note

Signal Bastion was the strongest ProtoKit-backed canonical route because its strategic-pressure lane pointed at `generic-defense-dsk-boundaries` and the generic-defense replay coverage in ProtoKits, but the route originally consumed Core and ProtoKits through browser CDN dynamic imports in `games/signal-bastion/src/boot.js`.

That import-wiring gap is now closed for Node checks: Experiments has package-level dev dependencies for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`, and the executable Signal Bastion route replay imports real Core plus ProtoKits generic-defense DSK aliases instead of copying fixtures into Experiments.

## 2026-06-23 Cycle Report Main Push Planner reconciliation

Current strongest ProtoKit-backed route: `signal-bastion` / `strategic-pressure-loop`.

Current consumption state:

- Node replay path: package-wired Core plus ProtoKits imports, real generic-defense DSK aliases, deterministic digest assertions, no browser renderer dependencies.
- Browser host path: CDN dynamic imports remain appropriate for browser compatibility, but the defense import is narrowed to `generic-defense-aaa-dsk-bridge` and the host explicitly requests the seven named DSK aliases: map, economy wallet, build placement, wave/agent director, combat resolver, session facade, and render descriptors.
- Remaining local-JS reduction seam: the Signal Bastion browser host still keeps compatibility convenience facades for foundation/build/wave/scale/authoring. Shrink these only where bridge/spec/executable/facade smokes stay green.

Promotion direction:

- Keep preparing `generic-pressure-loop-kit`, `generic-resource-loop-kit`, `generic-action-window-kit`, and `generic-affordance-descriptor-kit` as generic DSK promotion candidates.
- Keep `generic-defense-dsk-boundaries` as the strongest current composite-to-atomic split proof.
- Do not promote the broad generic-defense AAA compatibility facade. Treat `generic-defense-aaa-dsk-bridge` as a migration bridge, not the final reusable domain surface.
- Do not add another executable route replay lane until another real reusable ProtoKit boundary exists. Other canonical lanes should stay contract-only until their DSK surfaces can be imported and advanced headlessly.

## 2026-06-24 Twenty Experiment Seeder consumption map

New reusable route DSKs to reflect in Experiments:

- `generic-route-progress-kit`: atomic route/checkpoint/objective progress through resources, events, methods, snapshots, and renderer-agnostic route-checkpoint descriptors.
- `generic-route-cargo-extraction-kit`: composite delivery/extraction boundary over `generic-route-progress-kit`, `generic-resource-loop-kit`, and `generic-pressure-loop-kit`, exposing route/cargo/pressure snapshots and descriptors.

Current consumption state:

- `signal-bastion` remains the only route with executable route-domain replay against real ProtoKits.
- `next-ledge` is the next safest consumer candidate, but consumption is not implemented yet. Do not count this as local JS shrink until the route imports/uses the DSK and removes route-local checkpoint/cargo ledger ownership.

Recommended manifest/test direction:

- Update traversal/cargo metadata to name `generic-route-progress-kit` and `generic-route-cargo-extraction-kit` as concrete candidates, replacing older generic `route-checkpoint-kit` / `cargo-delivery-kit` language where the new generic DSKs are intended.
- Add a metadata or contract smoke that keeps `next-ledge` as the first route-progress consumer candidate without claiming executable replay.
- Migrate route-local JavaScript only after the metadata smoke is in place, starting with ordered checkpoint progress and leaving browser collision, movement, camera, renderer, route fiction, DOM, Canvas, WebGL, audio, and assets in the host.

## 2026-06-24 Domain Merge Consolidator consumption-map update

The traversal/cargo metadata consolidation is now pushed in Experiments:

- `experiments/canonical-route-replay-manifest.json` replaces the stale `route-checkpoint-kit` / `cargo-delivery-kit` placeholders in the `traversal-cargo-pressure` lane with `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`.
- `next-ledge` now points at ProtoKits smoke coverage for `tests/generic-route-progress-kit-smoke.test.mjs` and `tests/generic-route-cargo-extraction-kit-smoke.test.mjs` while remaining `planned-fixture`.
- `tests/canonical-route-replay-manifest-smoke.mjs` guards those candidate names and blocks regression back to the stale placeholders.

Consumption is still not implemented. The next safe route-host patch is to import only the route-progress or route-cargo-extraction DSK boundary for `next-ledge`, migrate ordered checkpoint progress first, then measure local JavaScript reduction after the route drops duplicated ledger code.

## 2026-06-24 Canonical Route Pruner placement namespace update

Strategic-pressure consumption is narrower after the ProtoKits placement-projector namespace smoke:

- ProtoKits owns `createGenericPlacementProjectorKit()` and now proves it can confirm placement through `engine.n.genericDefense.sessionFacade.build` with broad compatibility build facades poisoned.
- Experiments owns the route-side contract: `experiments/signal-bastion-route-domain-replay.json` now names the ProtoKits smoke, and `tests/signal-bastion-placement-namespace-contract-smoke.mjs` blocks direct browser-host fallback to `engine.defenseBuild.build` or legacy `engine.genericDefense.build`.
- This is a strategic-pressure bridge shrink, not a new reusable kit implementation in Experiments.

Next ProtoKit consumption decision: keep `generic-defense-dsk-boundaries` / `generic-defense-aaa-dsk-bridge` as the only executable lane proof, and move to `next-ledge` route-progress consumption only after a small route-host migration can remove duplicated checkpoint ledger code without claiming a second executable lane prematurely.
