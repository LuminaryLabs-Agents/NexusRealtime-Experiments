# Domain Merge Consolidator — 2026-06-24 07:58 ET

## Reviewed durable memory

Reviewed the repo-local `.agent/` memory before selecting a patch path:

- Experiments `.agent/intent.md`, `.agent/architecture.md`, `.agent/dsk-boundaries.md`, `.agent/cycle-state.md`, `.agent/domain-backlog.md`, `.agent/protokit-map.md`, `.agent/experiment-map.md`, `.agent/candidate-promotions.md`, `.agent/smoke-tests.md`, `.agent/replay-qa.md`, `.agent/route-canonicalization.md`, and `.agent/scheduled-task-cycle.md`.
- ProtoKits `.agent/intent.md` and `.agent/cycle-state.md`.
- Core `.agent/intent.md` is still absent/not fetchable from `LuminaryLabs-Dev/NexusRealtime`, so Core memory is not considered reviewed for decision-making.

## Long-form intent in force

The durable intent is still cumulative DSK expansion: reusable domain implementation belongs in ProtoKits; Experiments should remain thin validation hosts made of canonical routes, presets, bridges, manifests, docs, smoke tests, replay contracts, and renderer-only presentation. DSKs are communication boundaries through resources, events, methods, snapshots, and descriptors, not gap-filling piles of route code.

## Domain merge finding

The prior consolidation correctly moved the `traversal-cargo-pressure` replay lane and `next-ledge` replay metadata away from stale `route-checkpoint-kit` / `cargo-delivery-kit` placeholders and onto:

- `generic-route-progress-kit`
- `generic-route-cargo-extraction-kit`
- `generic-resource-loop-kit`
- `generic-pressure-loop-kit`

However, `experiments/domain-kit-cutover-manifest.json` still carries stale placeholder names outside the already-consolidated `next-ledge` route:

- `nexus-frontier-signal-isles` still lists `route-checkpoint-kit` and `cargo-delivery-kit` inside a broad field-engineer composition route.
- `sora-the-infinite` still lists `route-checkpoint-kit` even though aerial/open traversal should compose route progress only as a child boundary beside flight/camera/terrain descriptors.
- `rogue-lite-hellscape-siege` still lists `cargo-delivery-kit` and `route-checkpoint-kit` even though its emerging domain is action-defense-extraction and should reuse `generic-route-cargo-extraction-kit` / `generic-route-progress-kit` once extraction state is route-facing.

This is documentation/manifest drift, not route-code breakage. The replay manifest already uses the clearer higher-level lane naming, but the cutover manifest still lets old placeholders leak into non-Next-Ledge route plans.

## Merge decision

Do not merge these routes into `next-ledge`; that would create a monolith. Instead, merge only the shared boundary vocabulary:

- Use `generic-route-progress-kit` anywhere the reusable need is ordered checkpoint/objective progress.
- Use `generic-route-cargo-extraction-kit` anywhere the reusable need is route progress + cargo/resource ledger + pressure/extraction state.
- Keep aerial flight, terrain windows, camera descriptors, hazard simulation, agent/horde cadence, inventory fiction, DOM/Canvas/WebGL/Three/audio/assets, and route story outside those DSKs.

## Repo state match

Repo state mostly matches `.agent` direction, but there is one concrete drift: `experiments/domain-kit-cutover-manifest.json` lags behind the replay manifest and `.agent/protokit-map.md` for route/cargo placeholder names on routes other than `next-ledge`.

## Local JavaScript shrink

No new local JavaScript shrink is claimed in this pass. `next-ledge` source still owns route-local climbing/tether/session state. Shrink should only be claimed after the route imports/uses `engine.n.genericRouteProgress` or `engine.n.genericRouteCargoExtraction` and removes duplicated checkpoint/cargo ledger code.

## Higher-level domains emerging

- `delivery/extraction-loop`: route progress + cargo/resource ledger + pressure + success/failure descriptors.
- `field-engineer-composition`: harvest/build/unlock/progress/pressure/beacon; may consume route-progress and resource-loop children but should not absorb traversal/cargo as a monolith.
- `aerial-open-traversal`: flight envelope + route progress + terrain/updraft windows + camera descriptors; route progress is a child boundary only.
- `action-defense-extraction`: inventory/harvest/build/wave/core defense + portal/extraction route state; strongest candidate to reuse route-cargo-extraction after `next-ledge` proves consumption.

## ProtoKit decisions

Build/keep/merge:

- Keep `generic-route-progress-kit` atomic.
- Keep `generic-route-cargo-extraction-kit` as a composite coordinator over route progress, resource loop, and pressure loop.
- Keep `generic-resource-loop-kit` and `generic-pressure-loop-kit` as child boundaries.

Prune vocabulary, not implementation:

- Treat `route-checkpoint-kit` and `cargo-delivery-kit` as stale placeholder language when the intended reusable surface is already covered by the generic route-progress and route-cargo-extraction DSKs.

Do not promote to Core yet:

- These route/cargo DSKs should stay in ProtoKits until a canonical Experiments route consumes them and proves local-JS shrink plus headless/replay value.

## Experiment decisions

- `next-ledge`: canonical hardening candidate and first route-progress / route-cargo-extraction consumer.
- `nexus-frontier-signal-isles`: keep canonical as field-engineer composition, but update manifest language so route/cargo concepts point at generic route DSK children rather than stale placeholders.
- `sora-the-infinite`: keep canonical as aerial/open traversal; only route progress should be shared with traversal/cargo.
- `rogue-lite-hellscape-siege`: keep canonical as action-defense-extraction; align extraction route/cargo language to the new generic composite, but do not claim executable lane coverage.
- Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, and similar variants remain folded/backlog pressure until a distinct boundary appears.

## Missing smoke / replay

Missing next:

1. A cutover-manifest smoke that rejects stale `route-checkpoint-kit` / `cargo-delivery-kit` placeholders for `next-ledge`, `nexus-frontier-signal-isles`, `sora-the-infinite`, and `rogue-lite-hellscape-siege` when the route is already mapped to route-progress/cargo-extraction intent.
2. A narrow `next-ledge` route-host migration smoke proving route progress can be read through `engine.n.genericRouteProgress` without claiming cargo/extraction replay yet.
3. A deterministic `next-ledge` fixture using ProtoKits route progress, only after the route-host migration removes duplicated checkpoint ledger code.

## Direct push made

Pushed this `.agent` cycle report only. No runtime file, manifest file, or test runner file was changed in this pass because the safe update path requires replacing existing files and the current connector response did not expose a usable content SHA for those files.

## Exact next main-branch patch plan

1. Update `experiments/domain-kit-cutover-manifest.json`:
   - In `nexus-frontier-signal-isles.domainCutover`, replace `route-checkpoint-kit` with `generic-route-progress-kit` and replace `cargo-delivery-kit` with `generic-route-cargo-extraction-kit`.
   - In `sora-the-infinite.domainCutover`, replace `route-checkpoint-kit` with `generic-route-progress-kit` only; do not add cargo extraction.
   - In `rogue-lite-hellscape-siege.domainCutover`, replace `route-checkpoint-kit` with `generic-route-progress-kit` and replace `cargo-delivery-kit` with `generic-route-cargo-extraction-kit`.
   - Keep status values and bridge notes conservative; do not mark any of these as executable.
2. Add `tests/domain-kit-cutover-route-merge-smoke.mjs`:
   - Assert `next-ledge` includes both generic route DSKs.
   - Assert the three stale placeholder usages above are gone.
   - Assert `sora-the-infinite` does not gain cargo extraction unless an aerial cargo/extraction fixture exists.
   - Assert `signal-bastion` remains the only route with executable route-domain replay coverage.
3. Wire the smoke into `scripts/run-checks.mjs` for both full and deploy checks.
4. After that guard is green, migrate only `next-ledge` ordered checkpoint/objective progress toward `engine.n.genericRouteProgress`; leave tether physics, browser input, collision, camera, Three renderer, HUD, synth/audio, route fiction, and assets in Experiments.