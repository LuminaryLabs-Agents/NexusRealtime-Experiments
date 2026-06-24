# Pruning Log

Track duplicate APIs, routes, kit concepts, and experiment features that should be folded into stronger reusable domains.

## Standing rules

- Prune to clarify domain communication boundaries.
- Do not preserve versioned route sprawl.
- Merge overlapping features into cumulative higher-level domains.
- Preserve thin hosts, presets, bridges, manifests, docs, and tests.
- Keep reusable kit implementation in ProtoKits.

## 2026-06-24 — Domain Merge Consolidator traversal/cargo placeholder prune

Experiments previously had no local pruning log, while the shared scheduled cycle asks the Domain Merge Consolidator to re-check one. This file now records the durable pruning decision for Experiments.

`experiments/canonical-route-replay-manifest.json` should not use stale `route-checkpoint-kit` or `cargo-delivery-kit` placeholders for the `traversal-cargo-pressure` lane now that ProtoKits has concrete reusable DSKs:

- `generic-route-progress-kit` for atomic route/checkpoint/objective progress.
- `generic-route-cargo-extraction-kit` for the composite delivery/extraction loop over route progress, cargo/resource ledger, and pressure channels.

Keep `next-ledge` as the first consumer candidate, but do not claim executable replay or local JavaScript shrink until the route imports and consumes one of these ProtoKit boundaries and removes duplicated route-local checkpoint/cargo ledger state.
