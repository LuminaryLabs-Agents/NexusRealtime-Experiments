# The Cavalry of Rome

A NexusRealtime Roman campaign-to-hex tactical experiment.

This route is now a playable tactical seed: a campaign terrain reveal leads into a WebGL2-shaded hex battlefield with mini low-poly squads, a bottom action-card UI, action points, board dice, movement rules, and enemy counterplay after each player maneuver.

## Active modules

```txt
src/main-realistic.js
src/vegetation-pass.js
src/hex-battlefield-pass.js
src/hex-squad-visual-pass.js
src/hex-gameplay-pass.js
src/hex-action-ui-pass.js
src/hex-roll-controller-pass.js
src/hex-opponent-ai-pass.js
```

## Current tactical loop

```txt
Roll AP: 0 AP, roll 2d6 in place
Advance Left: 1 AP, move all eligible Rome units in the left third
Advance Center: 1 AP, move all eligible Rome units in the center third
Advance Right: 1 AP, move all eligible Rome units in the right third
Line Brigade: 2 AP, select one connected adjacent line, only that original line can move
Heavy Brigade: 3 AP, move all Rome heavy units
Berserk: 4 AP, move one unit up to two spaces, then attack an adjacent enemy
Scout: 4 AP, move one unit up to three spaces
```

Advances no longer roll for unit count. The unit count is the number of available Rome units in the selected third.

## Enemy AI

Enemy movement happens after each completed player maneuver.

The enemy controller exposes a RAG/ONNX-shaped policy surface:

```txt
requested: rag-onnx-enemy-policy
modelUrl: ./models/cavalry-enemy-policy.onnx
runtime: rag-memory-fallback
```

No trained ONNX model artifact is bundled yet. Until a trained model is added, the enemy uses tactical memory retrieval plus stochastic scoring. It counters the last player maneuver, weighs pressure by battlefield third, avoids water, values hills/fences, attacks adjacent Rome units when possible, and injects randomness so moves feel less deterministic.

## Movement rules

```txt
Water: impassable
Hill: can be entered, then maneuver ends
Fence: can be entered, then maneuver ends
Light units: move up to 2 spaces normally
Scout: move up to 3 spaces
Berserk: move up to 2 spaces, then attack if adjacent
```

## Dice

Action point dice use a corrected unbiased d6 roll:

```txt
range = 2^32
limit = range - (range % 6)
result = (randomUint32 % 6) + 1
```

The dice animation is slower and more aggressive, with tumbling motion across the board before landing on the final side.

## UI

The route now has a dedicated tactical UI, not the old debug HUD:

```txt
bottom native card action bar
Action Points card
Roll AP card
seven maneuver cards
active/disabled card states
```

The old HUD/footer/commandBar DOM remains removed.

## Visual rules

```txt
Hex interiors: WebGL2 procedural terrain materials
Units: mini low-poly squad formations
Unit identity: body color + military band
Selection: lift, brightness, pennant, and hex highlight
No circular unit bases or selection rings
No screen-space vegetation overlay
```

## Design boundary

Do not copy tabletop scenarios, cards, dice faces, stat tables, named rule text, or board layouts from existing games. This route should remain original Roman-history inspired tactical gameplay.

## Next ledge

Add a real trained ONNX policy artifact and retrieval dataset, then browser-test the opponent turn loop, line brigade edge cases, and dice animation timing.
