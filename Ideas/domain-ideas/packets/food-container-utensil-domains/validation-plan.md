# Validation Plan

## Best first validations

```txt
101 liquid-surface-level
102 liquid-fill-volume
111 liquid-steam-emission
121 bowl-inner-curve
141 spoon-bowl-curve
146 utensil-metal-roughness
```

## Proof packet mapping

```txt
soup-surface-steam-proof -> 101, 105, 111, 112, 196
ceramic-mug-chip-proof -> 123, 124, 129, 130, 132
spoon-metal-reflection-proof -> 141, 142, 146, 147, 158
potion-glass-material-proof -> 102, 116, 133, 134, 137
```

## Promotion criteria

Promote a candidate only if it owns reusable fill rules, material-response rules, shape descriptors, state descriptors, or budget policies.
