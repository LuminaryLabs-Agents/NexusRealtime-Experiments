import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const cutoverManifestPath = "experiments/domain-kit-cutover-manifest.json";
const pruningMapPath = "experiments/canonical-route-pruning-map.json";
const replayManifestPath = "experiments/canonical-route-replay-manifest.json";

const cutoverManifest = JSON.parse(readFileSync(cutoverManifestPath, "utf8"));
const pruningMap = JSON.parse(readFileSync(pruningMapPath, "utf8"));
const replayManifest = JSON.parse(readFileSync(replayManifestPath, "utf8"));

const allowedStatuses = new Set(["planned-fixture", "protokit-covered"]);
const requiredBrowserExclusions = ["DOM", "Canvas", "WebGL", "Three.js", "pointer lock", "browser audio", "asset loading"];

assert.equal(replayManifest.sourceManifest, cutoverManifestPath, "replay manifest should extend the canonical cutover manifest");
assert.equal(replayManifest.sourcePruningMap, pruningMapPath, "replay manifest should extend the pruning map");
assert.ok(
  replayManifest.policy.includes("DSK") && replayManifest.policy.includes("deterministic replay"),
  "replay manifest policy should preserve DSK and replay gate language"
);
assert.ok(
  replayManifest.promotionGate.includes("domain communication boundary"),
  "replay manifest should keep promotion framed as reusable communication boundaries"
);

for (const exclusion of requiredBrowserExclusions) {
  assert.ok(replayManifest.browserOwnershipExcluded.includes(exclusion), `browser ownership exclusion should include ${exclusion}`);
}

const canonicalById = new Map(cutoverManifest.canonicalRoutes.map((entry) => [entry.id, entry]));
const pruningById = new Map(pruningMap.canonicalRouteIssues.map((entry) => [entry.canonicalId, entry]));
const replayByCanonicalId = new Map();
const laneById = new Map();

for (const lane of replayManifest.replayLanes) {
  assert.ok(lane.id, "each replay lane needs an id");
  assert.ok(!laneById.has(lane.id), `${lane.id} should not be duplicated`);
  laneById.set(lane.id, lane);
  assert.ok(typeof lane.higherLevelDomain === "string" && lane.higherLevelDomain.length > 8, `${lane.id} should name a higher-level domain`);
  assert.ok(Array.isArray(lane.reusableBoundaryCandidates) && lane.reusableBoundaryCandidates.length > 0, `${lane.id} should identify reusable boundary candidates`);
  assert.ok(lane.requiredReplayShape.includes("descriptor"), `${lane.id} should include descriptor replay expectations`);
  assert.ok(["planned", "protokit-covered"].includes(lane.coverageStatus), `${lane.id} should use a known coverage status`);
}

for (const issue of pruningMap.canonicalRouteIssues) {
  assert.ok(laneById.has(issue.scenarioLane), `${issue.canonicalId} pruning lane should have a replay lane contract`);
}

for (const replay of replayManifest.canonicalRouteReplays) {
  assert.ok(replay.canonicalId, "each route replay entry needs a canonicalId");
  assert.ok(!replayByCanonicalId.has(replay.canonicalId), `${replay.canonicalId} should have one replay contract`);
  replayByCanonicalId.set(replay.canonicalId, replay);
}

assert.equal(
  replayByCanonicalId.size,
  canonicalById.size,
  "each canonical cutover route should have exactly one replay contract"
);

for (const canonical of cutoverManifest.canonicalRoutes) {
  const replay = replayByCanonicalId.get(canonical.id);
  const pruningIssue = pruningById.get(canonical.id);
  assert.ok(replay, `${canonical.id} should have a replay contract`);
  assert.ok(pruningIssue, `${canonical.id} should have a pruning issue before replay gating`);
  assert.equal(replay.canonicalPath, canonical.canonicalPath, `${canonical.id} replay path should match the cutover manifest`);
  assert.equal(replay.scenarioLane, pruningIssue.scenarioLane, `${canonical.id} replay lane should match the pruning map`);
  assert.ok(laneById.has(replay.scenarioLane), `${canonical.id} replay lane should be declared`);
  assert.ok(allowedStatuses.has(replay.status), `${canonical.id} should use a known replay status`);
  assert.ok(existsSync(`${replay.canonicalPath}index.html`), `${canonical.id} canonical route should have index.html`);
  assert.ok(typeof replay.hostRole === "string" && replay.hostRole.includes("render"), `${canonical.id} should define renderer-only host role`);
  assert.ok(Array.isArray(replay.protoKitReplayCoverage), `${canonical.id} should list ProtoKit replay coverage, even if empty`);
  assert.ok(Array.isArray(replay.missingExecutableFixtures), `${canonical.id} should list missing executable fixtures, even when executable route coverage closes the list`);
  if (Array.isArray(replay.routeExecutableReplayCoverage) && replay.routeExecutableReplayCoverage.length > 0) {
    for (const coverage of replay.routeExecutableReplayCoverage) {
      assert.ok(coverage.repo && coverage.test && existsSync(coverage.test), `${canonical.id} executable route replay coverage should point at a test file`);
    }
  } else {
    assert.ok(replay.missingExecutableFixtures.length > 0, `${canonical.id} should keep missing fixture pressure explicit until executable replay exists`);
  }
  assert.ok(Array.isArray(replay.localJsReductionOpportunity) && replay.localJsReductionOpportunity.length > 0, `${canonical.id} should identify local JS reduction opportunities`);
}

const coveredRoutes = replayManifest.canonicalRouteReplays.filter((replay) => replay.protoKitReplayCoverage.length > 0);
assert.ok(coveredRoutes.length > 0, "at least one route should point at executable ProtoKit replay coverage");

const signalBastionReplay = replayByCanonicalId.get("signal-bastion");
assert.equal(signalBastionReplay.status, "protokit-covered", "Signal Bastion should be covered by generic-defense ProtoKit replay");
assert.ok(
  signalBastionReplay.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-defense-dsk-boundaries-smoke.test.mjs"),
  "Signal Bastion should point at generic-defense DSK boundary smoke"
);
assert.ok(
  signalBastionReplay.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-defense-replay-smoke.test.mjs"),
  "Signal Bastion should point at generic-defense deterministic replay smoke"
);
assert.ok(
  signalBastionReplay.routeExecutableReplayCoverage.some((coverage) => coverage.test === "tests/signal-bastion-executable-route-replay-smoke.mjs"),
  "Signal Bastion should point at the executable route-domain replay smoke"
);
assert.deepEqual(signalBastionReplay.missingExecutableFixtures, [], "Signal Bastion executable replay gap should be closed at the route-manifest layer");

const traversalCargoLane = laneById.get("traversal-cargo-pressure");
assert.ok(
  traversalCargoLane.reusableBoundaryCandidates.includes("generic-route-progress-kit"),
  "traversal/cargo should consolidate route checkpoint pressure onto generic-route-progress-kit"
);
assert.ok(
  traversalCargoLane.reusableBoundaryCandidates.includes("generic-route-cargo-extraction-kit"),
  "traversal/cargo should consolidate cargo/extraction pressure onto generic-route-cargo-extraction-kit"
);
assert.ok(
  !traversalCargoLane.reusableBoundaryCandidates.includes("route-checkpoint-kit"),
  "traversal/cargo should not regress to the stale route-checkpoint-kit placeholder"
);
assert.ok(
  !traversalCargoLane.reusableBoundaryCandidates.includes("cargo-delivery-kit"),
  "traversal/cargo should not regress to the stale cargo-delivery-kit placeholder"
);

const nextLedgeReplay = replayByCanonicalId.get("next-ledge");
assert.equal(nextLedgeReplay.status, "planned-fixture", "Next Ledge should remain planned until cargo/resource/pressure replay is executable");
assert.ok(
  nextLedgeReplay.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-route-progress-kit-smoke.test.mjs"),
  "Next Ledge should point at the atomic route progress smoke"
);
assert.ok(
  nextLedgeReplay.protoKitReplayCoverage.some((coverage) => coverage.test === "tests/generic-route-cargo-extraction-kit-smoke.test.mjs"),
  "Next Ledge should point at the composite route/cargo/extraction smoke before cargo migration"
);
assert.ok(
  nextLedgeReplay.missingExecutableFixtures.some((gap) => gap.includes("cargo/resource/pressure")),
  "Next Ledge should keep the remaining cargo/resource/pressure executable fixture gap explicit"
);

console.log("Canonical route replay manifest smoke passed.");
