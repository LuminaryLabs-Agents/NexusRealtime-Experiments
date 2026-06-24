# Canonical Route Pruner — 2026-06-24 09:00 ET

## Re-checked durable memory

- Core repo is accessible, but `.agent/intent.md` is still absent, so Core `.agent` memory should not be treated as reviewed.
- ProtoKits intent says Core owns stable runtime primitives and mature DSK contracts; ProtoKits owns reusable domain-service kits before Core promotion; Experiments owns thin playable validation hosts.
- Experiments intent says reusable implementation belongs in ProtoKits and Experiments should focus on canonical routes, presets, bridges, manifests, docs, and tests.
- Current Experiments cycle state names `signal-bastion` as the only executable route-domain lane and the next safe shrink target as browser-host convenience facades, one seam at a time.

## What changed

Shrank one more Signal Bastion browser-host compatibility seam:

- `games/signal-bastion/src/boot.js` now derives `GameHost.getFoundation()` from `engine.n.genericDefense.sessionFacade.getSnapshot()` map state.
- Browser boot no longer installs `createGenericDefenseFoundationKit`.
- `tests/signal-bastion-host-facade-guard-smoke.mjs` now forbids `engine.defenseFoundation.getSnapshot()` returning as a host shortcut and only keeps `defenseBuild.setBlueprint` / `defenseBuild.sell` as explicit remaining build convenience seams.
- `experiments/signal-bastion-route-domain-replay.json` records the foundation seam as a local-JS/facade shrink on the already executable strategic-pressure lane.
- `.agent/cycle-state.md` and `.agent/route-canonicalization.md` now record this as a direct canonical-pruning update.

## Repo state vs `.agent`

Repo state is closer to `.agent`: the foundation seam that was previously called out as the next scoped patch is now actually pushed. The route still does not delete or fold route folders, which matches the policy to avoid destructive pruning until unified canonical route coverage and tests are already in place.

## DSK boundary clarity

The strategic-pressure route now routes common debug and host reads through the same namespaced DSK session/render surfaces:

- state snapshot: `engine.n.genericDefense.sessionFacade.getSnapshot()`;
- foundation/debug map state: derived from the same session snapshot;
- wave preview: derived from the same session snapshot;
- scale/budget snapshot: session snapshot plus render descriptor snapshot;
- placement confirmation: `placementProjector.confirm -> n.genericDefense.sessionFacade.build` through ProtoKits placement-projector proof.

This makes `signal-bastion` less dependent on route-local or compatibility debug facades while keeping renderer/browser concerns outside reusable kit logic.

## Local JavaScript trend

Local experiment JavaScript shrank in ownership and facade surface, not route count: one installed compatibility kit and one direct `engine.defenseFoundation.getSnapshot()` shortcut were removed from the browser host. No reusable implementation was added to Experiments.

## Higher-level domains

- Strongest executable lane: `strategic-pressure-loop` through `signal-bastion`.
- Next consumer candidate remains `traversal-cargo-pressure` through `next-ledge`, but cargo/resource/pressure replay must stay planned until the route consumes those ProtoKit boundaries.
- Other lanes remain contract-only: survey pressure, survival ecology, aerial/open traversal, field-engineer composition, and action-defense-extraction.

## ProtoKit decisions

- Keep/build: `generic-defense-dsk-boundaries`, its seven atomic aliases, and `engine.n.genericDefense.<boundary>`.
- Keep as migration bridge only: `generic-defense-aaa-dsk-bridge`.
- Do not promote: broad `generic-defense-aaa-kits` or the remaining browser compatibility facades.
- Next ProtoKit-backed consumer target: route-progress/cargo extraction only after the `next-ledge` host can remove duplicated local ledger/checkpoint ownership.

## Experiment decisions

- Keep canonical and harden: `signal-bastion`.
- Keep route variants folded/held as metadata; do not delete destructive variants yet.
- Keep `next-ledge` as the next canonical consumer candidate, but do not claim executable traversal/cargo replay until route-cargo/resource/pressure DSKs are actually consumed.

## Missing smoke/replay coverage

- Full local check execution was not run in this connector-only environment; the changed guard is static and wired into the existing check suite.
- Still missing executable replay lanes for traversal/cargo, survey, survival ecology, aerial/open traversal, field-engineer composition, and action-defense-extraction.
- Remaining Signal Bastion shrink seams: `defenseBuild.setBlueprint` and `defenseBuild.sell`; the installed wave compatibility kit should only be removed after proving no browser/debug path relies on it.

## Direct push

Pushed to `main` in `LuminaryLabs-Agents/NexusRealtime-Experiments`:

- `games/signal-bastion/src/boot.js`
- `tests/signal-bastion-host-facade-guard-smoke.mjs`
- `experiments/signal-bastion-route-domain-replay.json`
- `.agent/cycle-state.md`
- `.agent/route-canonicalization.md`
- `.agent/cycle-reports/2026-06-24-canonical-route-pruner-0900.md`

## Safest next patch

Run the full check suite in a normal checkout with package dependencies installed. If green, evaluate the remaining build convenience seams in this order:

1. Keep `setBlueprint` if it is only UI affordance state; otherwise replace it with a namespaced session-facade active-blueprint method in ProtoKits first.
2. Replace or justify `sell` only after ProtoKits exposes a namespaced sell/deconstruct method with replay coverage.
3. Remove the installed wave compatibility kit only after browser host and debug surfaces prove they no longer need it.
