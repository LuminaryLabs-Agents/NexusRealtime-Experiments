import assert from "node:assert/strict";
import { signalIslesLevel01 } from "../experiments/nexus-frontier-signal-isles/src/level-01.js";
import { createSignalIslesReplayDigest, runSignalIslesScenario, signalIslesDefaultScenarioActions } from "../experiments/nexus-frontier-signal-isles/src/scenario-harness.js";

const earlyBuild = runSignalIslesScenario([{ type: "build", siteId: "build-site-01" }], signalIslesLevel01);
assert.equal(earlyBuild.lastRejection.reason, "missing-resource", "building without shards should reject with missing-resource");

const completed = runSignalIslesScenario(signalIslesDefaultScenarioActions, signalIslesLevel01);
assert.equal(completed.completed, true, "default scenario should complete the final beacon");
for (const fact of ["scan.ruin.01", "resource.node.01", "build.signal-mast.01", "pressure.wave.01.survived", "lock.gate.01", "route.checkpoint.01", "cargo.delivered.01", "final.beacon.activated"]) {
  assert.ok(completed.completedFacts.includes(fact), `scenario should record ${fact}`);
}

const first = runSignalIslesScenario(signalIslesDefaultScenarioActions, signalIslesLevel01);
const second = runSignalIslesScenario(signalIslesDefaultScenarioActions, signalIslesLevel01);
assert.equal(createSignalIslesReplayDigest(first), createSignalIslesReplayDigest(second), "deterministic replay digest should be stable");

console.log("Signal Isles replay smoke passed.");
