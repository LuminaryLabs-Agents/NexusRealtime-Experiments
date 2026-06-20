# Domain Scope

## Possible domains

```txt
physical-interactor
object-state
material-palette
input-feedback
visual-fidelity
performance-budget
```

## Required first-pass domains

```txt
physical-interactor: owns cabinet-button object descriptors
object-state: owns idle, pressed, released, lit, and worn state
material-palette: owns plastic and LED material descriptors
input-feedback: owns visual feedback descriptor shape
```

## Domain-update-first audit

Prefer updating existing action input, material, visual, and feedback kits before creating new button-specific kits.

No arcade-button-named DSK should be created.
