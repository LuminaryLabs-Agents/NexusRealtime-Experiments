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

Latest Headless Tick Smoke Builder change: `experiments/headless-lane-replay-contracts.json` plus `tests/headless-lane-replay-contracts-smoke.mjs` now make every higher-level route lane carry a checked fixed-tick replay contract. The strategic-pressure lane is ProtoKit-backed; other lanes remain contract-only until executable Core/ProtoKit route-domain replays are added.

Latest Deterministic Replay QA change: `experiments/signal-bastion-route-domain-replay.json` plus `tests/signal-bastion-route-domain-replay-spec-smoke.mjs` now pin the strategic-pressure / Signal Bastion replay spec to the manifest, lane contract, generic-defense DSK surfaces, semantic route inputs, descriptor digest fields, and renderer-free host boundary.

Latest Canonical Route Pruner change: `experiments/executable-route-replay-import-gates.json` plus `tests/executable-route-replay-import-gates-smoke.mjs` now records the Signal Bastion executable replay gate as `satisfied-by-package-wiring`: Experiments package metadata has Core and ProtoKits GitHub dev dependencies, and the gate still forbids fake route-local replay, copied ProtoKit fixtures, browser-CDN Node imports, DOM/Canvas-owned simulation, and route forks.

Latest ProtoKit Promotion Gate change: `tests/signal-bastion-executable-route-replay-smoke.mjs` now imports real Core plus ProtoKits `generic-defense-dsk-boundaries`, composes the Signal Bastion debug preset through the seven named DSK aliases, advances the checked fixed-tick plan, compares deterministic resource/snapshot/descriptor digests across fresh runs, and keeps browser ownership outside the replay. It is wired into the full check suite, not deploy checks yet.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
