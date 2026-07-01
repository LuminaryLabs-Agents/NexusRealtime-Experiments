# The Cavalry of Rome

A NexusRealtime visual experiment for a Roman campaign-map cinematic route.

This slice intentionally drops campaign/combat business logic. It is a **DSK-composed high-fidelity visual proof**: a WebGPU-first realistic 3D terrain scene with large pannable highlighted regions, a procedural vegetation population pass, a cinematic dive, and a primitive-built battlefield tableau where two armies prepare for war.

## Current slice

- WebGPU-first realistic terrain renderer with Canvas fallback.
- Larger campaign terrain surface with pannable region selection.
- Realistic terrain layers: domain-warped landforms, FBM/ridged noise, blended biome colors, river/moisture/slope masks, brush-stroke overlays, river ribbons, and contour accents.
- Procedural vegetation overlay with deterministic grass, reeds, shrubs, flowers, rocks, and tree groves.
- Local procedural vegetation DSK candidate exposes renderer-neutral placement descriptors and patches `GameHost` snapshots with vegetation metadata.
- Large highlighted land regions instead of point nodes.
- Pointer hover selects visual affordance regions.
- Drag/WASD pans the main region-selection map; wheel zooms the map.
- Clicking a region triggers a cinematic world-map-to-battlefield zoom.
- Battlefield reveal shows fuller primitive-built soldiers: legs, boots, torso, cuirass, arms, head, helmet, crest, shield, spear, capes, banners, and shadows.
- Existing DSKs provide route progress, input, affordance descriptors, zone fields, camera descriptors, visual fidelity proof, scenario QA, and GameHost contract state.
- Visible HUD/footer/control UI has been removed from the in-game presentation. Hidden DOM hooks remain only so runtime status writes do not break.

## Active modules

```txt
src/main-realistic.js
src/vegetation-pass.js
```

## Existing DSKs used

```txt
gamehost-standard-kit
action-input-kit
generic-affordance-descriptor-kit
generic-route-progress-kit
zone-field-kit
camera-cinematic-maker-kit
visual-fidelity-maker-kit
scenario-qa-harness
```

There is no dedicated procedural vegetation ProtoKit in the currently searched ProtoKits repo, so this route keeps vegetation generation local as a renderer-neutral DSK candidate. The overlay renderer only presents descriptors; the custom descriptor field is documented for future extraction.

## Controls

```txt
Move pointer over a highlighted terrain region
Click a region to start the cinematic dive
Drag empty terrain to pan the map
WASD / arrow keys pan the map
Mouse wheel zooms the map
R resets to the world-map scan
```

These controls are intentionally undocumented on screen during play. The current game presentation is canvas-only.

## Fidelity rule

Every future gameplay iteration should also improve visual fidelity as a secondary goal. Do not regress terrain density, vegetation, lighting mood, region readability, soldier fidelity, or cinematic composition while adding mechanics.

## Gameplay-first next step

The first gameplay-readiness step is now complete:

```txt
remove visible in-game UI
keep canvas-only presentation
preserve DSK/GameHost debug surfaces invisibly
```

The next gameplay steps can add interaction through the scene itself rather than through panels, buttons, labels, or HUD widgets.

## Fidelity focus

The current fidelity push is visual, not systemic:

```txt
realistic non-repeating terrain
large readable regions
pannable terrain inspection
procedural grass / reeds / shrubs / flowers / rocks / trees
primitive full-bodied soldiers
atmospheric battlefield reveal
```

No combat, troop stats, campaign economy, AI, harvesting, collision, or encounter resolution should be added until the visual proof is stable.

## Design boundary

This route should stay clear of board-game-specific expression. Do not import or mirror card systems, hex counts, dice faces, named scenarios, board layouts, copied rules text, or unit-stat tables from any existing tabletop game.

The near-term target is cinematic visual quality, not strategy rules. Keep combat, troop stats, economy, movement graphs, and encounter resolution out until the visual route has a stable DSK-backed boundary.

## Custom logic that could become reusable later

```txt
campaign-terrain-visual-kit
painterly-terrain-material-kit
terrain-region-highlight-kit
pannable-campaign-camera-kit
procedural-vegetation-field-kit
biome-vegetation-descriptor-kit
wind-sway-visual-descriptor-kit
map-to-scene-camera-transition-kit
low-poly-formation-tableau-kit
primitive-soldier-construction-kit
webgpu-visual-scene-adapter-kit
battlefield-atmosphere-descriptor-kit
```

## Next ledge

Add a browser-backed route smoke that opens the live endpoint, verifies no visible HUD/footer surfaces are present, pans the map, validates `proceduralVegetation` counts from `GameHost.getSnapshot()`, selects a large region, waits for the battlefield tableau, and verifies the vegetation overlay remains presentation-only.
