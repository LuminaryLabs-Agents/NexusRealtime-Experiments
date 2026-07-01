# Agent Ledger Entry: Cavalry dice timing AP lockout

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Make one incremental rules/visual change: dice should roll, land, stay still on the final numbers for 3 seconds, then fade. Roll AP should only be usable once per player turn and the card should grey out after that roll.

## Change Summary

Updated `hex-combat-controller-pass.js` to centralize dice timing through `DICE_TIMING`:

- `landAt: 2200`
- `holdFor: 3000`
- `fadeFor: 1100`

Dice now keep spinning/rolling until `landAt`, then remain stable on the final die faces for the 3 second hold window before fading out. This applies to AP and combat dice.

Roll AP already used `canRollActionPoints`; the pass keeps the one-roll-per-player-turn rule. After an AP roll, `state.canRollActionPoints = false`, which makes `canRollInPlace` false in the tactical snapshot. The action UI already disables the Roll AP card when `canRollInPlace` is false, making the card visibly greyed out.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-combat-controller-pass.js`
- `tests/cavalry-of-rome-combat-static-smoke.mjs`
- `.agent/turn-ledger/2026-07-01-cavalry-dice-timing-ap-lockout.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke now guards centralized dice timing, 3 second hold, fade timing, explicit landing timing, and Roll AP card greying behavior.
- Browser-backed validation was not run in this session.

## Movement Note

No movement rules were changed. Units remain constrained by the existing maneuver/reachable-hex system.
