# NexusRealtime-Experiments Memory

## Purpose
NexusRealtime-Experiments hosts playable browser experiments that compose NexusRealtime and ProtoKits into app-specific pages.

## Architecture
- Experiments own branded app configuration, presets, copy, routes, and renderer-host decisions.
- The Open Above is split into `index.html`, `open-above.config.js`, and `open-above.js`.
- The Open Above composes generic ProtoKit DSKs directly from `open-above.js`; app-specific tuning stays in `open-above.config.js`.
- The Open Above exposes `window.GameHost` for private NexusSimulator validation.

## Conventions
- Do not put The Open Above presets or app-specific tuning into ProtoKits.
- The Open Above is a high-fidelity bird flight and terrain-streaming simulator.
- The Open Above should not use wind/updraft gameplay forces, checkpoint rings, ring challenges, or terrain ring objectives.
- Ambient clouds, lighting, and atmosphere are allowed only as presentation descriptors.
- Keep validation state explicit enough for NexusSimulator to prove airborne motion, terrain streaming, and no console errors.
- For the 100-game AAA experiment track, every batch must start with `gpt-it` in the NexusRealtime/Experiments ChatGPT project, then local implementation must verify GPT advice against repo files before editing. Future batch additions should preserve unique fantasy, verb, pressure loop, visual identity, kit/DSK composition, GameHost smoke coverage, and renderer-as-presentation boundaries.
- Batch 02 established `generic-pressure-loop-kit` + planned `generic-resource-loop-kit` as reusable DSK composition markers for new AAA seeds; GameHost owns resource/pressure/rejection/completion state, while canvas renderers stay presentation-only.
- Batch 03 extracted AAA action validation into `experiments/aaa-batch/host/action-contract.js`; future batches should keep declared actions and rejection reasons data/host-owned, not renderer-owned.
- Batch 04 extracted AAA affordance availability into `experiments/aaa-batch/host/affordance-contract.js`; future batches should expose available affordance descriptors in GameHost state and keep target usability out of renderers.
