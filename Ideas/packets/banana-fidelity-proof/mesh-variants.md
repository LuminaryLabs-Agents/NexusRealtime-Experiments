# Mesh Variants

## Variant targets

```txt
LOD0: curved banana mesh with full silhouette
LOD1: reduced curve segments, preserved end shape
LOD2: simplified crescent silhouette for distance
```

## Mesh checks

- silhouette still reads as banana
- end caps remain rounded
- curve is stable across generations
- normals do not create harsh seams
- triangle count is measurable per LOD
