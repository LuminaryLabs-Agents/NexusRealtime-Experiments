# NexusRealtime Kit Injection Request

You are building a conservative kit-injection proposal for NexusRealtime.

Repo: NexusRealtime-Experiments
Branch: main
Head: 5bdd946b5580
Game: games/rogue-lite-hellscape-siege
Feedback: feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md

Hard constraints:
- Do not remove functionality.
- Do not mutate existing game files in the proposal.
- Reusable implementation belongs in ProtoKits unless the repo explicitly needs a local proof fixture.
- Keep browser, DOM, Canvas, WebGL, Three.js, pointer input, audio, asset loading, and route-specific copy local.
- Prefer one reversible kit seam at a time.
- Require preservation checks before any source migration.

Required output:
1. Current game diagnosis.
2. Kit extraction candidates ordered by safety.
3. Exact files that should stay local.
4. Exact files or folders that should be added later.
5. Validation commands and human-view checks needed.
6. A first bounded implementation slice that preserves behavior.

## Local Kit Folders
- protokits/cel-shading-kit
- protokits/coconut-prop-kit
- protokits/fall-motion-kit
- protokits/fish-motion-kit
- protokits/fish-school-kit
- protokits/float-motion-kit
- protokits/float-prop-kit
- protokits/island-kit
- protokits/normal-style-kit
- protokits/orbit-camera-kit
- protokits/outline-sobel-kit
- protokits/palm-tree-kit
- protokits/reflect-probe-kit
- protokits/timer-kit

## Sibling ProtoKit Folders
- sibling ProtoKits checkout not found

## Repo Memory And Feedback

### goal.md

```md
# Goal: Kit Extraction And Repeatable Experiments

## Intent

Make NexusRealtime-Experiments easier to duplicate, template, and harden by turning game-local kit seams into documented ProtoKit extraction candidates without removing existing game behavior.

## Criteria

- Work from `LuminaryLabs-Agents/NexusRealtime-Experiments` on `main`.
- Keep `main` current with `origin/main` before edits.
- Do not edit existing game code for the first feedback pass.
- Add a repeatable experiment structure for future games and migrations.
- Add a feedback-folder convention for route-specific kit extraction notes.
- Add `NexusRealtime-KitInjector`, a linear CLI that reads repo memory, current game files, current kits, and route feedback before asking NVIDIA NIM GLM 5.1 for a kit-injection plan.
- Keep reusable implementation out of Experiments unless the repo explicitly chooses a local proof fixture.

## Current Slice

- First target game: `games/rogue-lite-hellscape-siege/`.
- First output mode: docs and proposal packets only.
- First injector mode: dry-run context packet by default; NIM call only when explicitly requested with credentials.
```

### memory.md

```md
# NexusRealtime-Experiments Memory

## Purpose
NexusRealtime-Experiments hosts playable browser experiments that compose NexusRealtime and ProtoKits into app-specific pages.

## Architecture
- Experiments own branded app configuration, presets, copy, routes, and renderer-host decisions.
- `experiments/dsk-first-wave-proof/` is the minimal direct-import DSK validation route. It uses a browser import map for bare `nexusrealtime`, imports first-wave ProtoKit N aliases from `NexusRealtime-ProtoKits`, and proves installed APIs under `engine.n.*`.
- The Open Above is split into `index.html`, `open-above.config.js`, and `open-above.js`.
- The Open Above composes generic ProtoKit DSKs directly from `open-above.js`; app-specific tuning stays in `open-above.config.js`.
- The Open Above exposes `window.GameHost` for private NexusSimulator validation.

## Conventions
- Do not put The Open Above presets or app-specific tuning into ProtoKits.
- Use `docs/VISUAL-EXPERIMENT-LOOP.md` for target-image upgrade passes: visual differences become ProtoKit gaps only when reusable, otherwise they stay in the experiment route, renderer, input, UI, or content.
- Use `goal.md` for the active repo goal when a task introduces a multi-step architecture direction.
- Use `docs/repeatable-experiment-structure.md` and route-local `feedback/<route-slug>/` folders before migrating game-local kit seams.
- `tools/NexusRealtime-KitInjector/kit-injector.mjs` is the additive proposal CLI. It writes a context packet by default, calls NVIDIA NIM GLM 5.1 only with explicit `--call-nim` plus `NVIDIA_API_KEY` or `NVIDIA_NIM_API_KEY`, and must not mutate existing game files.
- The Open Above is a high-fidelity bird flight and terrain-streaming simulator.
- The Open Above should not use wind/updraft gameplay forces, checkpoint rings, ring challenges, or terrain ring objectives.
- Ambient clouds, lighting, and atmosphere are allowed only as presentation descriptors.
- Keep validation state explicit enough for NexusSimulator to prove airborne motion, terrain streaming, and no console errors.
- For the 100-game AAA experiment track, every batch must start with `gpt-it` in the NexusRealtime/Experiments ChatGPT project, then local implementation must verify GPT advice against repo files before editing. Future batch additions should preserve unique fantasy, verb, pressure loop, visual identity, kit/DSK composition, GameHost smoke coverage, and renderer-as-presentation boundaries.
- Batch 02 established `generic-pressure-loop-kit` + planned `generic-resource-loop-kit` as reusable DSK composition markers for new AAA seeds; GameHost owns resource/pressure/rejection/completion state, while canvas renderers stay presentation-only.
- Batch 03 extracted AAA action validation into `experiments/aaa-batch/host/action-contract.js`; future batches should keep declared actions and rejection reasons data/host-owned, not renderer-owned.
- Batch 04 extracted AAA affordance availability into `experiments/aaa-batch/host/affordance-contract.js`; future batches should expose available affordance descriptors in GameHost state and keep target usability out of renderers.
- Batch 05 continues the shared AAA route pattern with 40 total data-driven seeds; future batches should keep route files tiny and put unique fantasy, verb, pressure loop, palette, actions, smoke steps, and affordance descriptors in `experiments/aaa-batch/host/game-registry.js`.
- Batch 06 brings the shared AAA route set to 48 seeds and confirms the scaling pattern: add only route shells plus registry data, arcade entries, backlog rows, memory note, and smoke count unless a generic host/kit gap appears.
- Batch 07 brings the shared AAA route set to 56 seeds from `gpt-it` output; GitHub connector review confirmed it cannot push local-only commits because the commit objects are not present remotely, so local `gh auth` remains the push blocker.
- Batch 08 brings the shared AAA route set to 64 seeds from `gpt-it` output; future route batches should keep using compact GPT lists, then map each idea into the same registry-driven GameHost affordance smoke path.
- Batch 09 brings the shared AAA route set to 72 seeds from `gpt-it` output; when GPT truncates a route line, preserve the returned slug/title/fantasy/verb and complete only the missing operational details conservatively inside the existing registry schema.

- Batch 10 brings the shared AAA route set to 80 seeds using GPT-sourced route ideas plus the existing registry-driven route shell pattern.

- The 100-game AAA experiment catalog is implemented in the shared registry-driven route shell. The final 20 games came from `gpt-it` output and continue the pressure/resource/action-window/affordance DSK composition marker pattern. Phase 2 SimTime QA should start only after `npm run check` passes on the complete catalog.
```

### README.md

```md
# NexusRealtime Experiments

Browser experiments that compose NexusRealtime Core and ProtoKits into playable validation slices.

## Agent Operating Memory

This repo uses `.agent/` as repo-local project memory.

Before making architecture, route, pruning, kit, experiment, validation, replay, or test changes, read:

1. `.agent/START_HERE.md`
2. `.agent/cycle-state.md`
3. `.agent/route-canonicalization.md` when route-related
4. latest relevant `.agent/cycle-reports/*`

Agent work should leave either a cycle-state update, a cycle report, or a turn-ledger entry in `.agent/turn-ledger/`.

## Canonical route rule

Every playable game or experiment should have one base-name route. Do not add V1/V2 gallery cards. Fold successful variants back into the base folder and remove versioned playable routes only after the unified implementation and tests are already in place.

The current canonical routes are tracked in:

```txt
experiments/domain-kit-cutover-manifest.json
```

## Domain-kit cutover target

New and migrated experiments should compose reusable NexusRealtime / ProtoKit domains, keep game-specific behavior in bridge or preset code, and keep renderers presentation-only.

Core target kit families include:

```txt
action-input-kit
generic-defense-dsk-boundaries
generic-defense-aaa-dsk-bridge
generic-route-progress-kit
generic-route-cargo-extraction-kit
generic-resource-loop-kit
generic-pressure-loop-kit
timed-pressure-director-kit
zone-field-kit
scan-survey-kit
agent-group-kit
resource-pressure-kit
hazard-director-kit
content-preset-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
deterministic-replay-harness
gamehost-standard-kit
```

## Current canonical routes

### Next Ledge

`experiments/next-ledge/` is a cinematic grapple-climb validation demo. It imports the real NexusRealtime runtime, composes the Next Ledge cinematic ascent ProtoKit, maps browser input into route APIs, ticks the runtime, and renders snapshots with Three.js.

Cutover target: preserve climb feel while migrating action input, route progress, cargo/extraction, risk/resource pressure, camera, feedback, and replay snapshots into domain-kit-owned state. Route-progress consumption is now executable through `engine.n.genericRouteProgress`; cargo/resource/pressure consumption and route-level deterministic replay are still planned.

### Fogline Relay

`experiments/fogline-relay/` is a first-person fog-forest relay experiment. It composes reusable kit surfaces, keeps the Canvas renderer presentation-only, and validates renderer-agnostic visual buckets, fog volumes, volumetric light descriptors, relay scanning, objective flow, and wraith hazards.

Cutover target: make this the canonical `scan-survey-kit` + `zone-field-kit` + `timed-pressure-director-kit` + `fogline-survey-pressure-bridge-kit` validation slice.

### Nexus Frontier Signal Isles

`experiments/nexus-frontier-signal-isles/` is the broad kit-utilization showcase route. It should remain a composition/preset/bridge validation host rather than a branded stable game kit.

Cutover target: keep broad field-engineer composition useful while extracting reusable route, cargo, pressure, scan, resource, build, hazard, descriptor, and replay seams into ProtoKits.

### Sora the Infinite

`experiments/sora-the-infinite/` is the aerial/open traversal validation lane.

Cutover target: preserve flight feel while moving route checkpoints, terrain/updraft windows, camera descriptors, and replay snapshots toward reusable DSK surfaces.

### Zombie Orchard

`experiments/zombie-orchard/` is a kit-composed survival experiment. The game layer should compose kits, define content, feed input into kit APIs/resources, read snapshots/events, and render a canvas view.

Cutover target: preserve survival controls and wave pacing while aligning rounds, horde pressure, resources, pickups, weapons, orchard content, and debug state with domain-kit architecture.

### Signal Bastion

`games/signal-bastion/` is the strongest current strategic-pressure canonical route and the only route-domain lane with executable replay proof.

It composes the ProtoKits `generic-defense-aaa-dsk-bridge` and seven explicit generic-defense DSK aliases instead of the broad compatibility bundle. Migrated seams should prefer `engine.n.genericDefense.sessionFacade` and `engine.n.genericDefense.renderDescriptors`; remaining convenience seams should be removed or justified one at a time without moving browser, DOM, Canvas, frame timing, pointer input, audio, or asset loading into reusable kit logic.

Cutover target: prove a generic defense DSK spine for paths, build slots, vital targets, structures, waves, agents, projectiles, currency, and renderer-only descriptors before promoting smaller mature contracts.

### Rogue-Lite Hellscape Siege

`games/rogue-lite-hellscape-siege/` is the canonical base route for the high-fidelity rogue-lite base-defense game. The old `games/rogue-lite-hellscape-siege-v2/` route has been folded into this base route and removed from the arcade.

Cutover target: preserve realm portals, inventory, harvesting, pickups, build blueprints, wave/core defense, FX, and renderer-only presentation while replacing local temporary kits with shared domain ProtoKits.

## Validation expectations

- Keep local experiment JavaScript shrinking over time.
- Keep reusable kit implementation in ProtoKits, not Experiments.
- Keep browser, renderer, DOM, Canvas, WebGL, Three.js, pointer lock, browser audio, and asset loading outside reusable kit logic.
- Move every meaningful domain boundary toward headless tick smoke tests and deterministic replay.
- Do not destructively delete routes unless the unified canonical route and tests are already in place.
```

### .agent/START_HERE.md

```md
# Agent Start Here

`.agent/` is the repo-local source of truth for agent work in `NexusRealtime-Experiments`.

Before architecture, route, pruning, kit, experiment, validation, replay, or test decisions:

1. Read `.agent/START_HERE.md`.
2. Read `.agent/cycle-state.md` for the current project state.
3. Read `.agent/route-canonicalization.md` when touching canonical routes, route folds, route additions, replay lanes, or seeder pressure.
4. Read the latest relevant `.agent/cycle-reports/*` file when a prior cycle report exists for the current concern.
5. Make one bounded change that advances the current ledge.
6. Record the result in `.agent/turn-ledger/`, `.agent/cycle-state.md`, or a cycle report.

## Operating Rule

Agent work should preserve the current NexusRealtime direction:

- Grow reusable ProtoKit domain layers.
- Shrink local experiment JavaScript over time.
- Keep reusable implementation in ProtoKits, not Experiments.
- Keep browser, renderer, DOM, Canvas, WebGL, Three.js, audio, pointer input, and asset loading out of reusable kit logic.
- Keep route additions, destructive folds, canonical-route changes, and replay-lane claims documented before or with the change.

## Minimum Read Set

```txt
.agent/START_HERE.md
.agent/cycle-state.md
.agent/route-canonicalization.md when route-related
latest relevant .agent/cycle-reports/* when available
```

## Leave the Next Ledge

Every meaningful agent turn should end with a specific next ledge: the next smallest safe patch, check, audit, or decision that another agent can pick up without rediscovering the whole state.
```

### .agent/cycle-state.md

```md
# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Agent operating contract:

- Start each agent turn at `.agent/START_HERE.md`.
- Treat `.agent/cycle-state.md` as the current project state.
- Use `.agent/turn-ledger/` for meaningful per-turn records.
- Keep changes bounded to the current ledge unless explicitly directed.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: keep `signal-bastion` as the only executable route-domain lane while shrinking its browser-host seams toward `engine.n.genericDefense` one guarded seam at a time. The placement seam has cross-repo proof, wave-preview/foundation/budget snapshots now read namespaced session/render snapshots, and the build blueprint/sell seams now come from ProtoKits `generic-defense-session-command-kit` instead of broad build/wave compatibility facades. In parallel, `next-ledge` imports `generic-route-progress-kit`, exposes route-progress snapshots through `domain.routeProgress`, syncs climb anchors through `engine.n.genericRouteProgress`, has a checked route-progress replay spec, and now has a checked route-cargo-extraction composite consumption plan. Cargo/resource/pressure source migration and full route-level deterministic replay remain planned before any second executable lane claim.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep destructive route folds blocked until the canonical route has real replay coverage plus browser-host migration evidence. Do not add Harbor Salvage, Cargo Chain, Sky Courier, Trainyard Switcher, Dungeon Relay, Floodplain Rescue, or other checkpoint/cargo variants as filler canonical routes; fold their pressure into the `next-ledge` delivery/extraction loop until they prove a distinct reusable DSK boundary.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/twenty-experiment-seeder-map.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, `experiments/headless-lane-replay-contracts.json`, `experiments/signal-bastion-route-domain-replay.json`, `experiments/next-ledge-route-progress-replay.json`, `experiments/next-ledge-route-cargo-extraction-plan.json`, `experiments/executable-route-replay-import-gates.json`, the Signal Bastion strategic-pressure bridge/spec/import-gate/executable/facade/static/placement/presentation smokes, and the Next Ledge route/cargo, route-progress spec, route-cargo-extraction plan, seeder map, and canonical replay manifest smokes against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, local JavaScript reduction opportunities, package-wiring assumptions, broad compatibility-facade regression, legacy `engine.genericDefense` browser calls, accidental route-local simulation ownership, stale route-checkpoint/cargo-delivery placeholders, missing route-progress namespace consumption, stale seeder claims about already-closed Signal Bastion host facades, premature route-cargo-extraction replay claims before the route consumes cargo/resource/pressure DSKs, and presentation bridge drift where Canvas/HUD/pointer projection starts owning reusable generic-defense state or descriptor generation.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-24-twenty-experiment-seeder-1325.md`.

Latest Agent Ledger Bootstrap update: `.agent/START_HERE.md`, `.agent/PROCESS.md`, `.agent/turn-ledger/README.md`, `.agent/templates/ledger-entry-template.md`, and `.agent/turn-ledger/2026-06-25-agent-ledger-bootstrap.md` now establish `.agent/` as the repo-local operating memory and per-turn decision ledger. This is documentation/process-only; no route code, tests, canonical route lists, ProtoKit imports, runtime behavior, or gameplay behavior changed.

Latest Twenty Experiment Seeder update: `experiments/twenty-experiment-seeder-map.json`, `tests/twenty-experiment-seeder-map-smoke.mjs`, `experiments/canonical-route-replay-manifest.json`, and `tests/canonical-route-replay-manifest-smoke.mjs` now align the portfolio map with current downstream state. `next-ledge` is recorded as a partial `generic-route-progress-kit` consumer, while the remaining delivery/extraction seed pressure is cargo/resource/pressure consumption through `generic-route-cargo-extraction-kit`. `signal-bastion` no longer carries closed foundation, wave, scale, setBlueprint, or sell seams as seeder shrink targets; its next seeder pressure is presentation bridge hardening while it remains the only executable route-domain replay lane. This is manifest/test/agent alignment only; no reusable implementation moved into Experiments and no new local JavaScript shrink is claimed by this patch.

Latest Composite Domain Kit Builder update: `experiments/next-ledge-route-cargo-extraction-plan.json`, `tests/next-ledge-route-cargo-extraction-plan-smoke.mjs`, and `scripts/run-checks.mjs` now pin the safe Next Ledge composite route-cargo migration gate. The checked plan keeps `generic-route-cargo-extraction-kit` as the next delivery/extraction target, requires `engine.n.genericRouteCargoExtraction` to coordinate `engine.n.genericRouteProgress`, `engine.n.genericResourceLoop`, and `engine.n.genericPressureLoop`, and blocks a premature executable lane claim while the route still lacks cargo/resource/pressure source consumption. This is Experiments manifest/test hardening only: no reusable implementation moved into Experiments and no composite local-JavaScript shrink is claimed yet.

Latest Cycle Report Main Push Planner update: `tests/signal-bastion-presentation-bridge-smoke.mjs` is now wired into both full and deploy checks. It guards the remaining Signal Bastion gap as presentation bridge hardening: boot/input may bridge through the presentation stack and namespaced session/render descriptors, and renderer may own Canvas/HUD/pointer hit projection, but reusable state mutation, command/session semantics, descriptor generation, fixed ticks, and route-local simulation remain outside the renderer/browser presentation surface. This is test hardening only; no new local JavaScript shrink is claimed.

Latest Twenty Game Refiner update: `experiments/next-ledge-route-progress-replay.json` and `tests/next-ledge-route-progress-replay-spec-smoke.mjs` now pin Next Ledge's partial route-progress DSK seam around `engine.n.genericRouteProgress`, `domain.routeProgress`, route checkpoint resources/events/methods/snapshots/descriptors, and browser/renderer ownership exclusions. The smoke is wired into both full and deploy checks through `scripts/run-checks.mjs`; it explicitly keeps `generic-route-cargo-extraction-kit` unclaimed and cargo/resource/pressure replay planned, so `signal-bastion` remains the only executable route-domain lane. No new local JavaScript shrink is claimed from this spec hardening.

Latest ProtoKit Promotion Gate update: ProtoKits added `generic-defense-session-command-kit` and its headless smoke/determinism guard. Experiments Signal Bastion now imports that kit, installs it beside the seven generic-defense DSK aliases, removes `createGenericDefenseBuildKit` and `createGenericDefenseWaveKit` from browser boot, and routes blueprint selection plus sell through `engine.n.genericDefense.sessionFacade`. This is a real local-JS/facade shrink; reusable implementation stayed in ProtoKits.

Latest Canonical Route Pruner update: `games/signal-bastion/src/boot.js` now derives `GameHost.getFoundation()` from `engine.n.genericDefense.sessionFacade.getSnapshot()` map state and no longer installs `createGenericDefenseFoundationKit`. `tests/signal-bastion-host-facade-guard-smoke.mjs` now allows only the DSK bundle, build, wave, and authoring host facades, and explicitly forbids `engine.defenseFoundation.getSnapshot()` from returning as a browser-host shortcut. This is a small real local-JS/facade shrink in Experiments; reusable implementation remains in ProtoKits and destructive route pruning remains blocked.

Latest API Surface Pruner update: `experiments/next-ledge/src/session.js` now composes `createGenericRouteProgressKit`, builds route checkpoints from climb anchors, syncs reached anchors through `engine.n.genericRouteProgress`, and exposes `domain.routeProgress` in snapshots. `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-replay-manifest.json`, `tests/next-ledge-route-cargo-cutover-smoke.mjs`, and `tests/canonical-route-replay-manifest-smoke.mjs` now distinguish the executable route-progress seam from still-planned cargo/resource/pressure replay work. This is an Experiments consumption/guard patch only; reusable kit implementation remains in ProtoKits.

Prior Twenty Experiment Seeder update: `experiments/twenty-experiment-seeder-map.json` and `tests/twenty-experiment-seeder-map-smoke.mjs` added a checked per-route seeder decision layer for every manifest-owned canonical route. The smoke is wired into both full and deploy checks through `scripts/run-checks.mjs`; it keeps the portfolio below 20 without filler routes, proves only `signal-bastion` claims executable route-domain replay, keeps `next-ledge` as the first route/cargo seed-hardening candidate, and records which local JavaScript should remain host/presentation code versus move toward ProtoKits. This is manifest/test hardening only; no local JavaScript shrink is newly claimed.

Latest Atomic Domain Kit Expander update: `.agent/cycle-reports/2026-06-24-atomic-domain-kit-expander-0628.md` records that no new atomic ProtoKit should be built before downstream proof. ProtoKits already has the needed route-progress atom and route-cargo composite; the next safe Experiments patch is manifest/test guard alignment for `generic-route-progress-replay-smoke.test.mjs`, then a narrow `next-ledge` source migration that drives only objective/checkpoint progress through `engine.n.genericRouteProgress`. No local JavaScript shrink is newly claimed from this report.

Latest Intent Miner update: `README.md` was restored from the unrelated Luminary Outreach document back to NexusRealtime Experiments documentation. The restored README now states the canonical-route rule, domain-kit cutover target, current canonical route portfolio, and Signal Bastion's `generic-defense-aaa-dsk-bridge` / seven-alias `engine.n.genericDefense` migration status. This was a docs alignment push only; no reusable kit implementation moved into Experiments and no local route JavaScript shrink is newly claimed from the README change.

Prior Cycle Report Main Push Planner update: reviewed the latest ProtoKits route-progress/cargo-extraction memory and Experiments Signal Bastion host state. The safe foundation seam patch identified in `.agent/cycle-reports/2026-06-24-cycle-report-main-push-planner-0528.md` has since landed and is recorded below; do not treat the older blocked write note as current repo state.

Latest Twenty Game Refiner change: `experiments/domain-kit-cutover-manifest.json` now maps `next-ledge` to the concrete route/cargo ProtoKits instead of stale traversal placeholders, `tests/next-ledge-route-cargo-cutover-smoke.mjs` guards the manifest/replay planned-vs-executable boundary, and `scripts/run-checks.mjs` wires that smoke into both full and deploy checks. This is manifest/test hardening only; no local experiment JavaScript shrink is claimed until `next-ledge` actually consumes the route/cargo DSKs.

Latest Headless Tick Smoke Builder change: `games/signal-bastion/src/boot.js` now implements `getSignalBastionBudgetSnapshot(engine)` from the namespaced generic-defense session snapshot and render descriptor snapshot. The browser boot no longer installs `createGenericDefenseScaleKit`, and `tests/signal-bastion-host-facade-guard-smoke.mjs` forbids returning to `engine.defenseScale.getBudgetSnapshot`. This is a small local-JS/facade shrink in Experiments; no reusable kit implementation moved into Experiments.

Latest ProtoKit Promotion Gate change: `games/signal-bastion/src/boot.js` now implements `getSignalBastionWavePreview(engine)` through `engine.n.genericDefense.sessionFacade.getSnapshot()` and `tests/signal-bastion-host-facade-guard-smoke.mjs` forbids returning to `engine.defenseWaves.previewNextWave`. This is a small but real local-JS/facade shrink in Experiments; no reusable kit implementation moved into Experiments.

Latest Canonical Route Pruner change: `experiments/signal-bastion-route-domain-replay.json` now records the ProtoKits placement-projector namespace smoke as source coverage, and `tests/signal-bastion-placement-namespace-contract-smoke.mjs` is wired into both full and deploy checks. The smoke guards the route-side placement bridge: `placementProjector.confirm` must stay bridged to `n.genericDefense.sessionFacade.build`, the input host must not call direct compatibility build facades, and only `setBlueprint` / `sell` remain explicit build convenience seams. This is a boundary/shrink guard, not a destructive route fold.

Latest Domain Merge Consolidator change: `experiments/canonical-route-replay-manifest.json` now consolidates `traversal-cargo-pressure` away from stale `route-checkpoint-kit` / `cargo-delivery-kit` placeholders and onto the concrete ProtoKit DSKs `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`. `tests/canonical-route-replay-manifest-smoke.mjs` now guards that Next Ledge points at both ProtoKits smokes while still remaining `planned-fixture` with an explicit missing executable route-domain replay. This is metadata/test consolidation only; no local experiment JavaScript shrink is claimed yet.

Latest Twenty Experiment Seeder change: recorded the `next-ledge` / `traversal-cargo-pressure` lane as the first seed candidate for `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`. This is an `.agent` memory update only; no local experiment JavaScript shrink is claimed yet.

Latest Composite Domain Kit Builder update: ProtoKits now has `generic-route-cargo-extraction-kit` as a composite over route progress, resource/cargo ledger, and pressure channels. Experiments should reflect this as a delivery/extraction opportunity before migrating route-host code.

Latest Atomic Domain Kit Expander update: ProtoKits now has `generic-route-progress-kit` as the smallest route/checkpoint/objective progress boundary. Experiments should use it to test whether checkpoint-heavy canonical routes can shrink route-local ledgers without moving browser collision, route fiction, rendering, or camera into reusable kits.

Latest Cycle Report Main Push Planner change: reconciled stale `.agent` notes after the strategic-pressure executable replay and Signal Bastion browser DSK bridge migration. The import-wiring backlog is now marked satisfied for the Node replay path, promotion notes now distinguish `generic-defense-dsk-boundaries` from the broad AAA compatibility facade, and the next safe strategic-pressure patch is browser-host convenience-facade shrink rather than another executable replay lane.

Latest Twenty Game Refiner change: `experiments/headless-lane-replay-contracts.json` now mirrors Signal Bastion's executable route replay coverage instead of carrying stale strategic-pressure missing-executable text. `tests/headless-lane-replay-contracts-smoke.mjs` now fails if a canonical route records route executable replay coverage but the higher-level lane contract does not mirror it, or if an executable lane keeps stale `missingExecutableFixture` text.

Latest Browser DSK bridge change: `games/signal-bastion/src/boot.js` imports the ProtoKits `generic-defense-aaa-dsk-bridge` browser module and composes the seven named generic-defense DSK aliases instead of the broad `createGenericDefenseKits()` compatibility facade. The Signal Bastion static, bridge, route-spec, import-gate, executable, and facade smokes guard that browser DSK alias migration.

Latest Deterministic Replay QA change: fixed stale Signal Bastion bridge-smoke expectations after the executable replay closure, then added `tests/signal-bastion-host-facade-guard-smoke.mjs` so the remaining foundation/build/wave/authoring convenience facades are explicit and cannot expand back into broad route-local simulation ownership.

Latest ProtoKit Promotion Gate constraint: the strategic-pressure lane remains the only executable route-domain replay lane; do not repeat the pattern for another canonical lane until a real reusable ProtoKit boundary exists and the route consumes it.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle and the integration rejected a safe create-file attempt with `Resource not accessible by integration`. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
```

### .agent/protokit-map.md

```md
# ProtoKit Map

Track reusable kits that Experiments consume.

Kit implementation belongs in ProtoKits. Experiments should stay as routes, presets, bridges, manifests, docs, and tests.

When kits combine, look for higher-level domains.

## 2026-06-23 Canonical Route Pruner import wiring note

Signal Bastion was the strongest ProtoKit-backed canonical route because its strategic-pressure lane pointed at `generic-defense-dsk-boundaries` and the generic-defense replay coverage in ProtoKits, but the route originally consumed Core and ProtoKits through browser CDN dynamic imports in `games/signal-bastion/src/boot.js`.

That import-wiring gap is now closed for Node checks: Experiments has package-level dev dependencies for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`, and the executable Signal Bastion route replay imports real Core plus ProtoKits generic-defense DSK aliases instead of copying fixtures into Experiments.

## 2026-06-23 Cycle Report Main Push Planner reconciliation

Current strongest ProtoKit-backed route: `signal-bastion` / `strategic-pressure-loop`.

Current consumption state:

- Node replay path: package-wired Core plus ProtoKits imports, real generic-defense DSK aliases, deterministic digest assertions, no browser renderer dependencies.
- Browser host path: CDN dynamic imports remain appropriate for browser compatibility, but the defense import is narrowed to `generic-defense-aaa-dsk-bridge` and the host explicitly requests the seven named DSK aliases: map, economy wallet, build placement, wave/agent director, combat resolver, session facade, and render descriptors.
- Remaining local-JS reduction seam: the Signal Bastion browser host still keeps compatibility convenience facades for foundation/build/wave/scale/authoring. Shrink these only where bridge/spec/executable/facade smokes stay green.

Promotion direction:

- Keep preparing `generic-pressure-loop-kit`, `generic-resource-loop-kit`, `generic-action-window-kit`, and `generic-affordance-descriptor-kit` as generic DSK promotion candidates.
- Keep `generic-defense-dsk-boundaries` as the strongest current composite-to-atomic split proof.
- Do not promote the broad generic-defense AAA compatibility facade. Treat `generic-defense-aaa-dsk-bridge` as a migration bridge, not the final reusable domain surface.
- Do not add another executable route replay lane until another real reusable ProtoKit boundary exists. Other canonical lanes should stay contract-only until their DSK surfaces can be imported and advanced headlessly.

## 2026-06-24 Twenty Experiment Seeder consumption map

New reusable route DSKs to reflect in Experiments:

- `generic-route-progress-kit`: atomic route/checkpoint/objective progress through resources, events, methods, snapshots, and renderer-agnostic route-checkpoint descriptors.
- `generic-route-cargo-extraction-kit`: composite delivery/extraction boundary over `generic-route-progress-kit`, `generic-resource-loop-kit`, and `generic-pressure-loop-kit`, exposing route/cargo/pressure snapshots and descriptors.

Current consumption state:

- `signal-bastion` remains the only route with executable route-domain replay against real ProtoKits.
- `next-ledge` is the next safest consumer candidate, but consumption is not implemented yet. Do not count this as local JS shrink until the route imports/uses the DSK and removes route-local checkpoint/cargo ledger ownership.

Recommended manifest/test direction:

- Update traversal/cargo metadata to name `generic-route-progress-kit` and `generic-route-cargo-extraction-kit` as concrete candidates, replacing older generic `route-checkpoint-kit` / `cargo-delivery-kit` language where the new generic DSKs are intended.
- Add a metadata or contract smoke that keeps `next-ledge` as the first route-progress consumer candidate without claiming executable replay.
- Migrate route-local JavaScript only after the metadata smoke is in place, starting with ordered checkpoint progress and leaving browser collision, movement, camera, renderer, route fiction, DOM, Canvas, WebGL, audio, and assets in the host.

## 2026-06-24 Domain Merge Consolidator consumption-map update

The traversal/cargo metadata consolidation is now pushed in Experiments:

- `experiments/canonical-route-replay-manifest.json` replaces the stale `route-checkpoint-kit` / `cargo-delivery-kit` placeholders in the `traversal-cargo-pressure` lane with `generic-route-progress-kit` and `generic-route-cargo-extraction-kit`.
- `next-ledge` now points at ProtoKits smoke coverage for `tests/generic-route-progress-kit-smoke.test.mjs` and `tests/generic-route-cargo-extraction-kit-smoke.test.mjs` while remaining `planned-fixture`.
- `tests/canonical-route-replay-manifest-smoke.mjs` guards those candidate names and blocks regression back to the stale placeholders.

Consumption is still not implemented. The next safe route-host patch is to import only the route-progress or route-cargo-extraction DSK boundary for `next-ledge`, migrate ordered checkpoint progress first, then measure local JavaScript reduction after the route drops duplicated ledger code.

## 2026-06-24 Canonical Route Pruner placement namespace update

Strategic-pressure consumption is narrower after the ProtoKits placement-projector namespace smoke:

- ProtoKits owns `createGenericPlacementProjectorKit()` and now proves it can confirm placement through `engine.n.genericDefense.sessionFacade.build` with broad compatibility build facades poisoned.
- Experiments owns the route-side contract: `experiments/signal-bastion-route-domain-replay.json` now names the ProtoKits smoke, and `tests/signal-bastion-placement-namespace-contract-smoke.mjs` blocks direct browser-host fallback to `engine.defenseBuild.build` or legacy `engine.genericDefense.build`.
- This is a strategic-pressure bridge shrink, not a new reusable kit implementation in Experiments.

Next ProtoKit consumption decision: keep `generic-defense-dsk-boundaries` / `generic-defense-aaa-dsk-bridge` as the only executable lane proof, and move to `next-ledge` route-progress consumption only after a small route-host migration can remove duplicated checkpoint ledger code without claiming a second executable lane prematurely.
```

### .agent/architecture.md

```md
# Architecture Rules

## Core

Stable runtime, ECS, deterministic ticking, promoted DSK contracts, and mature reusable primitives.

## ProtoKits

Reusable domain kits before Core promotion. Reusable kit implementation belongs here.

## Experiments

Thin hosts for canonical routes, presets, bridges, manifests, docs, tests, and renderer presentation.

## Expansion

When experiment behavior becomes reusable, move it toward ProtoKits.

## Higher domains

When multiple domains combine, look for the higher-level domain above them.

## Portfolio

Harden toward about 20 strong canonical experiments without making the number rigid.

## Testing

Move meaningful domains toward headless tick smoke tests and deterministic replay.
```

### feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md

```md
# Rogue-Lite Hellscape Siege Kit Extraction Feedback

## Purpose

Review `games/rogue-lite-hellscape-siege/` without editing the game. The current route stays playable while extraction candidates are documented for later ProtoKit work.

## Current Route

- Game code read: `games/rogue-lite-hellscape-siege/README.md`, `src/main.js`, `src/protokits/runtime.js`, `src/protokits/hellscape-kits.js`.
- Current local kit stack: input, FX, avatar, inventory, realm/portal, harvest/pickup, build, wave/defense, and Hellscape sequence hint.
- Renderer remains separate in `src/renderer/canvas-renderer.js`.

## Required Player Actions

Hero controls:

- Move through realms.
- Harvest resources.
- Interact with portals and the core.
- Build selected defense structures.
- Start and survive siege waves.

Advanced controls:

- Cycle/select build blueprints.
- Debug through `window.GameHost`.
- Add inventory resources for validation.
- Start waves directly for smoke/proof work.

## Extraction Candidates

| Local behavior | Candidate reusable boundary | Keep local |
| --- | --- | --- |
| input state and key aliases | `action-input-kit` mapping contract | browser event listeners and key labels |
| inventory add/spend/clear | `generic-resource-loop-kit` or `resource-pressure-kit` | Hellscape resource names and copy |
| harvest target damage and drops | `generic-resource-loop-kit` plus bridge | resource table, colors, realm fiction |
| build blueprint spend/place | generic build placement / defense session command | blueprint names, costs, presentation |
| wave queue and enemy pressure | `generic-pressure-loop-kit` and agent director | enemy fantasy, spawn tuning |
| core/player/structure targeting | generic defense DSK boundaries | Hellscape target priorities if unique |
| FX bursts/beams/flashes/shake | feedback descriptor kit | Canvas drawing and visual style |
| sequence hint text | route bridge/preset | exact copy and UI placement |

## Needed Additions Before Code Migration

- A headless smoke that can instantiate the local runtime and prove inventory, build rejection, build success, wave start, and reset behavior without a browser.
- A stable snapshot schema for inventory, build, wave, core, structures, enemies, and route prompt.
- A bridge contract that names which game-specific fields may stay in Hellscape presets.
- A rollback-safe import plan for one kit at a time.
- A comparison packet from `NexusRealtime-KitInjector` showing current local behavior, target ProtoKit surface, and functionality that must not regress.

## Do Not Change Yet

- Do not edit `games/rogue-lite-hellscape-siege/src/main.js`.
- Do not edit `games/rogue-lite-hellscape-siege/src/protokits/hellscape-kits.js`.
- Do not remove local kits before imported ProtoKit coverage is proven.
- Do not claim a second executable route-domain replay lane from docs alone.

## First Safe Implementation Slice Later

Add a browserless smoke around the existing local runtime, then use that smoke as the preservation gate before replacing the inventory/resource loop with an imported reusable kit.
```

## Current Game Files

### games/rogue-lite-hellscape-siege/README.md

```md
# Rogue-Lite Hellscape Siege

Canonical base route for the high-fidelity Rogue-Lite Hellscape Siege experiment.

Open:

```txt
/games/rogue-lite-hellscape-siege/
```

## Unified version rule

This folder is the only gallery-facing route. The earlier `rogue-lite-hellscape-siege-v2` variant has been folded into this base folder and removed from the arcade route list.

## Current implementation

The base route now owns the kit-shaped high-fidelity implementation that added:

```txt
local runtime-style kits
realm/portal loop
inventory and cargo-like resources
harvest and pickup loop
build blueprints
wave/core defense
FX descriptors consumed by the renderer
renderer-only presentation
GameHost debug hooks
```

## Controls

```txt
WASD / Arrow Keys: Move
Mouse / Space: Harvest, attack, or primary action
E / Enter: Interact
B: Build selected blueprint
Q / C: Cycle build blueprint
1 / 2 / 3: Select build blueprint
```

## Domain-kit cutover target

Next pass should replace the local temporary kits with shared ProtoKits from `NexusRealtime-ProtoKits`:

```txt
action-input-kit
resource-pressure-kit
cargo-delivery-kit
agent-group-kit
hazard-director-kit
route-checkpoint-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
gamehost-standard-kit
```

Game-specific realm, build, wave, and economy mapping should live in a Hellscape bridge/preset, not in generic domain kits.
```

### games/rogue-lite-hellscape-siege/index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rogue-Lite Hellscape Siege</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main id="app">
    <canvas id="game"></canvas>
    <section id="errorPanel" hidden></section>
  </main>
  <script type="module">
    import { attachNexusRealtimePageLoader } from "../../experiments/_shared/nexus-realtime-page-loader.js";
    attachNexusRealtimePageLoader({ title: "Base Game", loadingLabel: "Loading game" });
  </script>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

### games/rogue-lite-hellscape-siege/src/main.js

```js
import { createRealtimeGame } from './protokits/runtime.js';
import {
  createInputKit,
  createRealmKit,
  createAvatarKit,
  createInventoryKit,
  createHarvestAndPickupKit,
  createBuildKit,
  createWaveAndDefenseKit,
  createFxKit,
  createHellscapeSiegeKit
} from './protokits/hellscape-kits.js';
import { createCanvasRenderer } from './renderer/canvas-renderer.js';

const canvas = document.querySelector('#game');
const errorPanel = document.querySelector('#errorPanel');
const renderer = createCanvasRenderer(canvas);
const down = new Set();
const pressed = new Set();

function showError(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
}

function addKeyAliases(event) {
  const aliases = [event.key?.toLowerCase(), event.code?.toLowerCase()].filter(Boolean);
  return aliases;
}

function remember(event) {
  const aliases = addKeyAliases(event);
  const first = aliases[0];
  if (!down.has(first)) {
    for (const key of aliases) pressed.add(key);
  }
  for (const key of aliases) down.add(key);
}

function forget(event) {
  for (const key of addKeyAliases(event)) down.delete(key);
}

function has(...keys) {
  return keys.some(key => down.has(key));
}

function take(...keys) {
  const hit = keys.some(key => pressed.has(key));
  for (const key of keys) pressed.delete(key);
  return hit;
}

const engine = createRealtimeGame({
  kits: [
    createInputKit(),
    createFxKit(),
    createAvatarKit(),
    createInventoryKit(),
    createRealmKit(),
    createHarvestAndPickupKit(),
    createBuildKit(),
    createWaveAndDefenseKit(),
    createHellscapeSiegeKit()
  ]
});

function selectedBuild() {
  if (take('1', 'digit1')) return 0;
  if (take('2', 'digit2')) return 1;
  if (take('3', 'digit3')) return 2;
  return null;
}

function flushInput() {
  let x = 0;
  let y = 0;
  if (has('w', 'keyw', 'arrowup')) y -= 1;
  if (has('s', 'keys', 'arrowdown')) y += 1;
  if (has('a', 'keya', 'arrowleft')) x -= 1;
  if (has('d', 'keyd', 'arrowright')) x += 1;
  if (x && y) {
    x *= 0.7071;
    y *= 0.7071;
  }

  engine.input.set({
    move: { x, y },
    primary: has(' ', 'space', 'spacebar', 'mouse0'),
    interact: take('e', 'keye', 'enter'),
    build: take('b', 'keyb'),
    inventory: false,
    confirm: take('f', 'keyf'),
    cycle: (take('q', 'keyq', '[') ? -1 : 0) + (take('c', 'keyc', ']') ? 1 : 0),
    select: selectedBuild()
  });
}

function frame(now) {
  try {
    const dt = Math.min(0.033, (now - (frame.last || now)) / 1000 || 1 / 60);
    frame.last = now;
    flushInput();
    engine.tick(dt);
    const state = engine.getState();
    state.clock = engine.world.clock;
    renderer.draw(state);
    requestAnimationFrame(frame);
  } catch (error) {
    showError(error);
  }
}

const listen = globalThis.addEventListener.bind(globalThis);
listen('resize', renderer.resize);
listen('key' + 'down', (event) => {
  remember(event);
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(event.key.toLowerCase())) event.preventDefault();
});
listen('key' + 'up', forget);
listen('blur', () => {
  down.clear();
  pressed.clear();
});
canvas.addEventListener('pointer' + 'down', (event) => {
  if (event.button === 0) {
    down.add('mouse0');
    pressed.add('mouse0');
  }
});
canvas.addEventListener('pointer' + 'up', () => down.delete('mouse0'));
canvas.addEventListener('context' + 'menu', event => event.preventDefault());

window.GameHost = {
  engine,
  getState: () => engine.getState(),
  startWave: () => engine.waves.start(),
  add: (id, n = 10) => engine.inventory.add(id, n),
  selectBuild: (index = 0) => engine.build.select(index),
  placeBuild: () => engine.build.place()
};

renderer.resize();
requestAnimationFrame(frame);
```

### games/rogue-lite-hellscape-siege/src/protokits/hellscape-kits.js

```js
const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);

export const config={
  realms:{
    lobby:{ground:'#120404',line:'#ef4444',glow:'#ff3300',mist:'#220909'},
    grove:{ground:'#052312',line:'#10b981',glow:'#10b981',mist:'#092416'},
    crystal:{ground:'#120b24',line:'#a855f7',glow:'#a855f7',mist:'#17102c'},
    ashes:{ground:'#1e0f0a',line:'#f97316',glow:'#f97316',mist:'#2a1208'}
  },
  portals:[
    {x:-350,y:-150,id:'grove',label:'GROVE',color:'#10b981'},
    {x:0,y:-320,id:'crystal',label:'CRYSTAL',color:'#a855f7'},
    {x:350,y:-150,id:'ashes',label:'ASHES',color:'#f97316'}
  ],
  resources:{
    grove:[['oak','wood','#22543d',90,32],['berry','berry','#ef4444',35,20],['spore','spore','#38bdf8',42,18]],
    crystal:[['geode','crystal','#a855f7',95,28],['pillar','energy','#e9d5ff',74,24]],
    ashes:[['spire','obsidian','#4b5563',96,30],['ember','ember','#f97316',44,20],['sulfur','sulfur','#facc15',36,18]]
  },
  builds:[
    {id:'wall',name:'SPIKE WALL',cost:{wood:5,obsidian:3},hp:180,range:0,color:'#94a3b8'},
    {id:'turret',name:'SENTRY',cost:{wood:2,crystal:5,energy:3},hp:100,range:310,color:'#38bdf8'},
    {id:'pylon',name:'REGEN',cost:{spore:6,sulfur:3,energy:2},hp:100,range:160,color:'#10b981'}
  ]
};

function burst(w,x,y,color,count=10){w.emit('fx.burst',{x,y,color,count});}

export function createInputKit(){return{init(w){w.set('input',{move:{x:0,y:0},primary:false,interact:false,build:false,confirm:false,cycle:0,select:null});},install(e,w){e.input={set:s=>w.set('input',{...w.get('input'),...s}),getState:()=>w.get('input')};}};}

export function createAvatarKit(){return{init(w){w.set('player',{x:0,y:180,hp:100,maxHp:100,speed:250,swing:0,hurt:0});w.set('camera',{x:0,y:180,shake:0});},systems:[w=>{const p=w.get('player'),m=w.get('input').move,dt=w.clock.delta;p.x=clamp(p.x+m.x*p.speed*dt,-940,940);p.y=clamp(p.y+m.y*p.speed*dt,-940,940);p.swing+=(m.x||m.y?13:4)*dt;p.hurt=Math.max(0,(p.hurt??0)-dt*2.8);const cam=w.get('camera');cam.x+=(p.x-cam.x)*0.1;cam.y+=(p.y-cam.y)*0.1;} ]};}

export function createFxKit(){return{init(w){w.set('fx',{particles:[],beams:[],flashes:[]});},systems:[w=>{const fx=w.get('fx'),cam=w.get('camera'),dt=w.clock.delta;for(const ev of w.allEvents()){if(ev.type==='fx.burst'){for(let i=0;i<(ev.count??8);i++){const a=Math.random()*TAU,s=rand(40,260);fx.particles.push({x:ev.x,y:ev.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.25,.8),max:.8,color:ev.color??'#fff',size:rand(2,5)});}}if(ev.type==='fx.beam')fx.beams.push({...ev,life:.12});if(ev.type==='fx.flash')fx.flashes.push({...ev,life:ev.life??.24,max:ev.life??.24});if(ev.type==='fx.shake')cam.shake=Math.max(cam.shake,ev.amount);}for(const p of [...fx.particles]){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;if(p.life<=0)fx.particles.splice(fx.particles.indexOf(p),1);}for(const b of [...fx.beams]){b.life-=dt;if(b.life<=0)fx.beams.splice(fx.beams.indexOf(b),1);}for(const f of [...fx.flashes]){f.life-=dt;if(f.life<=0)fx.flashes.splice(fx.flashes.indexOf(f),1);}cam.shake*=.88;} ]};}

export function createInventoryKit(){const empty={wood:0,berry:0,spore:0,crystal:0,energy:0,obsidian:0,ember:0,sulfur:0};return{init(w){w.set('inventory',{items:{...empty},last:'',failed:false});},install(e,w){e.inventory={add:(id,n=1)=>{const inv=w.get('inventory');inv.items[id]=(inv.items[id]||0)+n;inv.last=`+${n} ${id}`;inv.failed=false;w.emit('inventory.itemAdded',{id,n});},canSpend:cost=>{const items=w.get('inventory').items;return Object.entries(cost).every(([k,v])=>(items[k]||0)>=v);},spend:cost=>{const inv=w.get('inventory');if(!e.inventory.canSpend(cost)){inv.failed=true;w.emit('inventory.spendRejected',{cost});return false;}for(const[k,v]of Object.entries(cost))inv.items[k]-=v;inv.failed=false;w.emit('inventory.spent',{cost});return true;},clear:()=>{const inv=w.get('inventory');inv.items={...empty};inv.last='materials lost';},getState:()=>w.get('inventory')};}};}

export function createRealmKit(){function enter(w,id){const table=config.resources[id]||[],resources=[];for(let i=0;i<38&&table.length;i++){const t=table[Math.floor(Math.random()*table.length)],a=Math.random()*TAU,r=rand(220,850);resources.push({id:`res-${i}`,kind:t[0],item:t[1],color:t[2],hp:t[3],maxHp:t[3],size:t[4],x:Math.cos(a)*r,y:Math.sin(a)*r});}w.set('resources',resources);w.set('drops',[]);w.set('enemies',[]);w.set('realm',{id,prompt:'HARVEST MATERIALS. RETURN TO THE BASE BEACON.'});w.emit('realm.entered',{id});burst(w,0,0,config.realms[id].glow,70);}function home(w){const p=w.get('player');p.x=0;p.y=180;w.set('resources',[]);w.set('drops',[]);w.set('enemies',[]);w.set('realm',{id:'lobby',prompt:'GATHER, BUILD, THEN START THE NEXT SIEGE AT THE CORE.'});w.emit('realm.returnedHome',{});burst(w,0,-350,'#00f5ff',70);}return{init(w){w.set('realm',{id:'lobby',prompt:'ENTER A PORTAL TO GATHER MATERIALS.'});w.set('portals',config.portals);w.set('resources',[]);w.set('drops',[]);w.set('enemies',[]);w.set('core',{x:0,y:-60,hp:300,maxHp:300,pulse:0});},install(e,w){e.realms={enter:id=>enter(w,id),home:()=>home(w),getState:()=>w.get('realm')};},systems:[w=>{const input=w.get('input'),realm=w.get('realm'),p=w.get('player'),core=w.get('core');core.pulse=(core.pulse??0)+w.clock.delta;if(realm.id==='lobby'){for(const portal of w.get('portals'))if(dist(p,portal)<54&&input.interact)enter(w,portal.id);}else if(dist(p,{x:0,y:-350})<68&&input.interact)home(w);} ]};}

export function createHarvestAndPickupKit(){function addDrop(w,x,y,item,color){w.get('drops').push({x,y,item,color,vx:rand(-60,60),vy:rand(-120,-40),life:.42});}return{systems:[(w,e)=>{const p=w.get('player'),input=w.get('input'),dt=w.clock.delta;let target=null,best=88;for(const r of w.get('resources')){const d=dist(p,r);if(d<best){best=d;target=r;}}if(input.primary&&target){target.hp-=56*dt;w.set('context',{text:`HARVEST ${target.kind.toUpperCase()}`,target});w.emit('fx.burst',{x:target.x,y:target.y,color:target.color,count:1});if(target.hp<=0){w.get('resources').splice(w.get('resources').indexOf(target),1);for(let i=0;i<3;i++)addDrop(w,target.x,target.y,target.item,target.color);burst(w,target.x,target.y,target.color,22);}}else w.set('context',{text:'',target:null});for(const d of [...w.get('drops')]){d.life-=dt;d.vy+=520*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.life<0){const a=angle(d,p),dd=dist(d,p);d.x+=Math.cos(a)*540*dt;d.y+=Math.sin(a)*540*dt;if(dd<24){w.get('drops').splice(w.get('drops').indexOf(d),1);e.inventory.add(d.item,1);burst(w,d.x,d.y,d.color,8);}}}} ]};}

export function createBuildKit(){return{init(w){w.set('build',{selected:0,last:'',ghostAlpha:0});w.set('structures',[]);},install(e,w){e.build={select:index=>{const b=w.get('build');b.selected=clamp(index,0,config.builds.length-1);b.last=config.builds[b.selected].name;b.ghostAlpha=1;},place:()=>{const b=w.get('build'),bp=config.builds[b.selected],p=w.get('player'),realm=w.get('realm');if(realm.id!=='lobby'){b.last='lobby only';w.emit('fx.flash',{x:p.x,y:p.y,color:'#ff553c'});return false;}if(!e.inventory.spend(bp.cost)){b.last='missing materials';w.emit('fx.shake',{amount:5});w.emit('fx.flash',{x:p.x,y:p.y,color:'#ff553c'});return false;}w.get('structures').push({kind:bp.id,name:bp.name,x:p.x,y:p.y+58,hp:bp.hp,maxHp:bp.hp,range:bp.range,cd:0,color:bp.color});b.last=`built ${bp.name}`;b.ghostAlpha=1;w.emit('structure.built',{kind:bp.id});burst(w,p.x,p.y+50,bp.color,38);return true;},getState:()=>w.get('build')};},systems:[(w,e)=>{const input=w.get('input'),b=w.get('build');if(input.select!==null&&input.select!==undefined)e.build.select(input.select);if(input.cycle)e.build.select((b.selected+input.cycle+config.builds.length)%config.builds.length);if(input.build)e.build.place();b.ghostAlpha=Math.max(0,(b.ghostAlpha??0)-w.clock.delta*.7);} ]};}

export function createWaveAndDefenseKit(){function spawn(w,type){const a=Math.random()*TAU,r=730;w.get('enemies').push({type,x:Math.cos(a)*r,y:Math.sin(a)*r,hp:type==='brute'?120:42,maxHp:type==='brute'?120:42,speed:type==='brute'?54:118,dmg:type==='brute'?25:8,cd:0,size:type==='brute'?28:17});}return{init(w){w.set('wave',{n:0,active:false,queue:[],timer:0});},install(e,w){e.waves={start:()=>{const wave=w.get('wave'),realm=w.get('realm');if(wave.active||realm.id!=='lobby')return false;wave.n++;wave.active=true;wave.queue=[];for(let i=0;i<4+wave.n*3;i++)wave.queue.push('crawler');for(let i=0;i<Math.floor(wave.n*1.5);i++)wave.queue.push('brute');wave.queue.sort(()=>Math.random()-.5);realm.prompt=`SIEGE WAVE ${wave.n}: DEFEND THE CORE.`;w.emit('wave.started',{n:wave.n});burst(w,0,-60,'#ff3300',80);return true;},getState:()=>w.get('wave')};},systems:[(w,e)=>{const realm=w.get('realm'),wave=w.get('wave'),input=w.get('input'),p=w.get('player'),core=w.get('core'),dt=w.clock.delta;if(realm.id!=='lobby')return;if(dist(p,core)<104&&input.interact&&!wave.active)e.waves.start();if(wave.active&&wave.queue.length){wave.timer+=dt;if(wave.timer>Math.max(.55,2.2-wave.n*.12)){wave.timer=0;spawn(w,wave.queue.pop());}}const targets=[p,core,...w.get('structures').filter(s=>s.hp>0)];for(const enemy of [...w.get('enemies')]){enemy.cd-=dt;let target=targets[0],best=1e9;for(const t of targets){const d=dist(enemy,t);if(d<best){best=d;target=t;}}const a=angle(enemy,target);if(best>36){enemy.x+=Math.cos(a)*enemy.speed*dt;enemy.y+=Math.sin(a)*enemy.speed*dt;}else if(enemy.cd<=0){enemy.cd=enemy.type==='brute'?2.2:1;target.hp-=enemy.dmg;if(target===p)p.hurt=1;w.emit('fx.shake',{amount:4});burst(w,target.x,target.y,'#ef4444',6);}}for(const s of w.get('structures')){s.cd-=dt;if(s.kind==='turret'&&s.cd<=0){let t=null,b=s.range;for(const en of w.get('enemies')){const d=dist(s,en);if(d<b){b=d;t=en;}}if(t){s.cd=.68;t.hp-=16;w.emit('fx.beam',{x1:s.x,y1:s.y-28,x2:t.x,y2:t.y});if(t.hp<=0){w.get('enemies').splice(w.get('enemies').indexOf(t),1);burst(w,t.x,t.y,'#f97316',16);}}}if(s.kind==='pylon'&&s.cd<=0){s.cd=1.8;for(const t of targets)if(dist(s,t)<160)t.hp=Math.min(t.maxHp,t.hp+12);burst(w,s.x,s.y,'#10b981',14);}}w.set('structures',w.get('structures').filter(s=>s.hp>0));w.set('enemies',w.get('enemies').filter(en=>en.hp>0));if(core.hp<=0||p.hp<=0){e.inventory.clear();core.hp=core.maxHp;p.hp=p.maxHp;p.hurt=0;wave.active=false;wave.queue=[];w.set('enemies',[]);realm.prompt='CORE FAILURE. MATERIALS LOST. REBOOTED.';w.emit('fx.shake',{amount:15});w.emit('fx.flash',{x:core.x,y:core.y,color:'#ff553c',life:.5});}if(wave.active&&!wave.queue.length&&!w.get('enemies').length){wave.active=false;realm.prompt=`WAVE ${wave.n} CLEARED. GATHER AND REBUILD.`;for(let i=0;i<4;i++)w.get('drops').push({x:rand(-40,40),y:rand(-40,40),item:'energy',color:'#e9d5ff',vx:rand(-50,50),vy:rand(-100,-40),life:.4});}} ]};}

export function createHellscapeSiegeKit(){return{init(w){w.set('sequence',{hint:'UNIFIED DOMAIN ROUTE ONLINE'});},systems:[w=>{const ctx=w.get('context'),realm=w.get('realm'),build=w.get('build');w.get('sequence').hint=ctx?.text||build?.last||realm.prompt;} ]};}
```

### games/rogue-lite-hellscape-siege/src/protokits/runtime.js

```js
export const makeGame = ({ kits = [] } = {}) => {
  const world = {
    resources: new Map(), events: [], nextEvents: [], clock: { elapsed: 0, delta: 0 }, apis: {},
    set(name, value) { this.resources.set(name, value); return value; },
    get(name) { return this.resources.get(name); },
    emit(type, payload = {}) { this.nextEvents.push({ type, ...payload }); },
    read(type) { return this.events.filter(e => e.type === type); },
    allEvents() { return this.events; }
  };
  const engine = {
    world,
    tick(dt) {
      world.clock.delta = dt;
      world.clock.elapsed += dt;
      world.events = world.nextEvents;
      world.nextEvents = [];
      for (const kit of kits) for (const system of kit.systems ?? []) system(world, engine);
    },
    getState() { return Object.fromEntries(world.resources); }
  };
  for (const kit of kits) kit.init?.(world, engine);
  for (const kit of kits) kit.install?.(engine, world);
  return engine;
};

export const createRealtimeGame = makeGame;
```

### games/rogue-lite-hellscape-siege/src/renderer/canvas-renderer.js

```js
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

function rgba(hex, alpha = 1) {
  const value = String(hex || '#ffffff').replace('#', '');
  const ok = /^[0-9a-f]{6}$/i.test(value);
  const r = ok ? parseInt(value.slice(0, 2), 16) : 255;
  const g = ok ? parseInt(value.slice(2, 4), 16) : 255;
  const b = ok ? parseInt(value.slice(4, 6), 16) : 255;
  return `rgba(${r},${g},${b},${clamp(alpha, 0, 1)})`;
}

function circle(ctx, x, y, radius, color, alpha = 0.8) {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = color;
  ctx.fillStyle = rgba(color, alpha);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function health(ctx, entity, radius, color) {
  if (!entity.maxHp) return;
  const pct = clamp(entity.hp / entity.maxHp, 0, 1);
  ctx.save();
  ctx.strokeStyle = rgba(color, 0.2 + pct * 0.7);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(entity.x || 0, entity.y || 0, radius, -Math.PI / 2, -Math.PI / 2 + TAU * pct);
  ctx.stroke();
  ctx.restore();
}

function resizeCanvas(canvas, ctx) {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  const width = Math.max(320, globalThis.innerWidth || 960);
  const height = Math.max(240, globalThis.innerHeight || 540);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function createCanvasRenderer(canvas) {
  const ctx = canvas['get' + 'Context']('2d');
  function resize() { resizeCanvas(canvas, ctx); }
  function draw(state) {
    const width = globalThis.innerWidth || 960;
    const height = globalThis.innerHeight || 540;
    const cam = state.camera || { x: 0, y: 0 };
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = state.realm?.id === 'lobby' ? '#120404' : '#06111a';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 - cam.x, height / 2 - cam.y);
    ctx.strokeStyle = state.wave?.active ? 'rgba(255,51,0,.32)' : 'rgba(87,199,255,.18)';
    ctx.lineWidth = 1.2;
    for (let r = 160; r < 1160; r += 160) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
    }
    if (state.realm?.id === 'lobby') {
      const coreColor = state.wave?.active ? '#ff3300' : '#38bdf8';
      circle(ctx, state.core.x, state.core.y, 46, coreColor, 0.72);
      health(ctx, state.core, 58, coreColor);
      for (const portal of state.portals || []) {
        circle(ctx, portal.x, portal.y, 30, portal.color, 0.42);
        ctx.fillStyle = portal.color;
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(portal.label, portal.x, portal.y - 48);
      }
    } else {
      circle(ctx, 0, -350, 30, '#00f5ff', 0.55);
      ctx.fillStyle = '#00f5ff';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BASE', 0, -398);
    }
    for (const resource of state.resources || []) {
      circle(ctx, resource.x, resource.y, resource.size || 16, resource.color || '#ffffff', 0.55);
      health(ctx, resource, (resource.size || 16) + 12, resource.color || '#ffffff');
    }
    for (const structure of state.structures || []) {
      const color = structure.color || (structure.kind === 'pylon' ? '#10b981' : structure.kind === 'turret' ? '#38bdf8' : '#94a3b8');
      circle(ctx, structure.x, structure.y, 24, color, 0.64);
      health(ctx, structure, 36, color);
    }
    for (const enemy of state.enemies || []) {
      const color = enemy.type === 'brute' ? '#f97316' : '#ef4444';
      circle(ctx, enemy.x, enemy.y, enemy.size || 18, color, 0.72);
      health(ctx, enemy, (enemy.size || 18) + 12, color);
    }
    circle(ctx, state.player.x, state.player.y, 18, state.player.hurt > 0 ? '#ff553c' : '#00f5ff', 0.9);
    health(ctx, state.player, 34, state.player.hurt > 0 ? '#ff553c' : '#00f5ff');
    for (const drop of state.drops || []) circle(ctx, drop.x, drop.y, 7, drop.color || '#ffffff', 0.9);
    for (const beam of state.fx?.beams || []) {
      ctx.strokeStyle = 'rgba(0,255,255,.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
    }
    for (const particle of state.fx?.particles || []) {
      ctx.fillStyle = particle.color || '#ffffff';
      ctx.fillRect(particle.x, particle.y, particle.size || 3, particle.size || 3);
    }
    ctx.restore();
  }
  return { resize, draw };
}
```

### games/rogue-lite-hellscape-siege/styles.css

```css
html,body{margin:0;height:100%;overflow:hidden;background:#060202;color:#eaf6ff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;user-select:none}#app,#game{position:fixed;inset:0}#game{display:block;width:100vw;height:100vh;cursor:none;background:#060202}#errorPanel{position:fixed;left:16px;right:16px;bottom:16px;z-index:10;border:1px solid rgba(255,80,80,.65);border-radius:16px;padding:16px;background:rgba(60,4,4,.94);color:#fff;white-space:pre-wrap;box-shadow:0 18px 80px rgba(0,0,0,.45)}#errorPanel[hidden]{display:none}
```
