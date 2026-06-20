# Object Proof

## Object

```txt
kind: fantasy item prop
name: potion bottle
seed: potion-glass-proof-001
```

## Proof target

The same input spec should regenerate the same bottle mesh, glass material, liquid state, label texture, glow state, LODs, and budget descriptors.

## Output descriptors

```txt
mesh descriptor
glass material descriptor
liquid descriptor
label descriptor
glow descriptor
LOD descriptor
budget descriptor
```

## Optimization passes

```txt
pass 1: bottle silhouette
pass 2: glass material
pass 3: liquid fill state
pass 4: label texture
pass 5: glow and readability checks
```
