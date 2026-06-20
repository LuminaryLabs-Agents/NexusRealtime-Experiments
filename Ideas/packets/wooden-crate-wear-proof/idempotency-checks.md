# Idempotency Checks

## Required checks

```txt
same seed returns same mesh descriptor
same material settings return same wood descriptor
same visual state returns same overlay descriptor
same LOD policy returns same LOD fields
same budget target returns same budget report fields
```

## Failure cases

- wood pattern changes between runs
- visual state changes without spec change
- LOD changes object identity
