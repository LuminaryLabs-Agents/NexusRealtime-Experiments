# Domain Merge Consolidator — 2026-06-24 02:00

## What changed

Pushed a non-destructive Experiments metadata/test consolidation for the traversal/cargo lane:

- `experiments/canonical-route-replay-manifest.json` now maps `traversal-cargo-pressure` to the concrete reusable ProtoKit DSKs `generic-route-progress-kit` and `generic-route-cargo-extraction-kit` instead of the stale placeholder names `route-checkpoint-kit` and `cargo-delivery-kit`.
- `next-ledge` now records ProtoKits smoke coverage for `tests/generic-route-progress-kit-smoke.test.mjs` and `tests/generic-route-cargo-extraction-kit-smoke.test.mjs`, while still remaining `planned-fixture` with an explicit missing executable route-domain replay.
- `tests/canonical-route-replay-manifest-smoke.mjs` now guards the traversal/cargo candidate names and blocks regression back to the stale placeholders.
- `.agent/cycle-state.md` and `.agent/protokit-map.md` now record this as metadata/test consolidation only, not route-host migration or local JavaScript shrink.

## Long-form intent from `.agent/`

The durable intent remains: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript. Experiments should stay thin and validate reusable domains through routes, presets, bridges, manifests, docs, tests, smoke coverage, replay coverage, and renderer-only presentation. DSKs are layered communication boundaries that compose through resources, events, methods, snapshots, and descriptors.

## Repo state vs `.agent/`

Repo state is now closer to `.agent`: the previous memory already identified `next-ledge` / `traversal-cargo-pressure` as the first consumer candidate for `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`. The replay manifest still referenced stale generic placeholders, so this pass reconciled that drift without moving reusable implementation into Experiments.

Core remains a memory caveat: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not fetchable during the cycle. Do not treat Core `.agent` as reviewed until the folder/file path is available.

## DSK boundary clarity

Clearer. The delivery/extraction lane now points at the cumulative higher-level domain above:

- route/checkpoint/objective progress;
- cargo/resource ledger;
- extraction pressure;
- renderer-agnostic route/cargo/pressure descriptors.

This keeps `generic-route-progress-kit` atomic and keeps `generic-route-cargo-extraction-kit` as the composite coordinator, rather than allowing duplicate route-checkpoint or cargo-delivery placeholder concepts to grow separately.

## Local experiment JavaScript

Not shrinking yet. This update only makes the metadata and smoke guard match the reusable ProtoKits that already exist. Local JavaScript shrink should not be claimed until `next-ledge` imports and consumes the DSK boundary and removes route-local checkpoint/cargo ledger code.

## Higher-level domains emerging

- `delivery/extraction-loop`: route progress + cargo/resource ledger + pressure channels.
- `action-defense-extraction`: should reuse the same route/cargo/progress concepts where extraction overlaps with route progress and carried resources.
- `aerial/open-traversal`: should reuse `generic-route-progress-kit` for checkpoint ledger pressure but still needs separate flight/camera/terrain descriptor DSKs.

## ProtoKits to build, merge, prune, or promote

- Build/keep: `generic-route-progress-kit` as the atomic route progress DSK.
- Build/keep: `generic-route-cargo-extraction-kit` as the composite delivery/extraction coordinator above route progress, resource loop, and pressure loop.
- Prune language: stale placeholder candidates `route-checkpoint-kit` and `cargo-delivery-kit` should not reappear in traversal/cargo metadata where the concrete generic kits now exist.
- Do not promote yet: neither route-progress nor route-cargo-extraction should move toward Core until Experiments consumes them and a route-level replay or smoke proves local-JS reduction.

## Experiments to canonicalize, fold, or harden

- Harden first: `next-ledge` as the manifest-owned traversal/cargo route and first route-progress consumer candidate.
- Fold/hold: Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, and similar checkpoint/cargo variants should remain backlog pressure for the delivery/extraction loop unless they prove a distinct reusable boundary.
- Keep canonical and separate: `signal-bastion` remains the only executable route-domain replay lane for now.

## Missing smoke tests or replay scenarios

- Missing: a `next-ledge` metadata/spec smoke or route-domain replay that imports `generic-route-progress-kit` or `generic-route-cargo-extraction-kit` from ProtoKits and advances fixed ticks without browser ownership.
- Missing: route-host migration proof that ordered checkpoint state has left local `next-ledge` JavaScript.
- Still missing for other lanes: survey-pressure, survival-ecology, aerial-open-traversal, field-engineer-composition, and action-defense-extraction executable route-domain replays backed by concrete reusable DSK surfaces.

## Direct main push

Pushed directly to `main` in `LuminaryLabs-Agents/NexusRealtime-Experiments`:

1. `experiments/canonical-route-replay-manifest.json`
2. `tests/canonical-route-replay-manifest-smoke.mjs`
3. `.agent/cycle-state.md`
4. `.agent/protokit-map.md`
5. `.agent/cycle-reports/2026-06-24-domain-merge-consolidator-0200.md`

## Safest next main-branch patch plan

Add a small Experiments-only `next-ledge` route-progress candidate smoke that reads the replay manifest and route host files, asserts the route remains browser/renderer-owned only for input/collision/presentation, and fails if traversal/cargo metadata claims DSK consumption before the route imports a real ProtoKit boundary. After that guard exists, migrate only the ordered checkpoint ledger to `generic-route-progress-kit`; keep movement, collision, camera, DOM, Canvas, WebGL, audio, asset loading, and route fiction in the host.
