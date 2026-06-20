# Coin Readability Proof

A small idempotent object proof for arcade collectible readability.

## Goal

Generate a coin from a fixed spec and repeatedly improve silhouette, material response, pickup glow, and distance readability.

## Full structure

```txt
coin-readability-proof/
├─ start-here.md
├─ README.md
├─ concept.md
├─ object-proof.md
├─ protokit-proof.md
├─ generation-spec.md
├─ mesh-variants.md
├─ texture-optimization.md
├─ material-variants.md
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
same seed + same coin spec + same material pass = same readable pickup descriptor
```
