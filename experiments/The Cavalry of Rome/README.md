# The Cavalry of Rome

A NexusRealtime visual experiment for a Roman campaign-map cinematic route.

This slice intentionally drops campaign/combat resolution while adding the first tactical gameplay surface. It is a **DSK-composed high-fidelity visual proof**: a WebGPU-first realistic 3D terrain scene with large pannable highlighted regions, a procedural vegetation population pass, a cinematic dive, and a no-UI Rome-perspective hex battlefield.

## Current slice

- WebGPU-first realistic terrain renderer with Canvas fallback.
- Larger campaign terrain surface with pannable region selection.
- Realistic terrain layers: domain-warped landforms, FBM/ridged noise, blended biome colors, river/moisture/slope masks, brush-stroke overlays, river ribbons, and contour accents.
- Procedural vegetation overlay with deterministic grass, reeds, shrubs, flowers, rocks, and tree groves on the world map.
- Large highlighted land regions instead of point nodes.
- Pointer hover selects visual affordance regions.
- Drag/WASD pans the main region-selection map; wheel zooms the map.
- Clicking a region triggers a cinematic world-map-to-battlefield zoom.
- The battlefield is now an 11x9 no-UI hex grid viewed from above and behind Rome.
- Hex terrain includes grass, water, hills, and fences with movement/defense metadata.
- Tactical units are aggregated troop markers, not individual soldier swarms.
- Light troops are green, medium troops are blue, and heavy troops are red. Army ownership is shown as a band color.
- Rome uses a red army band; enemies use region-based bands.
- The hex pass disables the screen-space vegetation overlay during tactical battle so plants cannot float above the battlefield.
- All in-game UI DOM has been removed from the presentation. The live and experiment pages now contain only the canvas app root plus non-visual scripts.
- A non-DOM `CavalryUiSinkShim` supplies status/readout/command sinks for current runtime compatibility without adding HUD/footer/command elements back to the DOM.
- The shared route page loader is intentionally not attached for this route so no loading UI appears over the game.

## Active modules

```txt
src/main-realistic.js
src/vegetation-pass.js
src/hex-battlefield-pass.js
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

There is no dedicated procedural vegetation or hex battlefield ProtoKit in the currently searched ProtoKits repo, so this route keeps those systems local as renderer-neutral DSK candidates. The visual surfaces expose snapshots through `GameHost` and remain documented for future extraction.

## Controls

```txt
World map:
Move pointer over a highlighted terrain region
Click a region to start the cinematic dive
Drag empty terrain to pan the map
WASD / arrow keys pan the map
Mouse wheel zooms the map
R resets to the world-map scan

Hex battlefield:
Move pointer over a hex or unit to highlight it
Click a unit to select it
```

These controls are intentionally undocumented on screen during play. The current game presentation is canvas-only with no HUD, footer, command bar, labels, panels, hidden UI DOM, or shared loading overlay.

## Fidelity rule

Every future gameplay iteration should also improve visual fidelity as a secondary goal. Do not regress terrain density, vegetation, lighting mood, region readability, soldier fidelity, hex readability, or cinematic composition while adding mechanics.

## Gameplay state

Completed:

```txt
remove visible UI
remove hidden UI DOM
remove shared loading overlay UI
keep canvas-only presentation
preserve DSK/GameHost debug surfaces through non-DOM sinks
add Rome-perspective hex battlefield after region selection
compress battlefield soldiers into 22 aggregated units
add water/hill/fence/grass terrain tiles
prevent floating vegetation during hex battle
```

Next gameplay steps should add interaction through the scene itself rather than through panels, buttons, labels, or HUD widgets.

## Troop color language

```txt
light: green body
medium: blue body
heavy: red body
Rome band: red
Enemy band: varies by selected region
```

## Fidelity focus

The current fidelity push is visual, not systemic:

```txt
realistic non-repeating terrain
large readable regions
pannable terrain inspection
procedural grass / reeds / shrubs / flowers / rocks / trees on the world map
terrain-anchored visual features on tactical hexes
aggregated troop markers with soldier clusters
atmospheric battlefield reveal
```

No combat resolution, campaign economy, AI turns, harvesting, collision, or full movement pathfinding should be added until the hex playfield is stable.

## Design boundary

This route should stay clear of board-game-specific expression. Do not import or mirror card systems, hex counts, dice faces, named scenarios, board layouts, copied rules text, or unit-stat tables from any existing tabletop game.

The near-term target is cinematic visual quality and scene-native gameplay foundations, not a copied board-game system.

## Custom logic that could become reusable later

```txt
hex-battlefield-grid-kit
hex-terrain-descriptor-kit
tactical-army-formation-kit
troop-class-visual-kit
terrain-anchored-vegetation-kit
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

Add scene-native unit movement on the hex board with terrain movement costs and no visible UI, while improving battlefield visual fidelity in the same iteration.
