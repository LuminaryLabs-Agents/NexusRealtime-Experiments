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
