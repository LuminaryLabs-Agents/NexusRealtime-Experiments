# 2026-06-23 Canonical Route Pruner

## What changed

- Added `experiments/canonical-route-pruning-map.json` as a route-pruning companion to `experiments/domain-kit-cutover-manifest.json`.
- Added `tests/canonical-route-pruning-map-smoke.mjs` and wired it into full and deploy checks through `scripts/run-checks.mjs`.
- Updated `.agent/cycle-state.md`, `.agent/route-canonicalization.md`, `.agent/smoke-tests.md`, `.agent/replay-qa.md`, and `.agent/domain-backlog.md` with durable pruning, smoke, replay, and higher-level-domain findings.

## Long-form intent from `.agent/`

Grow reusable DSK-based ProtoKits while shrinking local experiment JavaScript. Reusable implementation belongs in ProtoKits. Experiments should stay thin: canonical routes, presets, bridges, manifests, docs, tests, and renderer-only presentation. DSKs should communicate through resources, events, methods, snapshots, and descriptors.

## Repo state versus `.agent/`

- The current manifest-owned canonical set is still smaller than the durable 20-name target list, which matches `.agent` guidance to treat 20 as an evaluation lens rather than a hard quota.
- `experiments/domain-kit-cutover-manifest.json` already guarded canonical routes against gallery drift; the new pruning map now also guards route-fold decisions and seed/backlog variants.
- No reusable implementation was pushed into Experiments.

## DSK boundary clarity

Clearer. The pruning map forces each canonical route to name the higher-level domain lane it validates and the local route behavior that should move toward ProtoKits before variants become canonical.

## Local experiment JavaScript trend

Playable route JavaScript did not shrink this pass. It also did not grow. The only JavaScript added was a static smoke test for pruning metadata. The next shrink opportunity is to move the listed local behaviors toward ProtoKits and replace route-specific variant logic with lane-level replay fixtures.

## Emerging higher-level domains

- Survey pressure.
- Strategic pressure loop.
- Survival ecology.
- Traversal/cargo pressure.
- Aerial/open traversal.
- Field-engineer composition.
- Action-defense-extraction.

## ProtoKits to build, merge, prune, or promote

- Build/replay next: lane-level fixtures for survey pressure, traversal/cargo, aerial/open traversal, survival ecology, field-engineer composition, and action-defense-extraction.
- Merge/prune next: continue splitting `generic-defense-kits` through the existing `generic-defense-dsk-boundaries` aliases instead of adding defense route variants.
- Promote carefully: generic pressure/resource/action-window/affordance remain the clearest DSK promotion candidates; defense should move through atomic aliases before Core consideration.

## Experiments to keep canonical, fold, or harden

Keep canonical:

- `next-ledge`.
- `fogline-relay`.
- `nexus-frontier-signal-isles`.
- `sora-the-infinite`.
- `zombie-orchard`.
- `signal-bastion`.
- `rogue-lite-hellscape-siege`.

Fold or hold as seed/backlog before canonical promotion:

- Survey/cartographer/drone variants into `fogline-relay` and the survey-pressure lane.
- Flight/Open Above variants into `sora-the-infinite` and the aerial/open traversal lane.
- Salvage/tether/rail/courier variants into the traversal/cargo lane until replay proves a separate canonical route.
- Warden/beetle/cavern survival variants into `zombie-orchard` and the survival-ecology lane.
- Bastion/factory/mech defense variants into `signal-bastion` and the strategic-pressure loop.
- Legacy Hellscape V2 and adjacent dungeon/dockyard variants into `rogue-lite-hellscape-siege` until action-defense-extraction replay distinguishes them.

## Smoke/replay gaps still missing

- Executable fixed-tick route/domain replay for each higher-level lane.
- A compact fixture format that lets canonical routes point to ProtoKit/domain replay without adding one replay file per fantasy variant.
- Actual local JS reduction after the metadata and smoke guard stay green.

## Direct main push

Target repo: `LuminaryLabs-Agents/NexusRealtime-Experiments`

Target branch: `main`

Commit groups pushed:

1. `test: add canonical route pruning map`
   - `experiments/canonical-route-pruning-map.json`
2. `test: add canonical route pruning smoke`
   - `tests/canonical-route-pruning-map-smoke.mjs`
3. `test: wire canonical pruning smoke into checks`
   - `scripts/run-checks.mjs`
4. `.agent` durable memory updates
   - `.agent/cycle-state.md`
   - `.agent/route-canonicalization.md`
   - `.agent/smoke-tests.md`
   - `.agent/replay-qa.md`
   - `.agent/domain-backlog.md`
   - `.agent/cycle-reports/2026-06-23-canonical-route-pruner.md`

## Safest next main-branch patch plan

1. Add `tests/fixtures/canonical-route-lane-fixtures.mjs` with one compact deterministic scenario per lane.
2. Add `tests/canonical-route-lane-replay-smoke.mjs` that checks lane fixtures against the pruning map.
3. Keep the new smoke rendererless and descriptor/snapshot oriented.
4. Only after that, start replacing route-local reusable behavior with ProtoKit imports or aliases; do not delete route folders until the unified base route and replay coverage are already in place.
