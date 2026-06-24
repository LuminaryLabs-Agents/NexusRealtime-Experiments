# Canonical Route Pruner — 2026-06-24 03:00

## What changed

Signal Bastion's remaining placement bridge is now guarded as a namespaced DSK route contract instead of an unresolved compatibility-facade seam.

Pushed to Experiments `main`:

- `experiments/signal-bastion-route-domain-replay.json`
- `tests/signal-bastion-placement-namespace-contract-smoke.mjs`
- `scripts/run-checks.mjs`
- `.agent/cycle-state.md`
- `.agent/protokit-map.md`
- `.agent/route-canonicalization.md`
- `.agent/smoke-tests.md`
- `.agent/replay-qa.md`
- `.agent/cycle-reports/2026-06-24-canonical-route-pruner-0300.md`

## .agent long-form intent

The long-form intent remains cumulative reusable DSK expansion with shrinking local experiment JavaScript. Reusable implementation belongs in ProtoKits. Experiments should stay thin: canonical routes, presets, bridges, manifests, docs, tests, and renderer-only presentation. DSKs should connect domains through resources, events, methods, snapshots, and descriptors.

## Repo state versus .agent

Experiments now matches the latest ProtoKits placement-projector namespace state more closely:

- ProtoKits owns and tests the reusable placement projector behavior in `tests/generic-defense-placement-projector-namespace-smoke.test.mjs`.
- Experiments now records that source smoke in `experiments/signal-bastion-route-domain-replay.json`.
- Experiments now has `tests/signal-bastion-placement-namespace-contract-smoke.mjs`, which guards the route-side bridge from drifting back to direct compatibility build calls.

Core is still accessible, but Core `.agent/intent.md` was not present when checked. Core `.agent` memory should not be treated as reviewed until the folder exists or can be fetched later.

## DSK boundary clarity

The strategic-pressure lane is clearer. Placement input remains browser-host owned, but placement confirmation is contractually routed through `n.genericDefense.sessionFacade.build`. The route now has a smoke guard that forbids direct `engine.defenseBuild.build` and legacy `engine.genericDefense.build` placement shortcuts.

The remaining build convenience seams are explicit: `defenseBuild.setBlueprint` and `defenseBuild.sell`. Foundation snapshot, wave preview, and scale budget convenience seams remain explicit and should be reduced or justified one at a time.

## Local experiment JavaScript

Playable route JavaScript did not shrink in file size this cycle, but ownership shrank: the placement seam is no longer tracked as an unresolved compatibility build path. The added JavaScript is a static smoke guard that prevents future route-local or compatibility-facade regression.

No reusable kit implementation was added to Experiments.

## Higher-level domains

- Strongest executable lane: `strategic-pressure-loop` through `signal-bastion`.
- Concrete next consumer candidate: `traversal-cargo-pressure` through `next-ledge`, using `generic-route-progress-kit` and `generic-route-cargo-extraction-kit` only after route-local checkpoint/cargo logic can be removed.
- Still contract-only: survey pressure, survival ecology, aerial/open traversal, field-engineer composition, and action-defense-extraction.

## ProtoKit decisions

- Keep/build: `generic-defense-dsk-boundaries`, its seven atomic aliases, and `engine.n.genericDefense.<boundary>` namespace.
- Keep as migration bridge: `generic-defense-aaa-dsk-bridge`.
- Treat ProtoKits `generic-defense-placement-projector-namespace-smoke.test.mjs` as source proof for the placement projector namespace seam.
- Do not promote the broad AAA compatibility facade to Core.
- Do not add another executable route-domain lane until a real reusable ProtoKit boundary exists and the route consumes it.

## Experiment decisions

- Keep canonical: `signal-bastion`.
- Do not create Signal Bastion V1/V2/V3 forks.
- Keep defense variants folded/held as backlog pressure until the canonical strategic-pressure route has enough browser-host shrink and smoke/replay coverage to justify destructive pruning.
- Keep `next-ledge` as the first route-progress/cargo consumer candidate, but do not claim executable replay or local JS shrink until the host actually consumes the ProtoKit boundary and drops duplicated checkpoint/cargo ledger code.

## Missing smoke/replay coverage

- Still missing executable lanes for traversal/cargo, survey pressure, survival ecology, aerial/open traversal, field-engineer composition, and action-defense-extraction.
- Still missing a safe namespaced replacement or justification for `defenseBuild.setBlueprint`, `defenseBuild.sell`, `defenseWaves.previewNextWave`, `defenseFoundation.getSnapshot`, and `defenseScale.getBudgetSnapshot`.
- I could not run the full check suite in this environment. The pushed smoke is static and wired into both full and deploy checks; it should be run in a normal checkout with package dependencies installed.

## Safest next main-branch patch plan

1. Run `npm run check` and `npm run check:deploy` in a normal Experiments checkout.
2. If green, pick one remaining Signal Bastion convenience seam and either replace it with a namespaced DSK/session/descriptor method or add a narrow guard explaining why it must remain browser-host-only.
3. Only after the strategic-pressure host seams are stable, migrate `next-ledge` ordered checkpoint progress into `generic-route-progress-kit` and remove the duplicated route-local ledger code. Do not claim a second executable lane until that route consumes a real ProtoKit boundary and has a deterministic route-domain replay.
