# Validation Plan

## Best first validations

```txt
321 leaf-alpha-mask
322 leaf-vein-normal
331 grass-blade-card
341 button-press-state
357 lock-turn-state
381 pickup-trigger-radius
386 inspect-focus-state
399 interaction-validation-event
```

## Proof packet mapping

```txt
procedural-rock-fidelity-proof -> 303, 304, 305, 319, 320
leaf-card-optimization-proof -> 321, 322, 325, 326, 339
arcade-button-material-proof -> 341, 342, 343, 359, 360
key-lock-turn-proof -> 356, 357, 359, 399
relic-pedestal-proof -> 386, 387, 388, 389, 400
```

## Promotion criteria

Promote candidates only when they own reusable object state, interaction validation, physical control state, or descriptor output rules.
