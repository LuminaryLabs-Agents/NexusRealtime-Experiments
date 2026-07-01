# Agent Ledger Entry: Cavalry opponent AI counterplay

Date: 2026-07-01
Actor: GPT-5.5 Thinking
Repo: LuminaryLabs-Agents/NexusRealtime-Experiments
Branch: main

## Goal

Add opponent movement after each player turn, remove advance unit-count dice, preserve original-line brigade behavior, keep Berserk/Scout intuitive, and improve dice timing/roll aggression.

## Change Summary

Added `src/hex-opponent-ai-pass.js`, loaded after the existing roll/action/gameplay stack. This final controller supersedes previous tactical controllers, patches `GameHost.startManeuver`, `GameHost.rollActionPointsInPlace`, and `GameHost.getTacticalGameplaySnapshot`, and owns the active tactical loop.

Enemy turns now run after every completed player maneuver. The enemy policy exposes a RAG/ONNX-shaped interface with `requested: rag-onnx-enemy-policy` and `modelUrl: ./models/cavalry-enemy-policy.onnx`; because no trained ONNX artifact is bundled yet, it uses `rag-memory-fallback` tactical retrieval and stochastic scoring. The fallback counters the last player maneuver, reads pressure by board third, avoids water, prefers tactical anchors, and injects randomness for less deterministic human-like behavior.

Advances no longer roll 1d6. Advance Left/Center/Right now allow all eligible Rome units in that third to move. Line Brigade captures the original adjacent line when selected and only those original units remain eligible even if the line breaks during movement. Heavy Brigade, Berserk, and Scout remain simple single-purpose maneuvers.

Dice now use the corrected uint32 d6 rejection range and animate more slowly/aggressively across the board before landing.

## Files Changed

- `experiments/The Cavalry of Rome/src/hex-opponent-ai-pass.js`
- `experiments/The Cavalry of Rome/src/hex-action-ui-pass.js`
- `apps/the-cavalry-of-rome/index.html`
- `experiments/The Cavalry of Rome/index.html`
- `tests/cavalry-of-rome-opponent-ai-static-smoke.mjs`
- `experiments/The Cavalry of Rome/README.md`
- `.agent/turn-ledger/2026-07-01-cavalry-opponent-ai-counterplay.md`

## Checks Run

- GitHub contents writes succeeded on `main`.
- Static smoke now guards RAG/ONNX policy surface, memory fallback, enemy turns, no-roll advances, original-line brigade behavior, Scout/Berserk rules, corrected d6 range, slower/aggressive dice animation, and live/experiment endpoint wiring.
- Browser-backed Playwright validation was not run in this session.

## Important Honesty Note

A real trained ONNX model file is not included yet. The current implementation provides the RAG/ONNX policy interface and a functional tactical-memory fallback. The next step is to train/add a real ONNX policy artifact and retrieval dataset.

## Next Ledge

Train or add the ONNX policy artifact, browser-test enemy turns and dice timing, then add enemy combat resolution and smarter pressure tracking.
