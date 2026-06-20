# Object Proof

## Object

```txt
kind: physical interactor
name: arcade button
seed: arcade-button-proof-001
```

## Proof target

The same input spec should regenerate the same button mesh, material variants, interaction states, and feedback descriptors.

## Output descriptors

```txt
mesh descriptor
plastic material descriptor
LED state descriptor
press state descriptor
wear texture descriptor
budget descriptor
```

## Optimization passes

```txt
pass 1: simple button shape
pass 2: glossy cap material
pass 3: pressed / unpressed states
pass 4: LED-lit state
pass 5: surface wear texture
```
