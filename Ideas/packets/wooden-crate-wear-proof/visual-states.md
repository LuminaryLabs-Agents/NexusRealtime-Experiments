# Visual States

## States

```txt
clean
worn
wet
open
reinforced
aged
```

## State descriptor rules

- `worn` changes edge overlay.
- `wet` changes material roughness.
- `open` changes mesh or lid descriptor.
- `aged` changes color and overlay strength.

## Boundary

This file tracks visual state only.

It does not define gameplay rules.
