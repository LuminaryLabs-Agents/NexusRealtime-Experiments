# Agent Ledger Entry: Cavalry mini squad visual pass

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Replace token-like tactical unit visuals with mini squads of low-poly soldiers. Remove circular unit bases/rings and keep identity through class colors and military bands only.

## Change Summary

Added `src/hex-squad-visual-pass.js`, loaded after the WebGL hex battlefield pass. It hides the older unit-token canvas, draws a new unit overlay with class-specific squad formations, and keeps Rome-only selection. Light units draw as smaller loose squads, medium units as mid-sized squads, and heavy units as larger denser squads. Each low-poly soldier is built from primitive body parts: legs, torso, head, helmet, shield, spear, military band, and optional heavy cape/crest details.

Selection/hover feedback no longer uses rings. It uses squad lift, brightness, grounded shadow strength, and a small pennant on the squad leader.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-squad-visual-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-visual-static-smoke.mjs`
- `.agent/turn-ledger/2026-07-01-cavalry-mini-squad-visual-pass.md`

## Checks Run

- Local syntax check before commit:
  - `node --check /mnt/data/hex-battlefield-pass.js`
- GitHub contents writes succeeded on `main`.
- Static smoke now guards the mini-squad visual pass, token ring removal metadata, low-poly soldier drawing, squad layout, grounded shadows, selection pennants, old token canvas hiding, and Rome-only selection.

## Decision Notes

- This is implemented as a new overlay pass so the WebGL tile shader stays intact while unit visuals improve immediately.
- The older unit canvas is hidden by opacity/pointer-events rather than deleting the underlying hex module, minimizing risk while the hex system is still stabilizing.
- No visible UI, HUD, command bar, or loader overlay was reintroduced.

## Risks / Watch Items

- A later cleanup should merge the squad visual pass into `hex-battlefield-pass.js` directly and remove old token drawing entirely.
- Browser-backed visual validation is still needed.

## Next Ledge

Add scene-native unit movement and reachable hex highlighting using the squad overlay, while continuing to improve visual fidelity in the same iteration.
