# Twenty Game Refiner — Next Ledge Route Progress Spec Hardening

## Summary

This cycle added a checked Next Ledge route-progress replay spec without claiming a second executable route-domain replay lane.

## Files changed

- `experiments/next-ledge-route-progress-replay.json`
- `tests/next-ledge-route-progress-replay-spec-smoke.mjs`
- `scripts/run-checks.mjs`

## Decision from `.agent/` memory

The durable intent remains to use Experiments as thin validation hosts for reusable ProtoKit domains, keep reusable implementation in ProtoKits, harden toward about 20 strong canonical routes without treating 20 as a brittle quota, and express DSKs through resources, events, methods, snapshots, and descriptors.

The current Next Ledge state already consumes `generic-route-progress-kit` through `engine.n.genericRouteProgress`, while cargo/resource/pressure remains planned. The safest Twenty Game Refiner move was therefore not another kit or a route promotion, but a spec/smoke guard that makes the partial route-progress seam explicit and blocks a premature traversal/cargo executable-lane claim.

## Boundary outcome

The new spec pins the route-progress seam for `next-ledge`:

- Namespace: `engine.n.genericRouteProgress`
- Resources: route/checkpoints/active/completed checkpoint state
- Events: route set, checkpoint entered/completed, route completed/reset, checkpoint rejected
- Methods: `setRoute`, `enter`, `complete`, `reset`, `getState`
- Snapshot: `domain.routeProgress`
- Descriptor: `route-checkpoint`

The smoke checks the route source for `createGenericRouteProgressKit`, `engine.n?.genericRouteProgress`, route sync, event mirroring, and `domain.routeProgress` snapshot exposure. It also confirms that `createGenericRouteCargoExtractionKit` is not yet imported, so cargo/resource/pressure replay remains an explicit gap.

## Local JavaScript

No new local JavaScript shrink is claimed in this cycle. The previous route-progress consumption is now guarded more tightly. The next shrink should move only cargo/resource/pressure bookkeeping after the route-progress seam remains stable.

## Portfolio effect

`signal-bastion` remains the only executable route-domain replay lane. `next-ledge` is now the strongest partial delivery/extraction consumer candidate, but it stays `planned-fixture` until `generic-route-cargo-extraction-kit` is actually consumed and a full cargo/resource/pressure replay exists.

## Safest next patch

Do one of the following, in order of safety:

1. Run the newly wired `tests/next-ledge-route-progress-replay-spec-smoke.mjs` in full/deploy checks and fix only metadata/source-regression issues if it fails.
2. Add a narrow Next Ledge cargo/resource/pressure spec before importing `generic-route-cargo-extraction-kit`.
3. Only after that, migrate the smallest cargo/resource/pressure seam into the reusable composite, leaving tether physics, browser collision, DOM input, camera, renderer, route fiction, and assets in the host.
