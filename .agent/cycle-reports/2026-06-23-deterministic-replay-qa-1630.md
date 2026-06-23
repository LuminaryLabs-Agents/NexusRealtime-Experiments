# Deterministic Replay QA — Signal Bastion Host Facade Guard

## Decision memory reviewed

- `.agent/intent.md`
- `.agent/architecture.md`
- `.agent/dsk-boundaries.md`
- `.agent/domain-backlog.md`
- `.agent/smoke-tests.md`
- `.agent/replay-qa.md`
- `.agent/cycle-state.md`
- `experiments/canonical-route-replay-manifest.json`
- `experiments/signal-bastion-route-domain-replay.json`

Core `.agent/intent.md` was still not available through the connector path during this cycle, so Core `.agent` memory should not be treated as reviewed.

## Finding

The Signal Bastion bridge smoke had drifted behind the replay manifest. It still expected a missing route-level executable fixture even though the manifest now records `routeExecutableReplayCoverage` and keeps `missingExecutableFixtures` empty for `signal-bastion`.

## Direct main changes

- Fixed `tests/signal-bastion-replay-bridge-smoke.mjs` so it asserts the executable replay gap is closed and points at `tests/signal-bastion-executable-route-replay-smoke.mjs`.
- Added `tests/signal-bastion-host-facade-guard-smoke.mjs` to guard the remaining browser host convenience-facade seam.
- Wired the facade guard into full and deploy checks in `scripts/run-checks.mjs`.
- Updated `.agent/replay-qa.md`, `.agent/smoke-tests.md`, and `.agent/cycle-state.md`.

## Boundary result

The browser host may still keep the explicitly named foundation/build/wave/scale/authoring convenience exports while the DSK migration settles, but the guard blocks expansion back into the broad `createGenericDefenseKits()` compatibility facade or lower-level route-host access to defense map/economy/structures/agents/combat/render internals.

## Local JavaScript result

No JavaScript was removed in this pass. The guard narrows the safe next shrink by making facade growth test-visible before direct DSK semantic-method replacement begins.

## Next safe patch

Reduce Signal Bastion browser host convenience calls only where the bridge/spec/import-gate/executable/facade smokes stay green. Do not add another executable route replay lane until a real reusable ProtoKit boundary exists for that lane.
