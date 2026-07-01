# Agent Ledger Entry: Cavalry tactical maneuver gameplay

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Implement the first tactical gameplay logic layer for `The Cavalry of Rome`: remove high-noon soldier shadows, add scene-native maneuver rules, action points, movement highlights, terrain restrictions, and WebGL-shaded dice rolls while preserving no visible UI.

## Files Read First

- `experiments/The Cavalry of Rome/src/main-realistic.js`
- `experiments/The Cavalry of Rome/src/hex-battlefield-pass.js`
- `experiments/The Cavalry of Rome/src/hex-squad-visual-pass.js`
- `experiments/The Cavalry of Rome/src/vegetation-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`

## Change Summary

Added `src/hex-gameplay-pass.js`, loaded after the hex battlefield and squad visual passes. It supersedes the older squad/high-noon shadow layers, draws mini squads with individual angled soldier shadows, adds scene-native unit/target highlights, implements the seven maneuver types, action point cadence, movement restrictions, and WebGL2 shaded dice rolls.

Implemented maneuvers:

- Advance Left / Center / Right: cost 1 AP, roll 1d6 eligible units from the map third.
- Line Brigade: cost 2 AP, move a connected adjacent group of Rome units.
- Heavy Brigade: cost 3 AP, move all Rome heavy units.
- Berserk: cost 4 AP, move one unit up to two spaces and attack an adjacent enemy.
- Scout: cost 4 AP, move one unit up to three spaces.

Action points are rolled every three turns using 2d6. Dice use `crypto.getRandomValues` when available and render through a WebGL2 shaded board-dice canvas. Water is impassable. Hills and fences are allowed landing hexes but end the maneuver when entered.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-gameplay-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-tactical-maneuver-gameplay.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke source now guards maneuver definitions, AP costs, d6/2d6 dice surfaces, crypto randomization, WebGL2 dice shader, movement restrictions, reachable hex calculations, line brigade grouping, Berserk attack targets, angled individual soldier shadows, and the live/experiment module wiring.
- Browser-backed Playwright validation was not run in this session.

## Decision Notes

- No HUD, panels, command UI, visible labels, or loader overlay were reintroduced.
- Keyboard numbers 1-7 are used as hidden controls for no-UI maneuver selection.
- Clicking a Rome unit with no active maneuver starts a default Advance based on that unit's map third.
- The gameplay pass mutates the existing hex battlefield unit positions so downstream renderers read the same state.
- Enemy units remain visible but not player-selectable.

## Risks / Watch Items

- This is the first gameplay implementation and should be browser-tested for event ordering with the existing hex/squad passes.
- The tactical movement rules are intentionally basic. Enemy turn behavior and full combat resolution are not implemented yet.
- The WebGL dice has a Canvas fallback, but visual quality should be validated in browser.

## Next Ledge

Validate the maneuver loop in Playwright/browser, then add enemy turns and fuller combat resolution while improving battlefield visual fidelity.

## Do Not Do Next

- Do not add visible UI or hidden UI DOM.
- Do not reintroduce token rings or circular unit bases.
- Do not copy tabletop card systems, dice faces, scenarios, or stat tables.
