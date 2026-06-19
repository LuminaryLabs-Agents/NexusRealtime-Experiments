# AAA Batch Support Harness

This directory is no longer the public route structure for playable experiments.

Public experiment routes should use:

```txt
experiments/<slug>/index.html
```

The code under `experiments/aaa-batch/host/` remains as shared support infrastructure for generated seed experiments:

- `game-registry.js` stores reusable seed metadata.
- `batch-host.js` boots one seed by slug.
- `game-host.js` owns deterministic host behavior for the seed harness.
- `canvas-renderer.js` presents the seed state.

Generated flat route wrappers are created by:

```txt
scripts/generate-flat-experiment-routes.mjs
```

That script creates `experiments/<slug>/index.html` for every registered AAA seed before checks and deploy.

Do not add new playable public routes under:

```txt
experiments/aaa-batch/<slug>/
```

Use `experiments/<slug>/index.html` instead.
