import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const v2Root = join(root, "experiments", "the-open-above-v2");
const canonicalRoot = join(root, "experiments", "the-open-above-harness");
const html = readFileSync(join(v2Root, "index.html"), "utf8");
const canonicalHtml = readFileSync(join(canonicalRoot, "index.html"), "utf8");
const config = readFileSync(join(v2Root, "open-above-v2.config.js"), "utf8");
const script = readFileSync(join(v2Root, "open-above-v2.js"), "utf8");
const combined = `${html}\n${canonicalHtml}\n${config}\n${script}`;

assert.ok(existsSync(join(canonicalRoot, "index.html")), "canonical Open Above harness route should exist.");
assert.match(canonicalHtml, /\.\.\/the-open-above-v2\/open-above-v2\.js/, "canonical harness should load the V2 harness implementation.");
assert.match(html, /open-above-v2\.js/, "V2 shell should load the V2 harness module.");
assert.match(config, /id:\s*"the-open-above-v2"/, "V2 config should use a separate implementation id.");
assert.match(config, /controlResponseMode:\s*"direct"/, "V2 should use direct assisted flight response.");
assert.match(config, /sinkRateLimit:\s*-72/, "V2 should allow commanded pitch-down swoops.");
assert.match(script, /function buildKits/, "V2 should expose a clear kit composition boundary.");
assert.match(script, /createFlightMotionKit/, "V2 should compose generic flight motion directly.");
assert.match(script, /createTerrainSamplerKit/, "V2 should compose generic terrain sampling directly.");
assert.match(script, /createWorldPatchKit/, "V2 should compose generic world patch streaming directly.");
assert.match(script, /skyDome\.position\.copy\(camera\.position\)/, "V2 skybox should stay camera-relative.");
assert.match(script, /window\.GameHostV2/, "V2 should expose a dedicated harness host.");
assert.match(script, /compositionalHarness:\s*true/, "V2 validation should identify itself as a compositional harness.");
assert.doesNotMatch(combined, /makeHeuristicInput/, "V2 should not carry the old heuristic autopilot loop.");
assert.doesNotMatch(combined, /OpenAboveFlightData|createOpenAboveFlightGame|createOpenAboveFlightKits/, "V2 should not import branded flight presets.");

console.log("The Open Above V2 static smoke passed.");
