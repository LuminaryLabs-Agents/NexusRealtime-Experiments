# Visual Experiment Loop

Use this file when an agent needs to upgrade a playable NexusRealtime experiment by comparing a target image against the live browser result.

## Goal

Use visual targets to discover reusable ProtoKit gaps, then prove those ProtoKits through a playable experiment.

## Boundary

```txt
NexusRealtime = read-only runtime context
NexusRealtime-ProtoKits = reusable behavior and renderer-agnostic domain services
NexusRealtime-Experiments = playable routes, target composition, browser input, rendering, UI, and proof
```

Do not edit NexusRealtime core for this loop. Build reusable behavior in ProtoKits and compose it here.

## Required Reads

```txt
memory.md
README.md
docs/experiment-domain-cutover.md
/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/docs/PROTOKIT-EXPANSION-LOOP.md
/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/memory.md
```

When useful, read NexusRealtime docs as read-only context only.

## Loop

```txt
1. Pick one existing experiment or one new bounded experiment route.
2. Generate a target image for what the scene should communicate.
3. Run or inspect the live experiment.
4. Compare target vs live result.
5. Split differences into ProtoKit gaps and Experiment gaps.
6. Build reusable behavior in NexusRealtime-ProtoKits.
7. Wire and present the proof in this repo.
8. Validate changed repos.
9. Stop when the live experiment is visibly and semantically closer to the target.
```

## Difference Classes

Classify every gap before editing:

```txt
ProtoKit gap = reusable state, service, descriptor, simulation, rule, event, or reset/snapshot behavior
Experiment gap = route, renderer, camera, controls, art direction, layout, authored content, UI, or import map
Runtime gap = NexusRealtime limitation; document it, but do not edit core in this loop
```

## Target Image Review

Compare these surfaces:

```txt
composition and camera
scale and navigation readability
lighting and atmosphere
terrain/world structure
actor/object readability
interaction affordances
semantic gameplay proof
debug or UI clutter
performance and loading state
```

## Implementation Rules

```txt
Reusable descriptors belong in ProtoKits.
Browser rendering belongs in Experiments.
Game-specific content belongs in Experiments.
Import maps and route pages belong in Experiments.
ProtoKits must remain app-neutral and renderer-agnostic.
Experiments may adapt multiple generic kits into one specific scene.
```

## Validation

Run checks only for repos changed:

```sh
cd /Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits && npm run check
cd /Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments && npm run check
```

Use Playwright or another browser smoke when the change affects a visible route.

## Stop Conditions

Stop when:

```txt
NexusRealtime core is untouched
reusable behavior lives in ProtoKits
playable proof lives in Experiments
the live route is closer to the target image
validation passes or the remaining blocker is documented
```
