# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: convert checked route/lane replay contracts into executable route-domain replays only when they can import real Core and ProtoKit DSK boundaries without copying reusable simulation into Experiments.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep destructive route folds blocked until the canonical route has real replay coverage plus browser-host migration evidence.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, `experiments/headless-lane-replay-contracts.json`, `experiments/signal-bastion-route-domain-replay.json`, `experiments/executable-route-replay-import-gates.json`, and the Signal Bastion strategic-pressure bridge/spec/import-gate/executable smokes against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, local JavaScript reduction opportunities, package-wiring gaps, and accidental route-local simulation ownership.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-23-canonical-route-pruner-1500.md`.

Latest Headless Tick Smoke Builder change: `games/signal-bastion/src/boot.js` now imports the ProtoKits `generic-defense-aaa-dsk-bridge` browser module and composes the seven named generic-defense DSK aliases instead of the broad `createGenericDefenseKits()` compatibility facade. The Signal Bastion static, bridge, route-spec, and import-gate smokes now guard that browser DSK alias migration.

Latest Deterministic Replay QA change: `experiments/signal-bastion-route-domain-replay.json` now records that the executable replay is closed and the browser route has migrated to the DSK bridge, but still has a smaller local-JS reduction gap around foundation/build/wave/scale host convenience facades.

Latest Canonical Route Pruner change: `experiments/executable-route-replay-import-gates.json` now records browser import mode as `browser-cdn-dynamic-import-dsk-bridge` and preserves the pruning rule that fake route-local replay, copied ProtoKit fixtures, DOM/Canvas-owned simulation shims, and route forks remain blocked.

Latest ProtoKit Promotion Gate change: the strategic-pressure lane remains the only executable route-domain replay lane; do not repeat the pattern for another canonical lane until a real reusable ProtoKit boundary exists.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
