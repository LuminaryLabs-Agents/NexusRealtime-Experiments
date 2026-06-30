import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("experiments/The Cavalry of Rome/src/main.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
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
assert.ok(main.includes("PAINTERLY_TERRAIN_STYLE"), "Cavalry should expose painterly terrain fidelity metadata");
assert.ok(main.includes("MAP_EXTENTS"), "Cavalry should define a larger map extent");
assert.ok(main.includes("mapPan"), "Cavalry should expose pan state");
assert.ok(main.includes("wheel"), "Cavalry should support wheel zoom for the map");
assert.ok(main.includes("pushPrimitiveSoldier"), "Cavalry should build primitive full-bodied soldiers");
assert.ok(main.includes("pushBox"), "Cavalry soldiers should be constructed from reusable primitive body parts");
assert.ok(main.includes("FULL_BODY_PRIMITIVE_STYLE"), "Cavalry should expose full-body primitive soldier fidelity metadata");
assert.ok(main.includes("low-poly"), "Cavalry should preserve low-poly battlefield visual descriptors");

assert.ok(endpoint.includes("../../experiments/The%20Cavalry%20of%20Rome/src/main.js"), "live endpoint should load the Cavalry experiment module");
assert.ok(endpoint.includes("Live NexusRealtime endpoint for The Cavalry of Rome"), "live endpoint should identify the route");
assert.ok(gallery.includes('id: "the-cavalry-of-rome"'), "gallery should expose Cavalry by id");
assert.ok(gallery.includes('route: "./apps/the-cavalry-of-rome/"'), "gallery should point to the live app endpoint");

assert.equal(plan.canonicalRouteClaim, false, "Cavalry should not claim canonical route status yet");
assert.equal(plan.deterministicReplayClaim, false, "Cavalry should not claim deterministic replay yet");
assert.equal(plan.fidelityFocus.mapNavigation.includes("pannable"), true, "domain plan should record pannable map navigation");
assert.equal(plan.fidelityFocus.soldiers.includes("full-bodied primitive soldiers"), true, "domain plan should record full-bodied primitive soldiers");
assert.ok(plan.intentionallyOmitted.includes("combat rules"), "combat should remain intentionally omitted");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "painterly-terrain-material-kit"), "painterly terrain material should be mapped to a future DSK candidate");
assert.ok(plan.futureProtoKitCandidatesFromCustomLogic.some((entry) => entry.id === "primitive-soldier-construction-kit"), "primitive soldier construction should be mapped to a future DSK candidate");

console.log("Cavalry of Rome visual DSK static smoke passed.");
