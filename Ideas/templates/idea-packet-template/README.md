# Idea Packet Template

Copy this folder when creating a new game idea packet.

Rename the copied folder using lowercase hyphenated words.

Example:

```txt
Ideas/packets/neon-orbit-racer/
```

## Packet purpose

An idea packet is a complete mini-design folder.

It should explain:

- what the idea is
- how the player experiences it
- what the prototype proves
- what ProtoKits may be required
- which domains are touched
- which subdomains are touched
- how the idea should be scored
- what playtests reveal over time

## Required packet files

```txt
README.md
start-here.md
concept.md
protokit-proof.md
prototype-plan.md
scoring-rubric.md
playtest-notes.md
domains/domain-scope.md
subdomains/subdomain-scope.md
```

## Generated object proof packet add-on

For small idempotent object proofs, also include:

```txt
object-proof.md
generation-spec.md
mesh-variants.md
texture-optimization.md
material-variants.md
lod-policy.md
budget-report.md
comparison-notes.md
idempotency-checks.md
```

If the object has a special state, add one focused file for it:

```txt
interaction-states.md
visual-states.md
liquid-variants.md
```

## Read order

```txt
1. start-here.md
2. concept.md
3. object-proof.md
4. protokit-proof.md
5. domains/domain-scope.md
6. subdomains/subdomain-scope.md
7. generation-spec.md
8. mesh-variants.md
9. texture-optimization.md
10. material-variants.md
11. lod-policy.md
12. budget-report.md
13. comparison-notes.md
14. idempotency-checks.md
15. prototype-plan.md
16. scoring-rubric.md
17. playtest-notes.md
```

## Packet status

Set one status in the packet README and start-here file:

```txt
raw
refined
ready-for-prototype
playtest-candidate
production-candidate
merged
retired
superseded
shipped
```

## ProtoKit proof rule

Every idea packet must include `protokit-proof.md`.

That file should explain whether the idea can be built from existing ProtoKits, whether existing domains should be updated, or whether a genuinely new domain/subdomain kit may be needed.

Use the domain-update-first mindset:

```txt
Update an existing domain if the behavior fits.
Create a new DSK only when the behavior is outside existing domain boundaries.
Treat new kit creation as a last resort after a domain-fit audit.
```

## Domain and subdomain rule

Every idea packet must include:

```txt
domains/domain-scope.md
subdomains/subdomain-scope.md
```

Each domain and subdomain should be scoped by responsibility, not by the game title.

Good:

```txt
resource-pressure
route-checkpoint
camera-follow-framing
score-combo-window
ambient-loop-layering
```

Bad:

```txt
my-game-domain
level-one-system
cool-vibes-kit
```

## Idempotent proof rule

For generated object proofs, record the idempotency contract:

```txt
same seed
same object spec
same optimization pass order
same output descriptor tree
same measurable budget fields
```

No proof should rely on hidden manual state.
