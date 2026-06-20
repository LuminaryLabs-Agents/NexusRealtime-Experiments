# Arcade Button Material Proof

A small idempotent object proof for physical arcade hardware interaction states.

## Goal

Generate a cabinet button from a fixed spec and repeatedly improve glossy plastic, LED glow, pressed state, and worn surface details.

## Full structure

```txt
arcade-button-material-proof/
├─ start-here.md
├─ README.md
├─ concept.md
├─ object-proof.md
├─ protokit-proof.md
├─ generation-spec.md
├─ mesh-variants.md
├─ texture-optimization.md
├─ material-variants.md
├─ interaction-states.md
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
same seed + same button spec + same state = same interactor descriptor
```
