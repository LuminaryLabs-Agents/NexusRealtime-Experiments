# Domain Scope

## Possible domains

```txt
prop-generation
visual-state
material-palette
object-lifecycle
lod-policy
performance-budget
```

## Required first-pass domains

```txt
prop-generation: owns stable box-like prop descriptors
visual-state: owns clean, worn, wet, and open states
material-palette: owns wood material variants
performance-budget: owns triangle and texture budget reports
```

## Domain-update-first audit

Prefer updating existing prop, material, render, and performance kits before creating new crate-specific kits.

No wooden-crate-named DSK should be created.
