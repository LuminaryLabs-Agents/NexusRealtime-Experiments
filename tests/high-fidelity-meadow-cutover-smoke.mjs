import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { games } from "../experiments/_shared/nexus-gallery-data.js";

function read(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const files = {
  main: read("../experiments/high-fidelity-meadow/src/main-aaa.js"),
  scene: read("../experiments/high-fidelity-meadow/src/meadow-experiment-scene.js"),
  procedural: read("../experiments/high-fidelity-meadow/src/procedural-renderers.js"),
  proceduralCutover: read("../experiments/high-fidelity-meadow/src/procedural-renderers-cutover.js"),
  terrain: read("../experiments/high-fidelity-meadow/src/aaa-terrain.js"),
  terrainCutover: read("../experiments/high-fidelity-meadow/src/aaa-terrain-cutover.js")
};

for (const [label, text] of Object.entries(files)) {
  assert.equal(text.includes("rendering-stack-kits"), false, `${label} should not import legacy rendering-stack-kits`);
  assert.equal(text.includes("76c4a381"), false, `${label} should not pin the legacy ProtoKits commit`);
}

assert.ok(files.scene.includes("NexusRealtime-ProtoKits@0.0.2/protokits/high-fidelity-meadow-kits/index.js"));
assert.ok(files.scene.includes("experimentOwns"));
assert.ok(files.scene.includes("protoKitsUsed"));
assert.ok(files.scene.includes("createTerrainFieldDomainServiceKit"));
assert.ok(files.scene.includes("createCreatureDomainServiceKit"));
assert.ok(files.scene.includes("createFurWoolHairDomainServiceKit"));
assert.ok(files.main.includes("createExperimentMeadowKit"));

assert.equal(games.length, 21, "gallery should preserve the canonical 21-route contract");
assert.ok(games.some((game) => game.id === "high-fidelity-meadow"), "gallery should include the High Fidelity Meadow rendering route");
assert.ok(games.every((game) => !game.id.startsWith("aaa-")), "canonical gallery should not expose generated AAA registry ids directly");

console.log(`High Fidelity Meadow cutover smoke passed with ${games.length} canonical gallery entries.`);
