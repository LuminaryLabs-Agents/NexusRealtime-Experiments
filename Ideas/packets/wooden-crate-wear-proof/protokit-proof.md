# ProtoKit Proof

## Core question

Can a simple generated prop expose reusable mesh, material, visual-state, LOD, and budget descriptor rules?

## Existing ProtoKits that may apply

- material-palette-kit
- performance-budget-kit
- instanced-render-kit
- render-layer-kit
- visual-pipeline-kit

## Possible domain updates

- prop-generation
- material-palette
- object-lifecycle
- visual-state

## Renderer boundary

The renderer consumes descriptors only.

It must not own prop identity, visual state truth, LOD policy, or material budget decisions.
