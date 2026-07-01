# Agent Ledger Entry: Cavalry visible UI removal

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Begin gameplay-readiness work for `The Cavalry of Rome` by removing visible in-game UI while keeping visual fidelity as a standing secondary goal for all future iterations.

## Files Read First

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `experiments/The Cavalry of Rome/README.md`

## Change Summary

Removed all visible HUD/footer/control UI from the live and experiment entries. The route now presents as a canvas-only experience. Hidden DOM hooks remain for `status`, `readout`, and `commandBar` so the current runtime code can continue writing status/debug values without throwing errors.

The live route still loads `main-realistic.js` and `vegetation-pass.js`. The static smoke now verifies the hidden UI contract and guards against visible instruction footer text returning.

## Files Changed

- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `experiments/The Cavalry of Rome/domain-plan.json`
- `.agent/turn-ledger/2026-07-01-cavalry-remove-visible-ui.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke source was updated to verify hidden UI hooks and no visible footer instructions.
- Full repo checks were not run locally because the repository was edited through GitHub contents writes rather than a local checkout.

## Decision Notes

- This removes visible in-game UI without breaking existing runtime dependencies.
- This is the first gameplay-readiness step before adding scene-native mechanics.
- The standing iteration rule is now documented: future gameplay changes should also improve visual fidelity as a secondary goal.
- No combat, economy, AI, unit stats, or visible HUD mechanics were added.

## Risks / Watch Items

- Runtime still writes to hidden `status` and `readout` elements. A later cleanup should make `main-realistic.js` fully null-safe and remove the hidden hooks entirely.
- Page loader UI may still briefly appear during loading because it is shared route infrastructure, not game HUD.
- A browser-backed smoke should verify no visible HUD/footer after boot.

## Next Ledge

Add scene-native gameplay interaction with no visible HUD, likely starting with selecting/committing a region through terrain affordance feedback rather than panels or buttons.

## Do Not Do Next

- Do not reintroduce visible HUD/footer/instruction panels.
- Do not add combat rules, troop stats, campaign economy, or encounter resolution yet.
- Do not claim canonical-route or deterministic-replay status yet.
