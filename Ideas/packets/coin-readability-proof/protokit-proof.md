# ProtoKit Proof

## Core question

Can a tiny collectible object stay readable while using reusable material, visual, LOD, and budget descriptors?

## Existing ProtoKits that may apply

- material-palette-kit
- performance-budget-kit
- instanced-render-kit
- render-layer-kit
- visual-pipeline-kit

## Possible domain updates

- pickup-object
- readability-testing
- material-palette
- performance-budget

## Renderer boundary

The renderer consumes descriptors only.

It must not own collectible identity, material truth, LOD policy, or budget decisions.
