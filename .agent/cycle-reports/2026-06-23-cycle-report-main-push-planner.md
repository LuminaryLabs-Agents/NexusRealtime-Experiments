# 2026-06-23 Cycle Report Main Push Planner

## What changed

- Added `tests/domain-cutover-manifest-smoke.mjs` to make the canonical cutover manifest test-visible against generated gallery routes and real route folders.
- Added `scripts/run-checks.mjs` and rewired `package.json` so the full and deploy checks run through one maintained test list.
- Updated `.agent/cycle-state.md` and `.agent/smoke-tests.md` with the durable cycle finding.

## Long-form intent from `.agent/`

Grow reusable DSK-based ProtoKits while keeping Experiments thin. Reusable implementation belongs in ProtoKits; Experiments should validate through canonical routes, presets, bridges, manifests, docs, tests, and renderer-only presentation. DSKs should be layered communication boundaries through resources, events, methods, snapshots, and descriptors.

## Repo state versus `.agent/`

- ProtoKits currently has generic promotion and replay coverage for pressure, resource, action-window, affordance, and generic defense compatibility surfaces.
- Experiments had the canonical cutover manifest and a large generated gallery, but the manifest-vs-gallery drift guard was still under-specified.
- This patch improves alignment by checking that manifest-owned canonical routes are real, bridge/preset-owned, and discoverable through the generated gallery while seed/backlog routes remain non-canonical.

## DSK boundary clarity

Clearer. The patch does not create reusable kit code in Experiments. It makes route canonicalization depend on explicit `domainCutover` and bridge/preset ownership, which keeps DSK boundary pressure visible before route promotion or pruning.

## Local experiment JavaScript trend

No playable route JavaScript was added and no route host grew. A small test runner was added to replace the overlong inline package command. Local experiment runtime JavaScript did not shrink this cycle; test/maintenance JavaScript increased slightly to make future pruning safer.

## Build next

- Add per-canonical-route replay manifest metadata that maps each canonical route to the ProtoKit/domain replay scenario it validates.
- Add fixed-tick route smoke lanes for survey-pressure, defense/survival, traversal/cargo, and aerial traversal.
- In ProtoKits, split or alias `generic-defense-kits` into atomic DSK surfaces after the existing compatibility replay remains green.

## Prune next

- Do not delete route folders yet.
- Keep seed/backlog gallery routes out of `canonicalRoutes[]` until they prove reusable domain pressure and replay coverage.
- Fold route variants only after the unified canonical route and tests already exist.

## ProtoKits to promote

- Already-incubating: `generic-pressure-loop-kit`, `generic-resource-loop-kit`, `generic-action-window-kit`, `generic-affordance-descriptor-kit`.
- Next promotion/split candidate: `generic-defense-kits`, but only as named atomic DSK wrappers or aliases for path/slot/vital-target, economy wallet, build-placement, structure runtime, wave/agent director, projectile/combat resolver, and render-descriptor output.

## Experiments to keep canonical

The current manifest-owned canonical set remains the safest canonical set: `next-ledge`, `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, `signal-bastion`, and `rogue-lite-hellscape-siege`.

## Smoke/replay gaps that matter

- Route-level replay manifests are still missing.
- Survey-pressure, defense/survival, traversal/cargo, and aerial traversal need compact fixed-tick route/domain scenarios.
- Economy/social routes should stay seed/backlog until a decision/economy/social DSK exposes headless resources, events, methods, snapshots, and descriptors.

## Direct main push

Target repo: `LuminaryLabs-Agents/NexusRealtime-Experiments`

Target branch: `main`

Commit groups pushed:

1. `test: add domain cutover manifest smoke`
   - `tests/domain-cutover-manifest-smoke.mjs`
2. `test: add shared check runner`
   - `scripts/run-checks.mjs`
3. `test: wire checks through shared runner`
   - `package.json`
4. `agent: update cycle state after manifest smoke push`
   - `.agent/cycle-state.md`
5. `agent: record manifest smoke closure`
   - `.agent/smoke-tests.md`
6. `agent: add cycle report main push planner`
   - `.agent/cycle-reports/2026-06-23-cycle-report-main-push-planner.md`

## Files affected

`.agent/` files updated:

- `.agent/cycle-state.md`
- `.agent/smoke-tests.md`
- `.agent/cycle-reports/2026-06-23-cycle-report-main-push-planner.md`

Code/test files updated:

- `package.json`
- `scripts/run-checks.mjs`
- `tests/domain-cutover-manifest-smoke.mjs`

## Test plan

Run:

```bash
npm run check
npm run check:deploy
```

The new smoke should pass after `npm run generate` because it imports generated `apps` from `experiments/_shared/nexus-gallery-data.js`.

## Rollback notes

If the new smoke reveals existing manifest/gallery drift, either fix the manifest route ownership or temporarily revert these files together:

- `tests/domain-cutover-manifest-smoke.mjs`
- `scripts/run-checks.mjs`
- `package.json`
- `.agent/cycle-state.md`
- `.agent/smoke-tests.md`
- this cycle report

## Remaining for next cycle

- Add route-level replay manifest metadata.
- Add one compact fixed-tick route smoke for the highest-value domain cluster.
- Keep ProtoKits focused on renderer-agnostic DSK splits rather than moving route implementation into Experiments.
