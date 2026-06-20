# Idempotency Checks

## Required checks

```txt
same seed returns same mesh descriptor
same seed returns same material descriptor
same variant set returns same material list
same LOD policy returns same distance descriptor fields
same budget target returns same budget report fields
```

## Failure cases

- detail changes between runs
- material variant order changes
- distance readability report changes without input changes
