# ProtoKit Proof

## Core question

Can a single cabinet-style physical interactor expose reusable state, material, feedback, and descriptor rules?

## Existing ProtoKits that may apply

- action-input-kit
- material-palette-kit
- render-layer-kit
- audio-event-feedback-maker-kit
- visual-fidelity-maker-kit

## Possible domain updates

- physical-interactor
- object-state
- input-feedback
- material-palette

## Renderer boundary

The renderer consumes state descriptors only.

It must not own pressed truth, input validation, LED state, or material optimization policy.
