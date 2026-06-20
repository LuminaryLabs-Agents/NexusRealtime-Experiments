# Potion Glass Material Proof

A small idempotent object proof for transparent glass, colored liquid, labels, and emissive fantasy item readability.

## Goal

Generate a potion bottle from a fixed spec and repeatedly improve glass material, liquid fill, label texture, glow state, and cheap refraction-style visual descriptors.

## Full structure

```txt
potion-glass-material-proof/
├─ start-here.md
├─ README.md
├─ concept.md
├─ object-proof.md
├─ protokit-proof.md
├─ generation-spec.md
├─ mesh-variants.md
├─ texture-optimization.md
├─ material-variants.md
├─ liquid-variants.md
├─ lod-policy.md
├─ budget-report.md
├─ comparison-notes.md
├─ idempotency-checks.md
├─ prototype-plan.md
├─ scoring-rubric.md
├─ playtest-notes.md
├─ domains/
│  └─ domain-scope.md
└─ subdomains/
   └─ subdomain-scope.md
```

## Primary proof

```txt
same seed + same bottle spec + same liquid state = same fantasy item descriptor
```
