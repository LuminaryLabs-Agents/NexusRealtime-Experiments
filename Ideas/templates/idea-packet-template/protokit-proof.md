# ProtoKit Proof

This file explains how the idea could be proven with NexusRealtime ProtoKits.

The goal is not to overbuild.

The goal is to prove which domains, subdomains, services, and kits are actually needed.

## Core ProtoKit question

What does this idea prove about the kit architecture?

Examples:

- Can this game be built from existing kits?
- Does this idea require a new domain kit?
- Does this idea expose a missing subdomain?
- Can the renderer stay presentation-only?
- Can gameplay state live inside reusable kit services?

## Existing ProtoKits that may apply

```txt
kit:
domain:
why it applies:
what it owns:
what it should not own:
```

## Possible new ProtoKits

Only list new kits if the behavior does not fit an existing domain.

```txt
proposed kit:
domain:
subdomain:
service responsibility:
inputs:
outputs:
events:
state:
validation rules:
```

## Domain update first audit

Before proposing a new kit, answer:

```txt
Can an existing DSK own this behavior?
Could this be a config/preset instead of a new kit?
Could this be a bridge inside the experiment instead of a new domain?
Does the behavior belong to a broad reusable domain?
Does the behavior only exist for this one game?
```

## Renderer boundary

The renderer should stay presentation-only.

Describe what the renderer reads:

```txt
descriptors:
snapshots:
events:
visual state:
```

Describe what the renderer must not own:

```txt
game rules:
scoring truth:
collision truth:
resource truth:
AI truth:
win / fail truth:
```

## Runtime proof

What would prove the idea is working inside NexusRealtime?

```txt
smoke test:
deterministic replay:
state snapshot:
action validation:
failure condition:
restart behavior:
```

## Prototype proof checklist

- The idea can run as a small playable slice.
- The core state is owned by kits or clearly isolated bridge code.
- The renderer consumes descriptors only.
- Actions are validated.
- The run can restart.
- The concept can be tested in under one minute.

## Notes

Add ProtoKit architecture notes here.
