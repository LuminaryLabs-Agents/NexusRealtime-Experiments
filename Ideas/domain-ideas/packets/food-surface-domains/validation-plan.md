# Validation Plan

## Best first validations

```txt
001 curved-fruit-silhouette
002 peel-color-gradient
003 peel-spot-mask
004 fruit-cut-surface
005 fruit-wetness-highlight
081 candy-wrapper-crinkle
```

## Proof packet mapping

```txt
banana-fidelity-proof -> 001, 002, 003, 004, 012, 020
sliced-fruit-wetness-proof -> 007, 008, 010, 011, 014
bread-crust-break-proof -> 041, 042, 047, 053, 060
candy-wrapper-crinkle-proof -> 081, 082, 088, 090
```

## Promotion criteria

Promote a candidate only if it owns repeatable generation rules, texture-layer rules, material-state rules, LOD policy, or descriptor schema.
