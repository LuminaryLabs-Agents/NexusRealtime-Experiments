# Agent Ledger Entry: Cavalry hex alignment, selection, and vegetation fix

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Respond to the reported issues after the first hex battlefield pass: hexes were misaligned/uneven, enemy units could be selected, world-map vegetation was floating in the sky, and panning/level selection felt skippy.

## Files Read First

- `experiments/The Cavalry of Rome/src/main-realistic.js`
- `experiments/The Cavalry of Rome/src/vegetation-pass.js`
- `experiments/The Cavalry of Rome/src/hex-battlefield-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`

## Change Summary

Fixed the hex board alignment by replacing row-dependent scale drift with fixed pointy-offset hex math using a single radius, `SQRT3` spacing, and a consistent `HEX_Y_SCALE`. The board now uses regular horizontal and vertical spacing and keeps the Rome-perspective squash without changing per-row hex size.

Restricted unit hover/selection to Rome-side units only. Enemy units remain visible but cannot be selected.

Disabled the old screen-space vegetation renderer entirely. The vegetation pass still creates deterministic renderer-neutral descriptors and patches `GameHost`, but it no longer creates or draws the overlay canvas. This removes sky-floating vegetation and reduces panning/selection jank caused by drawing thousands of 2D vegetation marks every frame.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-battlefield-pass.js`
- `experiments/The Cavalry of Rome/src/vegetation-pass.js`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-hex-alignment-selection-vegetation-fix.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke source now guards fixed hex alignment, Rome-only selection, metadata-only vegetation presentation, disabled screen-space vegetation rendering, and no old floating overlay canvas.
- Fetched changed source files from `main` for verification.
- Attempted local Playwright validation was not possible in this environment: Playwright is not installed and the container cannot resolve the live GitHub Pages hostname. No browser-backed visual run was completed.

## Decision Notes

- The sky-floating vegetation problem came from `vegetation-pass.js` drawing a screen-space 2D overlay with approximate projection, not from terrain-anchored WebGPU geometry. Disabling that overlay is the correct immediate fix until proper terrain-anchored instancing is added.
- The hex grid remains a no-UI overlay over the old battlefield renderer for now, but it is opaque and scene-native from the user's perspective.
- Enemy unit selection is blocked in the scene interaction layer, not via UI.

## Risks / Watch Items

- The world map no longer visually renders procedural vegetation, although it still generates metadata descriptors. Future visual work should add real terrain-anchored WebGPU vegetation instances rather than returning to screen-space overlay marks.
- A real Playwright/browser smoke should be added in an environment with Playwright and network access.
- The old WebGPU battlefield still renders beneath the hex canvas and should be removed/replaced directly once the hex system stabilizes.

## Next Ledge

Add scene-native unit movement on the hex board with terrain movement costs and reachable-hex highlighting, while improving battlefield visual fidelity and avoiding all UI DOM.

## Do Not Do Next

- Do not reintroduce screen-space vegetation rendering.
- Do not reintroduce visible or hidden UI DOM.
- Do not make enemy units selectable until turn/side ownership is implemented.
- Do not add combat resolution before movement and placement are stable.
