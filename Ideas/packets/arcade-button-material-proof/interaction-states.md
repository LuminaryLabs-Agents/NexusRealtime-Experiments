# Interaction States

## States

```txt
idle
hovered
pressed
released
lit
worn
```

## State descriptor rules

- `pressed` changes vertical offset.
- `lit` changes emissive descriptor.
- `hovered` may add subtle outline or glow.
- `worn` changes texture overlay only.

## Boundary

This file tracks visual and object state.

It does not define full input mapping or gameplay scoring.
