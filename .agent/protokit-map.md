# ProtoKit Map

Track reusable kits that Experiments consume.

Kit implementation belongs in ProtoKits. Experiments should stay as routes, presets, bridges, manifests, docs, and tests.

When kits combine, look for higher-level domains.

## 2026-06-23 Canonical Route Pruner import wiring note

Signal Bastion is the strongest current ProtoKit-backed canonical route because its strategic-pressure lane points at `generic-defense-dsk-boundaries` and the generic-defense replay coverage in ProtoKits. The route still consumes Core and ProtoKits through browser CDN dynamic imports in `games/signal-bastion/src/boot.js`, not through local package/workspace/path imports.

Before adding an executable browserless route replay in Experiments, add stable local import wiring for Core `nexusrealtime` and ProtoKits `@luminarylabs/nexusrealtime-protokits`, then import the real generic-defense DSK aliases. Do not copy ProtoKit fixtures or reimplement generic-defense simulation inside Experiments.
