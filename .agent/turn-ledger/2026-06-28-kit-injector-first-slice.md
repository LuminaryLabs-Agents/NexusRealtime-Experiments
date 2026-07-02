# Agent Ledger Entry: Kit Injector First Slice

Date: 2026-06-28
Actor: Codex
Repo: NexusRealtime-Experiments
Branch: main

## Goal

Locate the online `LuminaryLabs-Agents/NexusRealtime-Experiments` repo, work from current `main`, add an additive repeatable experiment and kit-injection structure, and review one existing game through feedback docs without editing that game.

## Files Read First

- `.agent/START_HERE.md`
- `.agent/cycle-state.md`
- `.agent/protokit-map.md`
- `.agent/architecture.md`
- `.agent/turn-ledger/README.md`
- `README.md`
- `memory.md`
- `package.json`
- `games/rogue-lite-hellscape-siege/README.md`
- `games/rogue-lite-hellscape-siege/src/main.js`
- `games/rogue-lite-hellscape-siege/src/protokits/runtime.js`
- `games/rogue-lite-hellscape-siege/src/protokits/hellscape-kits.js`

## Change Summary

Added a first additive kit-extraction workflow: active `goal.md`, repeatable route structure docs, Rogue-Lite Hellscape Siege feedback, and a `NexusRealtime-KitInjector` CLI that reads repo memory, route files, current kits, and feedback before optionally calling NVIDIA NIM GLM 5.1.

## Files Changed

- `goal.md`
- `docs/repeatable-experiment-structure.md`
- `feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md`
- `feedback/rogue-lite-hellscape-siege/kit-injector/context-packet.md`
- `experiments/_shared/nexus-experiments-shell.js`
- `tools/NexusRealtime-KitInjector/README.md`
- `tools/NexusRealtime-KitInjector/kit-injector.mjs`
- `package.json`
- `memory.md`
- `.agent/turn-ledger/2026-06-28-kit-injector-first-slice.md`

## Checks Run

- `node tools/NexusRealtime-KitInjector/kit-injector.mjs --help` passed.
- `npm run kit:inject -- --game games/rogue-lite-hellscape-siege --feedback feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md` passed and wrote `feedback/rogue-lite-hellscape-siege/kit-injector/context-packet.md`.
- First `npm run check` ran `npm run generate`, passed JS syntax/static/content/Next Ledge Grapple early checks, then failed at `tests/canonical-game-routes-smoke.mjs` with `AssertionError [ERR_ASSERTION]: shell should render a small route accent`.
- Added the missing compact route accent in `experiments/_shared/nexus-experiments-shell.js`.
- Second `npm run check` moved past the route-accent assertion, then failed at `tests/canonical-game-routes-smoke.mjs` with `AssertionError [ERR_ASSERTION]: the-open-above-v2 route should not be versioned`. Generated route artifacts from the failed checks were removed because they were unrelated to this slice.
- `node tests/js-syntax-smoke.mjs` passed after cleanup: `Syntax checked 252 JS/MJS files.`

## Decision Notes

- Existing game code was not edited.
- The CLI defaults to dry-run context packet creation and does not call NIM unless `--call-nim` is explicit.
- The CLI writes proposal artifacts under `feedback/<route-slug>/kit-injector/`.
- Reusable implementation remains directed toward ProtoKits; Experiments owns docs, route feedback, bridge planning, and validation context.

## Risks / Watch Items

- NIM proposal quality depends on current context size and route file coverage.
- The first real migration still needs a preservation smoke before replacing any local Hellscape kit.
- The sibling `NexusRealtime-ProtoKits` checkout may not exist locally; the CLI records that rather than failing.

## Next Ledge

Run the injector dry-run for Rogue-Lite Hellscape Siege, inspect the generated context packet, then add a browserless preservation smoke around the current local Hellscape runtime before any kit replacement.

## Do Not Do Next

Do not mutate `games/rogue-lite-hellscape-siege/` or delete local kits until a preservation smoke and accepted proposal exist.
