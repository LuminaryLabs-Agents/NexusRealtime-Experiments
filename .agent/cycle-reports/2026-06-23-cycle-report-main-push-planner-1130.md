# Cycle Report Main Push Planner — 2026-06-23 11:30 ET

## What changed

- Reviewed Core, ProtoKits, and Experiments `.agent/` memory before choosing a patch.
- Confirmed the newest repo state is already centered on Signal Bastion route-domain replay spec coverage and on guarding canonical-route replay lanes.
- Directly pushed only safe `.agent` memory updates to Experiments `main`:
  - updated `.agent/cycle-state.md` to point to this cycle report and record the executable-replay package-wiring gate;
  - updated `.agent/replay-qa.md` to warn against closing the remaining replay gap with duplicate route-local simulation in Experiments;
  - added this report.

No route, renderer, ProtoKit implementation, or destructive pruning was changed in this pass.

## Long-form intent from `.agent/`

The ecosystem intent remains cumulative expansion through reusable domain layers:

- Core owns stable runtime primitives, deterministic ECS/tick behavior, promoted DSK contracts, and mature reusable surfaces.
- ProtoKits owns reusable domain-service kits before Core promotion.
- Experiments owns thin playable validation hosts: routes, presets/config, bridges from browser input into kit APIs, runtime ticking, snapshots/descriptors, docs, and tests.
- DSKs are domain communication layers, not gap fillers. They should expose resources, events, methods/APIs, snapshots, and descriptors.

## Repo state vs `.agent/`

Repo state mostly matches `.agent`:

- Experiments canonical status is intentionally smaller than the older 20-name target. The manifest currently owns seven canonical routes: `next-ledge`, `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, `signal-bastion`, and `rogue-lite-hellscape-siege`.
- The 20-route memory remains useful as a portfolio lens, not a manifest quota.
- Route-level replay coverage has advanced from manifest metadata to checked lane contracts and a checked Signal Bastion route-domain replay spec.
- Only `strategic-pressure-loop` / `signal-bastion` is ProtoKit-backed by executable generic-defense replay today. The other lanes remain planned or contract-only.

Main drift still to guard:

- The next replay step wants an executable browserless Signal Bastion harness, but Experiments currently has no stable local package/workspace import wiring for Core plus ProtoKits in Node checks. Adding a duplicate defense interpreter in Experiments would violate the boundary and grow local JS.

## DSK boundary clarity

Clearer. The strongest reusable boundary is still the generic-defense split/alias surface in ProtoKits:

- map / path / vital target;
- economy wallet;
- build placement and structure runtime;
- wave and agent director;
- combat resolver;
- session facade;
- render descriptors.

Experiments should keep Signal Bastion as a browser host that bridges input and consumes descriptors, not as a second owner of defense simulation.

## Local experiment JavaScript

Not shrinking yet in code, but this pass avoided adding route-local JavaScript. The replay gate recorded in `.agent/replay-qa.md` should prevent the next cycle from creating fake executable replay coverage inside Experiments.

## What should be built next

Safest next build is one of these two paths:

1. Preferred: add real package/workspace import wiring so an Experiments Node smoke can import Core and ProtoKits generic-defense DSK aliases, run the checked Signal Bastion fixed-tick plan, and assert descriptor digests without DOM, Canvas, WebGL, animation frames, browser audio, asset loading, or pointer timing.
2. Fallback: add a small guard smoke that keeps the executable route replay blocked until real imports are available and asserts no duplicate route-local defense replay implementation is introduced.

## What should be pruned

- Do not delete route folders yet.
- Keep generated gallery seed/backlog routes out of `canonicalRoutes[]` until they produce reusable domain pressure and replay/smoke coverage.
- Avoid duplicate Signal Bastion replay logic under Experiments.

## ProtoKits to promote or prepare

- Keep `generic-pressure-loop-kit`, `generic-resource-loop-kit`, `generic-action-window-kit`, and `generic-affordance-descriptor-kit` as stable generic promotion candidates.
- Continue preparing `generic-defense-kits` for non-destructive atomic DSK wrapper promotion through the existing named aliases.
- Do not promote browser or renderer logic.

## Experiments to keep canonical

Current manifest-owned canonical set remains:

- `next-ledge`
- `fogline-relay`
- `nexus-frontier-signal-isles`
- `sora-the-infinite`
- `zombie-orchard`
- `signal-bastion`
- `rogue-lite-hellscape-siege`

## Smoke/replay gaps that matter

- Remaining top gap: executable browserless Signal Bastion route-domain replay against real Core + ProtoKits imports.
- Other lane gaps: survey pressure, survival ecology, traversal/cargo, aerial/open traversal, field-engineer composition, and action-defense-extraction remain planned fixture lanes.
- Integration gap: Core-backed import coverage remains blocked until package/workspace wiring is explicit.

## Direct-main push plan executed

Target repo: `LuminaryLabs-Agents/NexusRealtime-Experiments`

Target branch: `main`

Commit groups:

1. `docs(agent): update cycle state for main push planner`
   - `.agent/cycle-state.md`
2. `docs(agent): record main push replay gate`
   - `.agent/replay-qa.md`
3. `docs(agent): add main push planner report`
   - `.agent/cycle-reports/2026-06-23-cycle-report-main-push-planner-1130.md`

`.agent` files updated:

- `.agent/cycle-state.md`
- `.agent/replay-qa.md`
- `.agent/cycle-reports/2026-06-23-cycle-report-main-push-planner-1130.md`

Code files updated: none.

Test files updated: none.

Test plan:

- No code/test files changed, so this pass does not require a full runtime test before push.
- Next implementation patch should run `npm run check` and `npm run check:deploy` in Experiments.
- If package wiring is added, also run ProtoKits `npm run check` and any Core check suite exposed by the Core repo.

Rollback notes:

- Revert the three `.agent` commits above if the package-wiring gate is superseded by real workspace imports or if a more direct executable replay implementation lands first.
- No route/code rollback is needed because this pass changed only `.agent` memory.

## What remains for next cycle

- Verify whether package/workspace import wiring can safely be added without broad repo coupling.
- If yes, implement the executable Signal Bastion route-domain replay using real Core and ProtoKits generic-defense DSK aliases.
- If no, add a guard smoke that fails if Experiments grows a duplicate defense simulation/replay interpreter instead of importing real reusable kits.