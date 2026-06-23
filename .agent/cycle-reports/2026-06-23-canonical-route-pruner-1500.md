# Canonical Route Pruner — 2026-06-23 15:00 ET

## What changed

Added a checked executable-replay import gate for the `signal-bastion` / `strategic-pressure-loop` lane.

Files pushed to Experiments `main`:

- `experiments/executable-route-replay-import-gates.json`
- `tests/executable-route-replay-import-gates-smoke.mjs`
- `scripts/run-checks.mjs`
- `.agent/cycle-state.md`
- `.agent/domain-backlog.md`
- `.agent/protokit-map.md`
- `.agent/route-canonicalization.md`
- `.agent/smoke-tests.md`
- `.agent/replay-qa.md`
- `.agent/cycle-reports/2026-06-23-canonical-route-pruner-1500.md`

## Long-form intent from `.agent`

Grow reusable DSK-based ProtoKits while shrinking local experiment JavaScript. Reusable implementation belongs in ProtoKits. Experiments should remain thin validation hosts: routes, presets, bridges, manifests, docs, tests, and renderer-only presentation.

## Repo state vs `.agent`

Repo state is closer to `.agent` after this pass. The prior memory said the Signal Bastion executable replay should not be faked with route-local simulation and should remain blocked until stable package/workspace imports exist. The new import gate makes that blocker test-visible.

One drift remains: Core `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Treat Core `.agent` memory as missing until the folder exists or a later run can fetch it.

## DSK boundary clarity

Clearer. The strongest current route lane is still `strategic-pressure-loop`, backed by ProtoKits generic-defense DSK boundary aliases and replay coverage. The import gate prevents Experiments from duplicating that simulation while trying to close the route-domain replay gap.

## Local experiment JavaScript

Playable route JavaScript did not shrink in this pass, but reusable route-local JavaScript also did not grow. The only JavaScript added is a static smoke guard. The gate is designed to prevent the next patch from adding fake local generic-defense simulation under Experiments.

## Higher-level domains emerging

- Strategic pressure loop remains the most mature lane because generic-defense has ProtoKit-backed resources, events, methods, snapshots, descriptors, and replay coverage.
- Survey pressure, traversal/cargo, survival ecology, aerial/open traversal, field-engineer composition, and action-defense-extraction remain contract-only lanes until executable package-backed fixtures exist.

## ProtoKit build / merge / prune / promote notes

- Build/keep: `generic-defense-dsk-boundaries` and the atomic map/economy/build/wave/combat/session/render aliases.
- Keep compatible: `generic-defense-aaa-kits` and `generic-defense-aaa-dsk-bridge` for existing browser hosts.
- Prune through migration: route hosts should move toward smaller DSK aliases once package/import compatibility is proven.
- Do not promote broad AAA facades to Core yet.

## Experiments canonical / folded / hardened notes

- Keep canonical: `signal-bastion` as the strategic-pressure base route.
- Fold/hold: defense variants such as bastion/sealing, mech, and factory pressure should remain backlog/variant pressure until the executable route replay is real.
- Do not create a new Signal Bastion V1/V2/V3 fork to satisfy replay pressure.

## Missing smoke / replay coverage

Still missing: an executable browserless Signal Bastion route-domain replay that imports real Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits` DSK aliases, advances the checked fixed-tick plan, and asserts resources, events, methods, snapshots, descriptors, and digest fields without DOM, Canvas, WebGL, Three.js, pointer lock, browser audio, asset loading, browser CDN imports, route-local randomness, or copied ProtoKit fixtures.

## Safest next main-branch patch plan

1. Add stable local package, workspace, or path import wiring for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits` in Experiments.
2. Add `tests/signal-bastion-executable-route-replay-smoke.mjs` that imports real Core plus `@luminarylabs/nexusrealtime-protokits/generic-defense-dsk-boundaries`.
3. Run the checked `strategic-pressure-loop` fixed-tick sequence from `experiments/headless-lane-replay-contracts.json`.
4. Assert the digest fields from `experiments/signal-bastion-route-domain-replay.json`.
5. Only after that passes, consider destructive route pruning or defense variant folding.
