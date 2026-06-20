# Texture Optimization

## Texture passes

```txt
base yellow peel
subtle green tip gradient
brown spot mask
soft bruise mask
fine peel normal detail
roughness variation
```

## Budget checks

```txt
near texture:
mid texture:
far texture:
compression target:
visible loss threshold:
```

## Optimization rule

Each pass must be recorded so a later pass can be compared against the previous output.
