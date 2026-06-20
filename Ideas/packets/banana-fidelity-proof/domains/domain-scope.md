# Domain Scope

## Possible domains

```txt
object-generation
material-palette
texture-optimization
lod-policy
performance-budget
visual-fidelity
```

## Required first-pass domains

```txt
object-generation: creates stable banana descriptors
material-palette: owns peel material descriptors
texture-optimization: owns texture pass tracking
performance-budget: owns triangle and texture budget reports
```

## Domain-update-first audit

Prefer updating existing material, render, and performance ProtoKits before creating new banana-specific kits.

No banana-named DSK should be created.
