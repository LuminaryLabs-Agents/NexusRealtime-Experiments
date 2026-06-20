# Domain Scope

## Possible domains

```txt
object-generation
transparent-material
emissive-feedback
texture-layering
material-palette
performance-budget
```

## Required first-pass domains

```txt
object-generation: owns stable bottle descriptors
transparent-material: owns glass material descriptors
emissive-feedback: owns glow state descriptors
texture-layering: owns label and mask layers
performance-budget: owns material and render budget reports
```

## Domain-update-first audit

Prefer updating existing material, lighting, visual, and performance kits before creating new potion-specific kits.

No potion-named DSK should be created.
