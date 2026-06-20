# NexusRealtime-Experiments Memory

## Purpose
NexusRealtime-Experiments hosts playable browser experiments that compose NexusRealtime and ProtoKits into app-specific pages.

## Architecture
- Experiments own branded app configuration, presets, copy, routes, and renderer-host decisions.
- `experiments/dsk-first-wave-proof/` is the minimal direct-import DSK validation route. It uses a browser import map for bare `nexusrealtime`, imports first-wave ProtoKit N aliases from `NexusRealtime-ProtoKits`, and proves installed APIs under `engine.n.*`.
- The Open Above is split into `index.html`, `open-above.config.js`, and `open-above.js`.
- The Open Above composes generic ProtoKit DSKs directly from `open-above.js`; app-specific tuning stays in `open-above.config.js`.
- The Open Above exposes `window.GameHost` for private NexusSimulator validation.

## Conventions
- Do not put The Open Above presets or app-specific tuning into ProtoKits.
- Use `docs/VISUAL-EXPERIMENT-LOOP.md` for target-image upgrade passes: visual differences become ProtoKit gaps only when reusable, otherwise they stay in the experiment route, renderer, input, UI, or content.
- The Open Above is a high-fidelity bird flight and terrain-streaming simulator.
- The Open Above should not use wind/updraft gameplay forces, checkpoint rings, ring challenges, or terrain ring objectives.
- Ambient clouds, lighting, and atmosphere are allowed only as presentation descriptors.
- Keep validation state explicit enough for NexusSimulator to prove airborne motion, terrain streaming, and no console errors.
- For the 100-game AAA experiment track, every batch must start with `gpt-it` in the NexusRealtime/Experiments ChatGPT project, then local implementation must verify GPT advice against repo files before editing. Future batch additions should preserve unique fantasy, verb, pressure loop, visual identity, kit/DSK composition, GameHost smoke coverage, and renderer-as-presentation boundaries.
- Batch 02 established `generic-pressure-loop-kit` + planned `generic-resource-loop-kit` as reusable DSK composition markers for new AAA seeds; GameHost owns resource/pressure/rejection/completion state, while canvas renderers stay presentation-only.
- Batch 03 extracted AAA action validation into `experiments/aaa-batch/host/action-contract.js`; future batches should keep declared actions and rejection reasons data/host-owned, not renderer-owned.
- Batch 04 extracted AAA affordance availability into `experiments/aaa-batch/host/affordance-contract.js`; future batches should expose available affordance descriptors in GameHost state and keep target usability out of renderers.
- Batch 05 continues the shared AAA route pattern with 40 total data-driven seeds; future batches should keep route files tiny and put unique fantasy, verb, pressure loop, palette, actions, smoke steps, and affordance descriptors in `experiments/aaa-batch/host/game-registry.js`.
- Batch 06 brings the shared AAA route set to 48 seeds and confirms the scaling pattern: add only route shells plus registry data, arcade entries, backlog rows, memory note, and smoke count unless a generic host/kit gap appears.
- Batch 07 brings the shared AAA route set to 56 seeds from `gpt-it` output; GitHub connector review confirmed it cannot push local-only commits because the commit objects are not present remotely, so local `gh auth` remains the push blocker.
- Batch 08 brings the shared AAA route set to 64 seeds from `gpt-it` output; future route batches should keep using compact GPT lists, then map each idea into the same registry-driven GameHost affordance smoke path.
- Batch 09 brings the shared AAA route set to 72 seeds from `gpt-it` output; when GPT truncates a route line, preserve the returned slug/title/fantasy/verb and complete only the missing operational details conservatively inside the existing registry schema.

- Batch 10 brings the shared AAA route set to 80 seeds using GPT-sourced route ideas plus the existing registry-driven route shell pattern.

- The 100-game AAA experiment catalog is implemented in the shared registry-driven route shell. The final 20 games came from `gpt-it` output and continue the pressure/resource/action-window/affordance DSK composition marker pattern. Phase 2 SimTime QA should start only after `npm run check` passes on the complete catalog.
