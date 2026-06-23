# Cycle State

Goal: grow reusable ProtoKit domain layers while shrinking local experiment JavaScript.

Constraints:

- Review `.agent/` before decisions.
- Kit implementation belongs in ProtoKits.
- Experiments should harden toward about 20 canonical routes.
- Treat 20 as guidance, not a rigid quota.
- Merge features and kits into cumulative higher-level domains.
- Keep DSKs as domain communication layers.

Current expansion focus: make canonical-route cutover decisions test-visible before adding or deleting playable routes.

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes, and keep each manifest canonical route paired with an explicit pruning issue before any destructive route fold/delete.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json` and `experiments/canonical-route-pruning-map.json` against drift from generated gallery routes, route folders, non-empty `domainCutover`, bridge/preset ownership notes, variant/backlog pressure, and route-level smoke/replay direction.

Last meaningful cycle report: `.agent/cycle-reports/2026-06-23-canonical-route-pruner.md`.
