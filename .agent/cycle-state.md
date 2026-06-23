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

Current pruning focus: keep generated gallery seed/backlog routes distinct from manifest-owned canonical routes until a route proves reusable DSK pressure, smoke coverage, and replay direction.

Current validation focus: guard `experiments/domain-kit-cutover-manifest.json` against drift from generated gallery routes, route folders, non-empty `domainCutover`, and bridge/preset ownership notes.

Last meaningful cycle report: `cycle-reports/2026-06-23-cycle-report-main-push-planner.md`.
