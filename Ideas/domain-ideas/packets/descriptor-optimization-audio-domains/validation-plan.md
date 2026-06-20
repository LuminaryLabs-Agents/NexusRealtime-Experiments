# Validation Plan

## Best first validations

```txt
401 mesh-seed-contract
404 texture-pass-order
410 descriptor-schema-version
411 object-output-hash
415 near-mid-far-view
416 lod-threshold-policy
420 idempotency-report
441 decal-placement-surface
469 glow-pulse-state
499 audio-event-descriptor
```

## Proof packet mapping

```txt
banana-fidelity-proof -> 401, 403, 404, 405, 416, 420
coin-readability-proof -> 413, 415, 416, 477, 499
arcade-button-material-proof -> 427, 469, 499, 500
potion-glass-material-proof -> 405, 410, 418, 419, 480
relic-pedestal-proof -> 423, 437, 469, 477, 499
```

## Promotion criteria

Promote candidates when they own infrastructure rules that many generated object proofs need: schema versioning, output hashes, LOD thresholds, comparison snapshots, overlay layers, VFX descriptors, or audio event descriptors.
