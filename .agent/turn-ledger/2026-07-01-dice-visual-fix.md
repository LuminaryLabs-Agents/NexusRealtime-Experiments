# Dice visual fix

Date: 2026-07-01

Added a final dice visual overlay pass.

The pass renders pseudo-3D dice with a top face, side face, front face, and contact shadow.

Dice now roll, land, hold still for three seconds, then fade.

The Roll AP card receives a stronger spent visual state after the one allowed roll.

No movement or rules were changed.

Playwright was used with a local setContent harness because page navigation was blocked in Chromium. The harness confirmed the dice were visible after landing, still visible after the three second hold window, faded afterward, and Roll AP remained disabled.
