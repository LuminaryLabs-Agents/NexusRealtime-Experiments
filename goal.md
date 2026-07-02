# Goal: Kit Extraction And Repeatable Experiments

## Intent

Make NexusRealtime-Experiments easier to duplicate, template, and harden by turning game-local kit seams into documented ProtoKit extraction candidates without removing existing game behavior.

## Criteria

- Work from `LuminaryLabs-Agents/NexusRealtime-Experiments` on `main`.
- Keep `main` current with `origin/main` before edits.
- Do not edit existing game code for the first feedback pass.
- Add a repeatable experiment structure for future games and migrations.
- Add a feedback-folder convention for route-specific kit extraction notes.
- Add `NexusRealtime-KitInjector`, a linear CLI that reads repo memory, current game files, current kits, and route feedback before asking NVIDIA NIM GLM 5.1 for a kit-injection plan.
- Keep reusable implementation out of Experiments unless the repo explicitly chooses a local proof fixture.

## Current Slice

- First target game: `games/rogue-lite-hellscape-siege/`.
- First output mode: docs and proposal packets only.
- First injector mode: dry-run context packet by default; NIM call only when explicitly requested with credentials.
