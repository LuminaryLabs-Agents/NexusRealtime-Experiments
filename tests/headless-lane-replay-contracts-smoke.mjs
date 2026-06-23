import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const replayManifestPath = "experiments/canonical-route-replay-manifest.json";
const laneContractsPath = "experiments/headless-lane-replay-contracts.json";

const replayManifest = JSON.parse(readFileSync(replayManifestPath, "utf8"));
const laneContracts = JSON.parse(readFileSync(laneContractsPath, "utf8"));

const requiredSurfaces = ["resources", "events", "methods", "snapshots", "descriptors"];
const requiredBrowserExclusions = ["DOM", "Canvas", "WebGL", "Three.js", "pointer lock", "browser audio", "asset loading"];
const allowedExecutionStatuses = new Set(["contract-only", "protokit-backed"]);

assert.equal(laneContracts.sourceReplayManifest, replayManifestPath, "lane contracts should extend the canonical route replay manifest");
assert.ok(
  laneContracts.policy.includes("fixed-tick") && laneContracts.policy.includes("renderer-free"),
  "lane contract policy should preserve fixed-tick and renderer-free intent"
);
assert.deepEqual(laneContracts.requiredSurfaces, requiredSurfaces, "lane contracts should require the five DSK communication surfaces");

for (const exclusion of requiredBrowserExclusions) {
  assert.ok(laneContracts.browserOwnershipExcluded.includes(exclusion), `lane contracts should exclude ${exclusion} ownership`);
}

const routeReplaysByLane = new Map();
for (const replay of replayManifest.canonicalRouteReplays) {
  const list = routeReplaysByLane.get(replay.scenarioLane) ?? [];
  list.push(replay);
  routeReplaysByLane.set(replay.scenarioLane, list);
}

const contractById = new Map();
for (const contract of laneContracts.contracts) {
  assert.ok(contract.id, "each lane contract needs an id");
  assert.ok(!contractById.has(contract.id), `${contract.id} should not be duplicated`);
  contractById.set(contract.id, contract);

  assert.ok(allowedExecutionStatuses.has(contract.executionStatus), `${contract.id} should use a known execution status`);
  assert.ok(contract.higherLevelDomain.length > 8, `${contract.id} should name a higher-level domain`);
  assert.ok(contract.fixedTickPlan.count > 0, `${contract.id} should define a positive fixed tick count`);
  assert.ok(Number.isFinite(contract.fixedTickPlan.dt) && contract.fixedTickPlan.dt >= 0, `${contract.id} should define deterministic dt`);
  assert.ok(contract.setup?.minimalConfig?.length > 20, `${contract.id} should describe minimal config`);
  assert.ok(Array.isArray(contract.setup?.entities) && contract.setup.entities.length > 0, `${contract.id} should list minimal entities`);
  assert.ok(Array.isArray(contract.inputs) && contract.inputs.length > 0, `${contract.id} should list semantic input methods`);
  assert.ok(Array.isArray(contract.localJsReductionSignal) && contract.localJsReductionSignal.length > 0, `${contract.id} should identify JS reduction pressure`);

  for (const input of contract.inputs) {
    assert.equal(Number.isInteger(input.frame), true, `${contract.id}: input frame should be fixed`);
    assert.ok(input.frame >= 0, `${contract.id}: input frame should be non-negative`);
    assert.ok(typeof input.method === "string" && input.method.includes("."), `${contract.id}: input should be a semantic host/DSK method`);
  }

  for (const surface of requiredSurfaces) {
    assert.ok(Array.isArray(contract.assertions?.[surface]), `${contract.id}: ${surface} assertions should be listed`);
    assert.ok(contract.assertions[surface].length > 0, `${contract.id}: ${surface} assertions should not be empty`);
  }

  assert.ok(Array.isArray(contract.determinism?.digestFields), `${contract.id} should list deterministic digest fields`);
  assert.ok(contract.determinism.digestFields.length > 0, `${contract.id} digest fields should not be empty`);
  assert.ok(contract.determinism.nondeterminismRisk.length > 15, `${contract.id} should name nondeterminism risk`);

  const digestA = JSON.stringify([
    contract.id,
    contract.fixedTickPlan,
    contract.setup.entities,
    contract.inputs,
    contract.assertions,
    contract.determinism.digestFields
  ]);
  const digestB = JSON.stringify([
    contract.id,
    contract.fixedTickPlan,
    contract.setup.entities,
    contract.inputs,
    contract.assertions,
    contract.determinism.digestFields
  ]);
  assert.equal(digestA, digestB, `${contract.id}: contract digest should be stable`);

  if (contract.executionStatus === "protokit-backed") {
    assert.ok(Array.isArray(contract.protoKitReplayCoverage) && contract.protoKitReplayCoverage.length > 0, `${contract.id} should point at ProtoKit replay coverage`);
  } else {
    assert.ok(contract.missingExecutableFixture?.length > 0, `${contract.id} should keep executable fixture gap explicit`);
  }
}

for (const lane of replayManifest.replayLanes) {
  assert.ok(contractById.has(lane.id), `${lane.id} should have a headless replay contract`);
  assert.ok(Array.isArray(lane.reusableBoundaryCandidates) && lane.reusableBoundaryCandidates.length > 0, `${lane.id} should keep reusable boundary candidates explicit`);
  const contract = contractById.get(lane.id);
  assert.equal(contract.higherLevelDomain, lane.higherLevelDomain, `${lane.id} should preserve higher-level domain naming`);

  const routeReplays = routeReplaysByLane.get(lane.id) ?? [];
  assert.deepEqual(
    [...contract.canonicalIds].sort(),
    routeReplays.map((replay) => replay.canonicalId).sort(),
    `${lane.id} contract should cover exactly the canonical routes assigned to that lane`
  );

  if (contract.executionStatus === "protokit-backed") {
    const coverageText = JSON.stringify(contract.protoKitReplayCoverage);
    assert.ok(coverageText.includes("ProtoKits") || coverageText.includes("protokits"), `${lane.id}: ProtoKit-backed lane should reference ProtoKit coverage`);
  }
}

const strategicContract = contractById.get("strategic-pressure-loop");
assert.equal(strategicContract.executionStatus, "protokit-backed", "strategic pressure should remain the currently ProtoKit-backed lane");
assert.ok(
  strategicContract.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-defense-replay-smoke.test.mjs"),
  "strategic pressure should point at generic-defense replay smoke"
);

console.log("Headless lane replay contract smoke passed.");
