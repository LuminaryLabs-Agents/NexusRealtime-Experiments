# Experiment Domain-Kit Cutover

Every playable game should have one canonical base-name route. Versioned routes such as `-v1` or `-v2` should be folded back into the base route and removed from the arcade once the winning behavior is adopted.

## Canonical examples

```txt
/experiments/fogline-relay/
/games/rogue-lite-hellscape-siege/
```

## Responsibility split

Experiment hosts own shell markup, renderer setup, asset loading, frame loop, HUD drawing, error panel, and `window.GameHost` attachment.

Reusable gameplay moves into NexusRealtime runtime kits and ProtoKits:

```txt
action-input-kit
timed-pressure-director-kit
zone-field-kit
scan-survey-kit
route-checkpoint-kit
cargo-delivery-kit
agent-group-kit
resource-pressure-kit
hazard-director-kit
content-preset-kit
visual-fidelity-maker-kit
audio-event-feedback-maker-kit
camera-cinematic-maker-kit
scenario-qa-harness
deterministic-replay-harness
gamehost-standard-kit
```

Game-specific mapping belongs in bridge or preset code.

## Per-game target

- **Next Ledge:** preserve grapple and swing feel while moving input, route, risk, camera, and feedback into kit-owned state.
- **Fogline Relay:** validate scan, zone, pressure, hazard, and the `fogline-survey-pressure-bridge-kit`.
- **Sora The Infinite:** preserve flight feel while normalizing route, zone, visual, camera, and QA state.
- **Zombie Orchard:** preserve survival controls and round pacing while aligning waves, horde pressure, resources, and content with domain kits.
- **Rogue-Lite Hellscape Siege:** base route owns the high-fidelity kit-shaped version; local temporary kits should be replaced with shared domain ProtoKits over time.
