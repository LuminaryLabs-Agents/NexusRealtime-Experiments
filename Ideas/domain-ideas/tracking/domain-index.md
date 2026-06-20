# Domain Index

This index tracks the first 500 atomic domain candidates for DSK planning.

## Packet list

| Range | Packet | Focus |
|---|---|---|
| 001-100 | `Ideas/domain-ideas/packets/food-surface-domains/` | fruit, vegetables, bread, pastry, candy |
| 101-200 | `Ideas/domain-ideas/packets/food-container-utensil-domains/` | liquids, containers, utensils, cookware, food state |
| 201-300 | `Ideas/domain-ideas/packets/collectible-paper-light-flexible-domains/` | packaging, collectibles, books, light objects, ropes, cloth |
| 301-400 | `Ideas/domain-ideas/packets/nature-hard-surface-interaction-domains/` | stone, foliage, buttons, doors, interactable objects |
| 401-500 | `Ideas/domain-ideas/packets/descriptor-optimization-audio-domains/` | idempotency, descriptors, surface layers, VFX, audio cues |

## First 10 to validate

```txt
001 curved-fruit-silhouette
002 peel-color-gradient
003 peel-spot-mask
004 fruit-cut-surface
005 fruit-wetness-highlight
081 candy-wrapper-crinkle
121 bowl-inner-curve
141 spoon-bowl-curve
281 rope-strand-normal
341 button-press-state
```

## Promotion rule

Only promote a candidate into a DSK when it owns reusable rules, state, validation, events, descriptors, or budget policy.
