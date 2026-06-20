# Subdomain Scope

This file lists possible subdomains touched by the idea.

A subdomain is a smaller focused scope inside a broader domain.

Each meaningful subdomain may eventually become its own DSK if it owns reusable service rules.

## Example relationship

```txt
Domain: movement
Subdomains:
  - grounded locomotion
  - slope traversal
  - air control
  - vehicle steering
  - swim movement

Domain: audio
Subdomains:
  - ambient audio
  - event feedback audio
  - music state
  - positional audio
```

## Subdomain list

For each possible subdomain, fill out this block.

```txt
subdomain name:
parent domain:
why this idea touches it:
existing kit that may own it:
possible new kit if needed:
what the subdomain owns:
what the subdomain does not own:
state:
actions:
events:
descriptors:
validation rules:
```

## Subdomain boundary rules

A subdomain should be narrow enough to own one focused service responsibility.

Good:

```txt
wave-spawn-pressure
score-combo-window
camera-follow-framing
ambient-loop-layering
route-checkpoint-validation
```

Bad:

```txt
cool-game-feel
all-player-stuff
everything-audio
level-one-rules
```

## Required subdomains

Subdomains required for the smallest prototype:

```txt
-
-
-
```

## Optional subdomains

Subdomains useful for later production:

```txt
-
-
-
```

## Rejected subdomains

Subdomains considered but rejected:

```txt
-
-
-
```
