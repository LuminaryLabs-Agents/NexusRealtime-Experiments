# API Surface Pruner — 2026-06-24 08:30

## Reviewed memory

- ProtoKits `.agent/intent.md` and Experiments `.agent/intent.md` both keep the long-form split: Core owns stable runtime/promoted contracts, ProtoKits owns reusable domain-service kits, and Experiments owns thin validation hosts, presets, bridges, manifests, docs, tests, and renderer-only presentation.
- Core `.agent/intent.md` is still unavailable from `LuminaryLabs-Dev/NexusRealtime`; keep treating Core memory as drift until the folder exists or can be fetched.

## What changed

- `experiments/next-ledge/src/session.js` now imports `createGenericRouteProgressKit` from ProtoKits `main`.
- Next Ledge now builds climb-anchor checkpoints for the generic route-progress DSK, installs the kit in the route host, syncs generated climb routes through `engine.n.genericRouteProgress`, and exposes `domain.routeProgress` in snapshots.
- The host still owns browser input, climb physics/collision, camera, Three.js rendering, and route fiction. No reusable kit implementation moved into Experiments.
- `experiments/domain-kit-cutover-manifest.json` now records route-progress as executable while keeping cargo/resource/pressure planned.
- `experiments/canonical-route-replay-manifest.json` now narrows the missing executable fixture from generic route-progress/cargo to the remaining cargo/resource/pressure replay lane.
- `tests/next-ledge-route-cargo-cutover-smoke.mjs` and `tests/canonical-route-replay-manifest-smoke.mjs` now guard the new distinction.
- `README.md` and `.agent/cycle-state.md` were updated to make the route-progress seam durable operating memory.

## Repo state vs `.agent`

Repo state better matches `.agent`: the traversal/cargo lane now has a real route consuming the smallest route/checkpoint DSK instead of only manifest/test pressure. The route still correctly remains `planned-fixture` because cargo/resource/pressure replay is not executable yet.

## DSK clarity

DSK boundaries became clearer: `generic-route-progress-kit` owns ordered checkpoint/progress resources, events, snapshots, and descriptors through `engine.n.genericRouteProgress`; Next Ledge remains responsible for renderer/browser and grapple-climb feel.

## Local JavaScript shrink

No large local JavaScript deletion was claimed. This is a surface-pruning migration: route-progress ledger state is now mirrored through the reusable DSK, but the route still owns climb physics and compatibility state until cargo/resource/pressure migration proves a safe reduction.

## Higher-level domains emerging

- Delivery/extraction loop: now partially validated by Next Ledge route-progress consumption.
- Strategic pressure loop: remains the only executable route-domain replay lane through Signal Bastion.
- Survey pressure loop: still planned around scan/zone/hazard boundaries.

## ProtoKits / Experiments status

- Build/keep: `generic-route-progress-kit` as the atomic route/checkpoint boundary.
- Compose later: `generic-route-cargo-extraction-kit` once Next Ledge or another canonical route can consume cargo/resource/pressure without moving browser/renderer concerns into kits.
- Keep canonical/harden: `next-ledge` as the traversal/cargo route-progress consumer.
- Do not add filler canonical routes for Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, or Floodplain Rescue until they prove a distinct reusable DSK boundary.

## Missing smoke/replay

- Still missing: a browserless Next Ledge or traversal/cargo fixed-tick replay that imports Core plus ProtoKits and proves cargo/resource/pressure with deterministic descriptors.
- Still missing: any executable non-strategic route-domain replay lane. Do not claim one until real reusable ProtoKit boundaries and route consumption exist.

## Safest next main-branch patch

Add a small route-progress static or browserless smoke that imports the Next Ledge session through package/local wiring only if the existing check harness can support CDN module imports safely. Otherwise, migrate one cargo/resource/pressure seam into `generic-route-cargo-extraction-kit` behind `engine.n.genericRouteProgress` while leaving climb physics, collision, browser input, camera, and rendering in the host.
