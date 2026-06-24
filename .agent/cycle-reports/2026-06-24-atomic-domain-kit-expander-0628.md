# Atomic Domain Kit Expander — 2026-06-24 06:28 ET

## Scope reviewed

- Core: `LuminaryLabs-Dev/NexusRealtime`
- ProtoKits: `LuminaryLabs-Agents/NexusRealtime-ProtoKits`
- Experiments: `LuminaryLabs-Agents/NexusRealtime-Experiments`

## Durable intent re-check

The long-form ecosystem intent is unchanged: Core owns stable runtime primitives and promoted mature DSK contracts; ProtoKits owns reusable renderer-agnostic domain-service kits before Core promotion; Experiments owns thin validation hosts, canonical routes, presets, bridges, manifests, docs, smoke tests, replay contracts, and renderer-only presentation.

DSKs remain communication layers through resources, events, methods, snapshots, and descriptors. They are not gap fillers, and reusable kit implementation belongs in ProtoKits rather than Experiments.

## Repo-state finding

Core `.agent/intent.md` is still unavailable from the integration path checked in this run. Do not treat Core `.agent` memory as reviewed until `.agent/intent.md` exists or can be fetched in a later run.

ProtoKits is ahead of Experiments for the traversal/cargo lane:

- `generic-route-progress-kit` now covers atomic ordered route/checkpoint/objective progress.
- `generic-route-cargo-extraction-kit` now composes route progress, resource/cargo ledger, and pressure channels without becoming a monolithic route engine.
- Preferred namespaced seams exist for the route/cargo family: `engine.n.genericRouteProgress`, `engine.n.genericResourceLoop`, `engine.n.genericPressureLoop`, and `engine.n.genericRouteCargoExtraction`.

Experiments has the correct manifest/test direction but not source consumption yet:

- `next-ledge` is the first traversal/cargo consumer candidate in `experiments/domain-kit-cutover-manifest.json`.
- `experiments/canonical-route-replay-manifest.json` keeps `next-ledge` at `planned-fixture` and explicitly lists missing executable route-level replay for `generic-route-progress-kit` or `generic-route-cargo-extraction-kit`.
- `tests/next-ledge-route-cargo-cutover-smoke.mjs` correctly prevents premature executable claims while `experiments/next-ledge/src/session.js` still does not import the route/cargo ProtoKits.

## Decision

Do not create another atomic ProtoKit in this run. The reusable kit side already has the next needed atoms/composite for this lens. A new kit would duplicate existing route-progress or route-cargo surfaces before downstream route pressure has proven the missing seam.

Do not push route JavaScript migration blindly. `next-ledge` still owns tether physics, collision/hit testing, camera snapshots, route fiction, and browser-facing session state. A safe migration should first narrow the cutover to objective/checkpoint ledger state only, leaving physics, route fiction, camera, renderer, and browser input in the host.

## DSK clarity

DSK boundaries are clearer than the route state:

- Atomic boundary: `generic-route-progress-kit` for ordered checkpoints and route descriptors.
- Composite boundary: `generic-route-cargo-extraction-kit` for route/cargo/pressure snapshots.
- Host boundary: `next-ledge` should keep grapple physics, collision/hit testing, route-specific fiction, camera/render data, and input adaptation.

The main drift risk is claiming local-JS shrink from manifest alignment alone. That claim remains blocked until route source imports and drives a ProtoKit boundary.

## Local JavaScript shrink status

No new local JavaScript reduction was made in this run. The useful finding is that the next shrink is now exact: migrate only the Next Ledge objective/checkpoint ledger to `engine.n.genericRouteProgress`, then add deterministic route-level smoke/replay before considering cargo/pressure migration.

## Emerging higher-level domains

- Delivery/extraction loop: `generic-route-progress-kit` + `generic-resource-loop-kit` + `generic-pressure-loop-kit` + `generic-route-cargo-extraction-kit`.
- Aerial/open traversal loop: route progress can later combine with flight/corridor/camera descriptors, but this should not bypass the Next Ledge traversal/cargo proof.
- Survey pressure loop remains a separate future candidate: scan/survey + zones + pressure + hazards.

## ProtoKits build/merge/prune/promote guidance

Build/keep:

- Keep `generic-route-progress-kit` atomic.
- Keep `generic-route-cargo-extraction-kit` as a composite coordinator over child DSKs.

Do not build yet:

- No new route-checkpoint placeholder kit.
- No Next Ledge branded reusable kit.
- No monolithic traversal/cargo game kit.

Do not promote yet:

- Route progress and route-cargo extraction still need downstream route consumption proof and route-level deterministic replay before any Core promotion review.

## Experiment canonicalization guidance

Canonical/harden first:

- `next-ledge` as the traversal/cargo consumer candidate.

Fold/defer:

- Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, and similar checkpoint/cargo variants should remain pressure sources for the `next-ledge` delivery/extraction lane unless they prove distinct reusable DSK boundaries.

## Missing smoke/replay

Missing:

- `next-ledge` executable route-level replay importing `generic-route-progress-kit` or `generic-route-cargo-extraction-kit` through package/CDN wiring.
- A route-host smoke proving `engine.n.genericRouteProgress` can own objective/checkpoint progress while the host keeps physics/collision/camera/render/browser state.
- A later cargo/pressure replay only after route-progress consumption is proven.

## Safest next main-branch patch plan

1. Update `experiments/canonical-route-replay-manifest.json` so `next-ledge.protoKitReplayCoverage` also points at `tests/generic-route-progress-replay-smoke.test.mjs`, not only the atomic smoke.
2. Update `tests/canonical-route-replay-manifest-smoke.mjs` and `tests/next-ledge-route-cargo-cutover-smoke.mjs` to guard that replay metadata.
3. Add a tiny route-progress consumption contract smoke that fails unless `experiments/next-ledge/src/session.js` either remains explicitly `planned-fixture` or imports `generic-route-progress-kit` and exposes `domain.routeProgress` from a namespaced DSK snapshot.
4. Only after those metadata guards are green, update `experiments/next-ledge/src/session.js` to import `createGenericRouteProgressKit`, install it with checkpoints mapped from the objective steps, and call `engine.n.genericRouteProgress.complete(...)` from the existing `restored` and `summit-reached` semantic events.
5. Do not remove `objectiveFlow`, tether traversal, physics, collision, camera, or renderer-owned state in the same patch. Measure shrink after the route-progress seam is stable.

## What changed in this run

Pushed this `.agent` cycle report to Experiments `main` as durable operating memory. No reusable implementation was pushed to Experiments, and no new ProtoKit implementation was needed.