import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const replayManifest = JSON.parse(readFileSync("experiments/canonical-route-replay-manifest.json", "utf8"));
const laneContracts = JSON.parse(readFileSync("experiments/headless-lane-replay-contracts.json", "utf8"));

const routeReplay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === "signal-bastion");
const strategicLane = replayManifest.replayLanes.find((entry) => entry.id === "strategic-pressure-loop");
const strategicContract = laneContracts.contracts.find((entry) => entry.id === "strategic-pressure-loop");

assert.ok(routeReplay, "Signal Bastion should have a canonical route replay entry");
assert.ok(strategicLane, "strategic-pressure-loop replay lane should exist");
assert.ok(strategicContract, "strategic-pressure-loop lane contract should exist");

assert.equal(routeReplay.status, "protokit-covered", "Signal Bastion should remain ProtoKit-backed by generic-defense replay");
assert.equal(routeReplay.scenarioLane, "strategic-pressure-loop", "Signal Bastion should validate the strategic pressure lane");
assert.equal(strategicLane.coverageStatus, "protokit-covered", "strategic pressure replay lane should stay ProtoKit-covered");
assert.equal(strategicContract.executionStatus, "protokit-backed", "strategic pressure lane contract should stay ProtoKit-backed");

for (const surface of ["resources", "events", "methods", "snapshots", "descriptors"]) {
  assert.ok(Array.isArray(strategicContract.assertions?.[surface]), `strategic contract should list ${surface}`);
  assert.ok(strategicContract.assertions[surface].length > 0, `strategic contract should assert ${surface}`);
}

assert.ok(
  routeReplay.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-defense-dsk-boundaries-smoke.test.mjs"),
  "Signal Bastion replay entry should point at generic-defense DSK boundary smoke"
);
assert.ok(
  routeReplay.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-defense-replay-smoke.test.mjs"),
  "Signal Bastion replay entry should point at generic-defense deterministic replay"
);
assert.ok(
  routeReplay.missingExecutableFixtures.some((fixture) => fixture.includes("route-level bridge replay")),
  "the remaining Signal Bastion executable bridge replay gap should stay explicit"
);

const index = readFileSync("games/signal-bastion/index.html", "utf8");
const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const input = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");

assert.match(index, /<canvas id="game"/, "Signal Bastion browser route owns canvas presentation");
assert.match(index, /statStrip/, "Signal Bastion browser route owns HUD presentation nodes");

assert.match(boot, /createGenericDefenseKits/, "boot should compose generic-defense simulation from ProtoKits");
assert.match(boot, /createGenericDefensePresentationStackKits/, "boot should compose descriptor presentation from ProtoKits");
assert.match(boot, /engine\.tick\(0\)/, "boot should settle initial state through the runtime tick");
assert.match(boot, /engine\.tick\(dt\)/, "boot should advance simulation through runtime ticks");
assert.match(boot, /engine\.genericDefense\.getSnapshot\(\)/, "boot should expose generic-defense snapshots instead of local simulation state");
assert.match(boot, /engine\.defensePresentationStack\?\.getSnapshot\?\.\(\)/, "boot should prefer descriptor snapshots for presentation");
assert.match(boot, /rawSnapshot:\s*engine\.genericDefense\.getSnapshot\(\)/, "boot should fall back to a raw DSK snapshot, not browser-local state");
assert.match(boot, /requestAnimationFrame\(frame\)/, "browser frame scheduling should stay in the route host");
assert.match(boot, /performance\.now\(\)/, "browser timing should stay isolated in the route host");

assert.match(input, /engine\.placementProjector\?\.confirm\?\.\(/, "input host should bridge placement into semantic methods");
assert.match(input, /engine\.defenseWaves\?\.startWave\?\.\(/, "input host should bridge wave input into semantic methods");
assert.match(input, /engine\.defenseBuild\?\.upgrade\?\.\(/, "input host should bridge upgrade input into semantic methods");
assert.match(input, /engine\.genericDefense\.getSnapshot\(\)/, "input host should read snapshots rather than own simulation state");
assert.match(input, /renderer\.findHit\(.*presentation\(\)/s, "input host should hit-test against descriptors or snapshots from the renderer boundary");
assert.doesNotMatch(input, /createRealtimeGame|createGenericDefenseKits|requestAnimationFrame|performance\.now/, "input host should not own runtime creation or browser frame timing");

assert.match(renderer, /function draw\(presentation/, "renderer should draw from a presentation snapshot");
assert.match(renderer, /presentation\?\.rawSnapshot|rawSnapshot:/, "renderer should tolerate raw DSK snapshots");
assert.match(renderer, /presentation\.ui/, "renderer should consume UI descriptors");
assert.match(renderer, /renderStats/, "renderer should project stat descriptors into DOM only");
assert.match(renderer, /renderTowerPanel/, "renderer should project tower descriptors into DOM only");
assert.match(renderer, /renderContext/, "renderer should project context descriptors into DOM only");
assert.doesNotMatch(renderer, /createRealtimeGame|createGenericDefenseKits|engine\.tick|requestAnimationFrame|performance\.now/, "renderer should not own simulation, kit construction, or frame timing");

for (const source of [boot, input, renderer]) {
  assert.doesNotMatch(source, /Math\.random|Date\.now|crypto\.getRandomValues/, "Signal Bastion host files should avoid replay-breaking local randomness");
}

console.log("Signal Bastion replay bridge smoke passed.");
