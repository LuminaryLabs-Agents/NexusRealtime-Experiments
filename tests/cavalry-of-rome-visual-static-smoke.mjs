import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("experiments/The Cavalry of Rome/src/main-realistic.js", "utf8");
const vegetation = readFileSync("experiments/The Cavalry of Rome/src/vegetation-pass.js", "utf8");
const hexBattlefield = readFileSync("experiments/The Cavalry of Rome/src/hex-battlefield-pass.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");
const gallery = readFileSync("experiments/_shared/nexus-gallery-data.js", "utf8");
const plan = JSON.parse(readFileSync("experiments/The Cavalry of Rome/domain-plan.json", "utf8"));

const requiredDskImports = [
  "action-input-kit",
  "generic-route-progress-kit",
  "generic-affordance-descriptor-kit",
  "zone-field-kit",
  "camera-cinematic-maker-kit",
  "visual-fidelity-maker-kit",
  "gamehost-standard-kit",
  "scenario-qa-harness"
];

for (const dsk of requiredDskImports) {
  assert.ok(main.includes(`/protokits/${dsk}/index.js`), `Cavalry visual route should import ${dsk}`);
  assert.ok(plan.existingDskStack.includes(dsk), `domain-plan should list ${dsk}`);
}

assert.ok(main.includes("navigator.gpu"), "Cavalry should attempt a WebGPU renderer path");
assert.ok(main.includes("CanvasFallbackRenderer"), "Cavalry should keep a Canvas fallback");
assert.ok(main.includes("makeRegionOverlayVertices"), "Cavalry should use highlighted region overlays instead of point nodes");
assert.ok(main.includes("makePainterlyStrokeVertices"), "Cavalry should add painterly brush/contour overlays");
assert.ok(main.includes("valueNoise2D"), "Cavalry should use non-repeating value noise");
assert.ok(main.includes("fbmNoise"), "Cavalry should use multi-octave FBM terrain noise");
assert.ok(main.includes("ridgedNoise"), "Cavalry should use ridged terrain noise");
assert.ok(main.includes("domainWarp"), "Cavalry should domain-warp terrain samples");
assert.ok(main.includes("biomeColorBlend"), "Cavalry should blend biome colors naturally");
assert.ok(main.includes("REALISTIC_TERRAIN_STYLE"), "Cavalry should expose realistic terrain fidelity metadata");
assert.ok(main.includes("nonRepeatingLandforms"), "Cavalry should expose non-repeating landform metadata");
assert.ok(main.includes("MAP_EXTENTS"), "Cavalry should define a larger map extent");
assert.ok(main.includes("mapPan"), "Cavalry should expose pan state");
assert.ok(main.includes("wheel"), "Cavalry should support wheel zoom for the map");
assert.ok(main.includes("pushPrimitiveSoldier"), "Cavalry should build primitive full-bodied soldiers");
assert.ok(main.includes("pushBox"), "Cavalry soldiers should be constructed from reusable primitive body parts");
assert.ok(main.includes("FULL_BODY_PRIMITIVE_STYLE"), "Cavalry should expose full-body primitive soldier fidelity metadata");

assert.ok(vegetation.includes("VEGETATION_DSK_ID"), "vegetation pass should expose a local procedural vegetation DSK candidate id");
assert.ok(vegetation.includes("createVegetationDescriptorField"), "vegetation pass should create a renderer-neutral descriptor field");
assert.ok(vegetation.includes("createVegetationInstances"), "vegetation pass should create deterministic vegetation instances");
assert.ok(vegetation.includes("vegetationDensityForSample"), "vegetation pass should derive density from biome terrain conditions");
assert.ok(vegetation.includes("CavalryVegetationProceduralDsk"), "vegetation pass should expose a procedural vegetation DSK-style surface");
assert.ok(vegetation.includes("proceduralVegetation"), "vegetation pass should patch GameHost snapshots with vegetation state");
assert.ok(vegetation.includes("grass"), "vegetation pass should include grass descriptors");
assert.ok(vegetation.includes("tree"), "vegetation pass should include tree descriptors");
assert.ok(vegetation.includes("reed"), "vegetation pass should include river reed descriptors");
assert.ok(vegetation.includes("windResponse"), "vegetation pass should include visual-only wind response metadata");
assert.ok(vegetation.includes("VEGETATION_PRESENTATION"), "vegetation pass should expose presentation mode");
assert.ok(vegetation.includes("metadata-only-until-terrain-anchored-instancing"), "vegetation should remain metadata-only until terrain anchoring is real");
assert.ok(vegetation.includes("disabledScreenSpaceRendering"), "vegetation pass should disable screen-space drawing to prevent sky floating");
assert.ok(!vegetation.includes("requestAnimationFrame(drawVegetationFrame)"), "vegetation pass should not continuously draw a screen-space overlay");
assert.ok(!vegetation.includes("cavalry-procedural-vegetation-overlay"), "vegetation pass should not create the old floating overlay canvas");

assert.ok(hexBattlefield.includes("createHexBattlefield"), "hex pass should create a battlefield grid");
assert.ok(hexBattlefield.includes("HEX_GRID"), "hex pass should define grid size");
assert.ok(hexBattlefield.includes("TERRAIN_TYPES"), "hex pass should define terrain types");
assert.ok(hexBattlefield.includes("water"), "hex pass should include water tiles");
assert.ok(hexBattlefield.includes("hill"), "hex pass should include hill tiles");
assert.ok(hexBattlefield.includes("fence"), "hex pass should include fence tiles");
assert.ok(hexBattlefield.includes("CLASS_COLORS"), "hex pass should define troop class colors");
assert.ok(hexBattlefield.includes("BAND_COLORS"), "hex pass should define army band colors");
assert.ok(hexBattlefield.includes("UNIT_COUNTS"), "hex pass should define aggregated unit counts");
assert.ok(hexBattlefield.includes("CavalryHexBattlefieldActive"), "hex pass should expose active state for overlay grounding");
assert.ok(hexBattlefield.includes("fixed-pointy-offset"), "hex pass should expose fixed aligned grid math");
assert.ok(hexBattlefield.includes("SQRT3"), "hex pass should use regular pointy hex spacing");
assert.ok(hexBattlefield.includes("HEX_Y_SCALE"), "hex pass should use a consistent y-scale instead of per-row size drift");
assert.ok(hexBattlefield.includes("unit?.army === \"rome\" ? unit.id : null"), "hex pass should only hover/select Rome-side units");
assert.ok(hexBattlefield.includes("selectableArmy: \"rome\""), "hex pass should expose Rome as the selectable army");
assert.ok(hexBattlefield.includes("getHexBattlefieldSnapshot"), "hex pass should expose a GameHost battlefield snapshot");
assert.ok(hexBattlefield.includes("rome-perspective-hex-battlefield-no-ui"), "hex pass should document the Rome-perspective no-UI view");
assert.ok(hexBattlefield.includes("webgl2-shaded-layered-hex-interiors"), "hex pass should document WebGL2 shaded interiors");
assert.ok(hexBattlefield.includes("getContext(\"webgl2\""), "hex pass should request a WebGL2 context");
assert.ok(hexBattlefield.includes("compileShader"), "hex pass should compile custom shaders");
assert.ok(hexBattlefield.includes("#version 300 es"), "hex pass should use GLSL ES 3.00 shaders");
assert.ok(hexBattlefield.includes("fbm(vec2 p)"), "hex shader should use procedural FBM detail");
assert.ok(hexBattlefield.includes("hexEdge"), "hex shader should use hex edge/rim calculations");
assert.ok(hexBattlefield.includes("terrainBase"), "hex shader should shade terrain by terrain class");
assert.ok(hexBattlefield.includes("ripple"), "hex shader should include water ripple detail");
assert.ok(hexBattlefield.includes("contour"), "hex shader should include hill contour detail");
assert.ok(hexBattlefield.includes("rail"), "hex shader should include fence rail detail");
assert.ok(hexBattlefield.includes("canvas2d-fallback-tiles"), "hex pass should fall back to Canvas2D if WebGL2 is unavailable");

assert.ok(endpoint.includes("../../experiments/The%20Cavalry%20of%20Rome/src/main-realistic.js"), "live endpoint should load the realistic Cavalry module");
assert.ok(endpoint.includes("../../experiments/The%20Cavalry%20of%20Rome/src/vegetation-pass.js"), "live endpoint should load the procedural vegetation pass");
assert.ok(endpoint.includes("../../experiments/The%20Cavalry%20of%20Rome/src/hex-battlefield-pass.js"), "live endpoint should load the hex battlefield pass");
assert.ok(endpoint.includes("CavalryUiSinkShim"), "live endpoint should provide non-DOM status sinks for runtime compatibility");
assert.ok(!endpoint.includes('id="hud"'), "live endpoint should not contain HUD DOM");
assert.ok(!endpoint.includes('id="footer"'), "live endpoint should not contain footer DOM");
assert.ok(!endpoint.includes('id="commandBar"'), "live endpoint should not contain command bar DOM");
assert.ok(!endpoint.includes("#hud,#footer,#commandBar"), "live endpoint should not hide UI with CSS because UI DOM should be removed");
assert.ok(!endpoint.includes("attachNexusRealtimePageLoader"), "live endpoint should not attach shared page-loader UI");
assert.ok(!endpoint.includes("nexus-realtime-page-loader.js"), "live endpoint should not import shared page-loader UI");
assert.ok(!endpoint.includes("Procedural vegetation pass: WASD/drag pan"), "live endpoint should not show visible instruction footer text");
assert.ok(endpoint.includes("Live NexusRealtime endpoint for The Cavalry of Rome"), "live endpoint should identify the route");
assert.ok(experimentEntry.includes("./src/main-realistic.js"), "experiment entry should load the realistic Cavalry module");
assert.ok(experimentEntry.includes("./src/vegetation-pass.js"), "experiment entry should load the procedural vegetation pass");
assert.ok(experimentEntry.includes("./src/hex-battlefield-pass.js"), "experiment entry should load the hex battlefield pass");
assert.ok(experimentEntry.includes("CavalryUiSinkShim"), "experiment entry should provide non-DOM status sinks for runtime compatibility");
assert.ok(!experimentEntry.includes('id="hud"'), "experiment entry should not contain HUD DOM");
assert.ok(!experimentEntry.includes('id="footer"'), "experiment entry should not contain footer DOM");
assert.ok(!experimentEntry.includes('id="commandBar"'), "experiment entry should not contain command bar DOM");
assert.ok(!experimentEntry.includes("attachNexusRealtimePageLoader"), "experiment entry should not attach shared page-loader UI");
assert.ok(!experimentEntry.includes("nexus-realtime-page-loader.js"), "experiment entry should not import shared page-loader UI");
assert.ok(gallery.includes('id: "the-cavalry-of-rome"'), "gallery should expose Cavalry by id");
assert.ok(gallery.includes('route: "./apps/the-cavalry-of-rome/"'), "gallery should point to the live app endpoint");

assert.equal(plan.canonicalRouteClaim, false, "Cavalry should not claim canonical route status yet");
assert.equal(plan.deterministicReplayClaim, false, "Cavalry should not claim deterministic replay yet");
assert.equal(plan.fidelityFocus.mapNavigation.includes("pannable"), true, "domain plan should record pannable map navigation");
assert.equal(plan.fidelityFocus.soldiers.includes("full-bodied primitive soldiers"), true, "domain plan should record full-bodied primitive soldiers");
assert.ok(plan.fidelityFocus.proceduralVegetation, "domain plan should record procedural vegetation fidelity");
assert.ok(plan.intentionallyOmitted.includes("combat rules"), "combat should remain intentionally omitted");
assert.ok(plan.intentionallyOmitted.includes("visible HUD"), "visible HUD should remain intentionally omitted");
assert.ok(plan.intentionallyOmitted.includes("hidden HUD DOM"), "hidden HUD DOM should remain intentionally omitted");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "painterly-terrain-material-kit"), "painterly terrain material should be mapped to a future DSK candidate");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "primitive-soldier-construction-kit"), "primitive soldier construction should be mapped to a future DSK candidate");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "procedural-vegetation-field-kit"), "procedural vegetation should be mapped to a future DSK candidate");

console.log("Cavalry of Rome visual DSK static smoke passed.");
