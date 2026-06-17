import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = "experiments/nexus-frontier-signal-isles";
const index = readFileSync(`${base}/index.html`, "utf8");
const main = readFileSync(`${base}/src/main.js`, "utf8");
const renderer = readFileSync(`${base}/src/renderer.js`, "utf8");
const debugHost = readFileSync(`${base}/src/debug-host.js`, "utf8");
const composition = readFileSync(`${base}/src/game-composition.js`, "utf8");

assert.ok(index.includes("<main"), "Signal Isles route should use semantic main");
assert.ok(index.includes('id="game"'), "Signal Isles route should expose the game canvas");
assert.ok(index.includes('src="./src/main.js"'), "Signal Isles route should load the module entrypoint");
assert.ok(index.includes('id="status"') && index.includes('id="controls"'), "Signal Isles should keep a tiny two-element HUD");
assert.ok(!index.includes("sidebar") && !index.includes("dashboard"), "Signal Isles should not add dashboard UI");

for (const method of ["getState", "getKitStates", "getRecentEvents", "getSequenceState", "getObjectiveState", "getInputState", "getLastRejection", "getReplaySnapshot", "tick", "reset", "start", "stop"]) {
  assert.ok(debugHost.includes(`${method}(`), `debug host should expose ${method}`);
}

assert.ok(main.includes("window.GameHost"), "main should expose window.GameHost");
assert.ok(composition.includes("createRealtimeGame"), "composition should retain the NexusRealtime composition marker");
assert.ok(composition.includes("createActionInputKit"), "composition should retain action-input-kit marker");
assert.ok(composition.includes("createScanSurveyKit"), "composition should retain scan-survey-kit marker");
assert.ok(composition.includes("createTimedPressureDirectorKit"), "composition should retain timed-pressure marker");
assert.ok(composition.includes("createGamehostStandardKit"), "composition should retain gamehost-standard marker");
assert.ok(!renderer.includes("completedFacts.push"), "renderer must not mutate completion facts");
assert.ok(!renderer.includes("objectiveIndex"), "renderer must not own objective progression");
assert.ok(!renderer.includes("engine."), "renderer should not call engine APIs");

console.log("Signal Isles static smoke passed.");
