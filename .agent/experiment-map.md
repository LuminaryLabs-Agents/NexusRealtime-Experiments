# Experiment Map

Track canonical experiments and the domains each route validates.

Constraints:

- Harden toward about 20 strong canonical experiments.
- Treat 20 as guidance, not a rigid quota.
- Merge overlapping routes and features when higher-level domains emerge.
- Keep routes thin and renderer-presentational.
- Kit implementation belongs in ProtoKits.

Canonical target list:

1. Fogline Relay
2. Signal Bastion
3. Zombie Orchard
4. Next Ledge
5. The Open Above
6. Downhill Prix
7. Harbor Salvage
8. Cargo Chain
9. Sky Courier
10. Orbital Dockyard
11. Shadow Museum
12. Factory Pulse
13. Floodplain Rescue
14. Drone Swarm Survey
15. Trainyard Switcher
16. Crystal Cavern Rally
17. Biodome Wrangler
18. Dungeon Relay
19. Mech Bastion
20. Market Mayhem

## 2026-06-23 Twenty Game Refiner finding

Observed portfolio state:

- The durable target above still names 20 intended canonical pressure routes, but `experiments/domain-kit-cutover-manifest.json` currently records a smaller canonical cutover set: `next-ledge`, `fogline-relay`, `nexus-frontier-signal-isles`, `sora-the-infinite`, `zombie-orchard`, `signal-bastion`, and `rogue-lite-hellscape-siege`.
- The root arcade still contains a very large `aaa-seed` list, while the generated gallery pipeline discovers real `experiments/`, generated `apps/`, and `games/` routes instead of preserving every seed as a canonical route.
- Treat the 20-name list as an evaluation lens, not as a committed manifest. A seed should only become canonical when it creates reusable ProtoKit pressure through DSK resources, events, methods, snapshots, descriptors, smoke tests, or replay scenarios.
- The strongest near-term refiner work is to reconcile the 20-target memory with the canonical cutover manifest by either mapping target names onto existing strong routes or explicitly marking them as seed/backlog rather than playable-canonical commitments.

Route pressure clusters:

- Survey-pressure: `fogline-relay`, `starwell-cartographer`, `lumen-reef-cartographer`, `gravemark-cartographer`, and `drone/swarm/survey` candidates should pressure `scan-survey-kit`, `zone-field-kit`, `timed-pressure-director-kit`, `hazard-director-kit`, and replayable scan traces.
- Defense-pressure: `signal-bastion`, `rogue-lite-hellscape-siege`, `zombie-orchard`, `hollow-warden`, `beetle-siege`, and `prism-bastion-sealer` should collapse into clearer defense/survival/horde DSK boundaries instead of route-specific wave code.
- Traversal-cargo-pressure: `next-ledge`, `tideglass-salvage`, `skyrig-suture`, `ember-rail`, `catacomb-postmaster`, `neon-courier-reef`, and harbor/cargo/chain targets should validate route checkpoint, cargo delivery, tether, vehicle/contact, and resource pressure layers.
- Aerial/open-world pressure: `sora-the-infinite`, `the-open-above-harness`, and `the-open-above` should converge on a higher-level aerial traversal domain above flight feel, terrain windows, camera rigs, route checkpoints, and visual descriptors.
- Social/market/workshop pressure: `clockwork-verdict`, `rift-bazaar`, `saffron-skull-market`, `tarot-engine-broker`, and `market-mayhem` should stay seed/backlog until a reusable decision/economy/social DSK boundary exists.

Refiner decision rule:

Promote or preserve a route only if it validates at least one reusable domain boundary and has a path to headless fixed-tick smoke plus deterministic replay. Fold or demote routes that only add fantasy/renderer variance without new DSK pressure.
