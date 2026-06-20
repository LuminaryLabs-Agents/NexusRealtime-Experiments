# Idempotency Checks

## Required checks

```txt
same seed returns same button mesh descriptor
same state returns same pressed offset
same LED state returns same emissive descriptor
same wear amount returns same overlay descriptor
same budget target returns same budget fields
```

## Failure cases

- press state changes without input
- LED descriptor changes without state change
- wear overlay is random between runs
