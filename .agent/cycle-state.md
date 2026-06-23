# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: make canonical-route cutover and replay-lane decisions test-visible before adding, deleting, or folding playable routes.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep each manifest canonical route paired with an explicit pruning issue and replay-lane contract before any destructive route fold/delete.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json`, `experiments/canonical-route-pruning-map.json`, `experiments/canonical-route-replay-manifest.json`, `experiments/headless-lane-replay-contracts.json`, `experiments/signal-bastion-route-domain-replay.json`, `experiments/executable-route-replay-import-gates.json`, and the Signal Bastion strategic-pressure bridge/spec/import-gate smokes against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, renderer-free DSK surfaces, fixed-tick replay contracts, local JavaScript reduction opportunities, package-wiring gaps, and accidental route-local simulation ownership.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-23-canonical-route-pruner-1500.md`.

Latest Headless Tick Smoke Builder change: `experiments/headless-lane-replay-contracts.json` plus `tests/headless-lane-replay-contracts-smoke.mjs` now make every higher-level route lane carry a checked fixed-tick replay contract. The strategic-pressure lane is ProtoKit-backed; other lanes remain contract-only until executable Core/ProtoKit route-domain replays are added.

Latest Deterministic Replay QA change: `experiments/signal-bastion-route-domain-replay.json` plus `tests/signal-bastion-route-domain-replay-spec-smoke.mjs` now pin the strategic-pressure / Signal Bastion replay spec to the manifest, lane contract, generic-defense DSK surfaces, semantic route inputs, descriptor digest fields, and renderer-free host boundary. This is still not the final browserless executable route replay.

Latest Canonical Route Pruner change: `experiments/executable-route-replay-import-gates.json` plus `tests/executable-route-replay-import-gates-smoke.mjs` now make the remaining Signal Bastion executable replay gate explicit and checked. The gate blocks fake route-local replay implementation until Experiments has stable local package/workspace/path imports for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`; it also records the current browser CDN import mode and forbids route forks, copied ProtoKit fixtures, and DOM/Canvas-owned simulation as workarounds.

Latest Core memory check: `LuminaryLabs-Dev/NexusRealtime` is accessible, but `.agent/intent.md` was not present during this cycle. Do not treat Core `.agent` memory as reviewed until the folder exists or a later run can fetch it.
