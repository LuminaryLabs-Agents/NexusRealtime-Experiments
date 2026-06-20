# Idempotency Checks

## Required checks

```txt
same seed returns same bottle mesh descriptor
same fill settings return same fill descriptor
same label settings return same label descriptor
same light settings return same visual descriptor
same LOD policy returns same LOD fields
same budget target returns same budget report fields
```

## Failure cases

- fill state changes without spec change
- label output changes between runs
- visual state changes object identity
- material cost is not reported
