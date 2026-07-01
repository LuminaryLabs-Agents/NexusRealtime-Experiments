# The Cavalry of Rome

A NexusRealtime visual experiment for a Roman campaign-map cinematic route.

This slice now has the first tactical gameplay loop. It remains a **DSK-composed high-fidelity visual proof**: a WebGPU-first realistic campaign terrain, a Rome-perspective WebGL2 hex battlefield, mini low-poly squad units, scene-native maneuver highlights, WebGL-shaded dice rolls on the board, and a native bottom action-card UI for tactical commands.

## Current slice

- WebGPU-first realistic terrain renderer with Canvas fallback.
- Larger campaign terrain surface with pannable region selection.
- Realistic terrain layers: domain-warped landforms, FBM/ridged noise, blended biome colors, river/moisture/slope masks, brush-stroke overlays, river ribbons, and contour accents.
- Procedural vegetation descriptors are generated deterministically, but the old screen-space vegetation renderer is disabled because it could float in the sky and cause panning/selection jank.
- Large highlighted land regions instead of point nodes.
- Pointer hover selects visual affordance regions.
- Drag/WASD pans the main region-selection map; wheel zooms the map.
- Clicking a region triggers a cinematic world-map-to-battlefield zoom.
- The battlefield is an 11x9 hex grid viewed from above and behind Rome.
- Hex interiors use a WebGL2 material shader with procedural FBM, rim/bevel shading, water shimmer, hill contouring, grass striations, and fence rail/post detail.
- Tactical gameplay includes seven maneuvers: Advance Left, Advance Center, Advance Right, Line Brigade, Heavy Brigade, Berserk, and Scout.
- A bottom native card UI appears during hex battle with all available maneuver cards, a Roll AP card, and an action point counter.
- Roll AP is a dedicated in-place 2d6 roll that updates action points and shows board dice without starting a maneuver or moving a unit.
- Action points are rolled with 2d6 every three turns, and can also be rolled manually with Roll AP while no maneuver is active.
- Advance maneuvers cost 1 AP, Line Brigade costs 2 AP, Heavy Brigade costs 3 AP, and Berserk/Scout cost 4 AP.
- Advance maneuvers roll 1d6 and allow that many eligible units to move.
- Movement is scene-native: select a Rome unit, then click a highlighted reachable hex.
- Water is impassable. Hills and fences are legal landing spaces but end the maneuver when entered.
- Light troops can move up to two spaces during normal movement; Scout moves one unit up to three spaces; Berserk moves one unit up to two spaces and can attack an adjacent enemy.
- The board rolls use a shaded dice pass with crypto-backed d6 randomization when available.
- Tactical units are mini squads of low-poly soldiers instead of circular tokens.
- Light troops are green, medium troops are blue, and heavy troops are red. Army ownership is shown only through military bands and small pennants.
- Circular unit bases and selection rings have been removed. Selection uses squad lift, brightness, individual angled shadows, leader pennants, and hex highlighting.
- Only Rome-side units are selectable. Enemy pieces remain visible but cannot be selected.
- Old HUD/footer/commandBar DOM remains removed. The action UI is a dedicated battlefield-only bottom card bar, not the previous debug HUD.

## Active modules

```txt
src/main-realistic.js
src/vegetation-pass.js
src/hex-battlefield-pass.js
src/hex-squad-visual-pass.js
src/hex-gameplay-pass.js
src/hex-action-ui-pass.js
src/hex-roll-controller-pass.js
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

There is no dedicated procedural vegetation, hex battlefield, maneuver gameplay, action-card UI, or roll controller ProtoKit in the currently searched ProtoKits repo, so these systems remain local as renderer-neutral DSK candidates. The visual and gameplay surfaces expose snapshots through `GameHost` and remain documented for future extraction.

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
Click Roll AP to roll 2d6 in place
0 = Roll AP
Click a maneuver card at the bottom of the screen
1 = Advance Left
2 = Advance Center
3 = Advance Right
4 = Line Brigade
5 = Heavy Brigade
6 = Berserk
7 = Scout
Click a Rome unit to select it
Click a highlighted hex to move selected unit
Click a highlighted enemy after Berserk movement to attack
Escape clears current selection
```

## Maneuver costs

```txt
Roll AP: 0 AP, roll 2d6 in place
Advance Left / Center / Right: 1 AP, roll 1d6 units
Line Brigade: 2 AP, move a connected adjacent group
Heavy Brigade: 3 AP, move all Rome heavy units
Berserk: 4 AP, move one unit up to two spaces and attack
Scout: 4 AP, move one unit up to three spaces
Action points: roll 2d6 every three turns or with Roll AP while idle
```

## Fidelity rule

Every future gameplay iteration should also improve visual fidelity as a secondary goal. Do not regress terrain density, vegetation descriptors, lighting mood, region readability, soldier fidelity, hex readability, dice feedback, maneuver highlights, action-card polish, or cinematic composition while adding mechanics.

## Gameplay state

Completed:

```txt
remove legacy HUD/footer/command UI
keep canvas-first presentation
preserve DSK/GameHost debug surfaces through non-DOM sinks
add Rome-perspective hex battlefield after region selection
fix hex alignment using fixed pointy-offset spacing
add WebGL2 procedural terrain materials inside hexes
replace circular unit tokens with mini low-poly soldier squads
remove circular unit bases and selection rings
add individual angled soldier shadows
add seven tactical maneuvers
add 2d6 action point cadence
add explicit Roll AP card for in-place action point rolls
add 1d6 advance rolls with shaded board dice
add movement highlights and Rome-only selection
add water/hill/fence movement restrictions
add basic Berserk attack target handling
add native bottom card action UI with AP counter
```

## Troop color language

```txt
light: green body
medium: blue body
heavy: red body
Rome band: red
Enemy band: varies by selected region
```

## Fidelity focus

The current fidelity push is visual and tactical:

```txt
realistic non-repeating terrain
large readable regions
pannable terrain inspection
procedural vegetation descriptors without floating screen-space rendering
WebGL2-shaded hex interiors
scene-native movement highlights
shaded board dice
mini low-poly soldier squads without token rings
individual angled soldier shadows
native bottom card action UI
atmospheric battlefield reveal
```

Full combat resolution, campaign economy, AI turns, harvesting, collision, and complete pathfinding polish should wait until this maneuver loop is validated in browser.

## Design boundary

This route should stay clear of board-game-specific expression. Do not import or mirror card systems, hex counts, dice faces, named scenarios, board layouts, copied rules text, or unit-stat tables from any existing tabletop game.

The near-term target is cinematic visual quality and scene-native gameplay foundations, not a copied board-game system.

## Custom logic that could become reusable later

```txt
hex-battlefield-grid-kit
hex-terrain-descriptor-kit
hex-webgl-material-shader-kit
hex-squad-visual-kit
hex-maneuver-gameplay-kit
hex-action-card-ui-kit
hex-roll-controller-kit
webgl-board-dice-kit
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

Validate Roll AP, maneuver start, movement, and bottom action cards in a browser, then add enemy turn behavior and fuller combat resolution while preserving the card UI polish and improving battlefield visuals in the same iteration.
