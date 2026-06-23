# Signal Bastion Route Replay Spec

## What changed

- Added `experiments/signal-bastion-route-domain-replay.json` as a checked route-domain replay spec for the `strategic-pressure-loop` lane.
- Added `tests/signal-bastion-route-domain-replay-spec-smoke.mjs` and wired it into both full and deploy check suites via `scripts/run-checks.mjs`.
- Updated `.agent/smoke-tests.md`, `.agent/replay-qa.md`, and `.agent/cycle-state.md` so the durable memory records the new spec-smoked state and the remaining executable replay gap.

## Intent alignment

The `.agent/` long-form intent remains: use Experiments as thin validation hosts for reusable ProtoKit domains, keep reusable kit implementation in ProtoKits, and harden toward about 20 strong canonical experiments without treating that count as brittle.

## Repo state versus memory

The repo state now better matches `.agent/` for the strongest current canonical replay lane. Signal Bastion already had ProtoKit-backed generic-defense replay coverage and a static bridge smoke; it now also has a route-domain replay spec that names the fixed tick plan, semantic methods, expected DSK surfaces, descriptor digest fields, and renderer ownership exclusions.

The state still does not fully match the desired end state because the new Signal Bastion replay artifact is a checked spec, not a browserless executable replay harness that imports Core plus ProtoKits and advances real ticks.

## DSK boundary clarity

The strategic-pressure lane is clearer. The spec keeps the seven generic-defense DSK boundaries explicit:

- map;
- economy wallet;
- build placement;
- wave/agent director;
- combat resolver;
- session facade;
- render descriptors.

The route host is constrained to browser input bridging, canvas/HUD projection, assets/audio presentation hooks, and descriptor consumption.

## Local JavaScript reduction

No local JavaScript was reduced in this patch. The spec records the next reduction pressure: replace broad Signal Bastion host imports of the generic-defense compatibility bundle with the smallest DSK boundary aliases when the browser path can stay compatible.

## Higher-level domains emerging

- Strategic pressure loop remains the most mature higher-level lane because it is ProtoKit-backed by generic-defense DSK boundaries and replay coverage.
- Defense/survival, action-defense-extraction, survey-pressure, traversal/cargo, aerial traversal, and field-engineer composition remain route-lane contracts or planned fixtures.

## ProtoKit direction

Build or promote next:

- Keep generic-defense DSK aliases stable and make them easier for Experiments to consume directly.
- Add executable Core-backed import coverage once the package wiring has a stable local Core import path.

Do not build in Experiments:

- Do not move generic-defense simulation, economy ledger, wave cadence, combat resolution, or descriptor generation into Signal Bastion route-local JavaScript.

## Experiment direction

Canonical/harden now:

- `signal-bastion` as the strongest strategic-pressure route.

Fold or hold:

- Weak defense variants should stay seed/backlog unless they add reusable pressure beyond the strategic-pressure lane or help split/validate higher-level defense/survival domains.

## Missing smoke/replay

Remaining gap:

- Browserless executable Signal Bastion route replay that imports Core plus ProtoKits, advances the fixed tick sequence, and asserts descriptor digests without DOM, Canvas, animation frames, pointer timing, audio, or asset loading.

Next patch:

1. Add a test-only import harness or fixture path that can load Core plus ProtoKits locally.
2. Instantiate the smallest generic-defense DSK bundle for the Signal Bastion strategic-pressure preset.
3. Apply semantic build, upgrade, wave, and snapshot commands over fixed ticks.
4. Assert resource/event/method/snapshot/descriptor digest fields.
5. Keep route host JavaScript limited to browser input and renderer presentation.
