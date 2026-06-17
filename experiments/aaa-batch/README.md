# AAA Batch 01

Eight GPT-specified playable vertical-slice seeds for the 100-game NexusRealtime Experiments track.

Each route uses a shared host while keeping the game-specific truth in manifest data plus `GameHost` state. The Canvas renderer consumes snapshots only.

## Routes

- `ember-rail`
- `tideglass-salvage`
- `echo-lock`
- `hollow-warden`
- `skyrig-suture`
- `mirage-stalker`
- `core-diver`
- `starwell-cartographer`

## GameHost Contract

- `GameHost.getState()`
- `GameHost.getValidationState()`
- `GameHost.tick(dt)`
- `GameHost.dispatch(action, payload)`
- `GameHost.runSmoke()`
- `GameHost.restart()`
