# Idempotency Checks

## Required checks

```txt
same seed returns same mesh descriptor
same seed returns same material descriptor
same optimization pass order returns same texture layer list
same LOD policy returns same LOD descriptor IDs
same budget target returns same budget report fields
```

## Failure cases

- nondeterministic random spots
- texture pass order changes output unexpectedly
- LOD changes object identity
- descriptor schema changes without version bump
