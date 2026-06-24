import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const seederMapPath = "experiments/twenty-experiment-seeder-map.json";
const cutoverManifestPath = "experiments/domain-kit-cutover-manifest.json";
const pruningMapPath = "experiments/canonical-route-pruning-map.json";
const replayManifestPath = "experiments/canonical-route-replay-manifest.json";

const seederMap = JSON.parse(readFileSync(seederMapPath, "utf8"));
const cutoverManifest = JSON.parse(readFileSync(cutoverManifestPath, "utf8"));
const pruningMap = JSON.parse(readFileSync(pruningMapPath, "utf8"));
const replayManifest = JSON.parse(readFileSync(replayManifestPath, "utf8"));

const allowedDecisions = new Set(["seed-and-harden", "harden", "canonical-harden", "fold", "remove"]);
const requiredFields = [
  "domainBoundariesValidated",
  "protoKitsConsumedOrPlanned",
  "localJsShouldRemain",
  "localJsShouldMoveToProtoKits",
  "seedBacklogToFold"
];
const requiredBrowserBoundaryTerms = ["browser", "renderer", "Canvas", "WebGL", "Three.js", "assets", "audio", "DOM"];

assert.equal(seederMap.sourceManifest, cutoverManifestPath, "seeder map should extend the canonical cutover manifest");
assert.equal(seederMap.sourcePruningMap, pruningMapPath, "seeder map should extend the pruning map");
assert.equal(seederMap.sourceReplayManifest, replayManifestPath, "seeder map should extend the replay manifest");
assert.ok(seederMap.policy.includes("DSK"), "seeder policy should keep DSK framing");
assert.equal(seederMap.portfolioTarget.guidanceCount, 20, "the twenty-experiment target should stay visible");
assert.equal(seederMap.portfolioTarget.isRigidQuota, false, "twenty should remain guidance, not a quota");
assert.equal(
  seederMap.portfolioTarget.currentManifestOwnedCanonicalCount,
  cutoverManifest.canonicalRoutes.length,
  "seeder map should state the current manifest-owned canonical count"
);
assert.ok(
  seederMap.portfolioTarget.currentManifestOwnedCanonicalCount < seederMap.portfolioTarget.guidanceCount,
  "portfolio should be allowed to stay below 20 instead of adding filler routes"
);

const canonicalById = new Map(cutoverManifest.canonicalRoutes.map((entry) => [entry.id, entry]));
const pruningById = new Map(pruningMap.canonicalRouteIssues.map((entry) => [entry.canonicalId, entry]));
const replayById = new Map(replayManifest.canonicalRouteReplays.map((entry) => [entry.canonicalId, entry]));
const laneById = new Map(replayManifest.replayLanes.map((entry) => [entry.id, entry]));
const seederById = new Map();

assert.equal(
  seederMap.canonicalPortfolio.length,
  cutoverManifest.canonicalRoutes.length,
  "every manifest-owned canonical route should have one seeder decision entry"
);

for (const entry of seederMap.canonicalPortfolio) {
  assert.ok(entry.canonicalId, "each seeder entry needs a canonicalId");
  assert.ok(!seederById.has(entry.canonicalId), `${entry.canonicalId} should not have duplicate seeder decisions`);
  seederById.set(entry.canonicalId, entry);

  const canonical = canonicalById.get(entry.canonicalId);
  const pruning = pruningById.get(entry.canonicalId);
  const replay = replayById.get(entry.canonicalId);
  const lane = laneById.get(entry.scenarioLane);

  assert.ok(canonical, `${entry.canonicalId} should exist in the cutover manifest`);
  assert.ok(pruning, `${entry.canonicalId} should have pruning metadata`);
  assert.ok(replay, `${entry.canonicalId} should have replay metadata`);
  assert.ok(lane, `${entry.canonicalId} should point at a known replay lane`);
  assert.equal(entry.canonicalPath, canonical.canonicalPath, `${entry.canonicalId} path should match the cutover manifest`);
  assert.equal(entry.scenarioLane, pruning.scenarioLane, `${entry.canonicalId} lane should match the pruning map`);
  assert.equal(entry.scenarioLane, replay.scenarioLane, `${entry.canonicalId} lane should match the replay manifest`);
  assert.ok(existsSync(`${entry.canonicalPath}index.html`), `${entry.canonicalId} canonical route should still have index.html`);
  assert.ok(allowedDecisions.has(entry.routeDecision), `${entry.canonicalId} should use an allowed seeder decision`);
  assert.equal(typeof entry.executableReplayClaimed, "boolean", `${entry.canonicalId} should explicitly state executable replay claim status`);

  for (const field of requiredFields) {
    assert.ok(Array.isArray(entry[field]) && entry[field].length > 0, `${entry.canonicalId} should list ${field}`);
  }

  assert.ok(
    entry.smokeReplayScenarioNeeded.includes("replay") || entry.smokeReplayScenarioNeeded.includes("smoke"),
    `${entry.canonicalId} should keep smoke/replay pressure explicit`
  );

  const hostBoundary = entry.localJsShouldRemain.join(" ");
  assert.ok(
    requiredBrowserBoundaryTerms.some((term) => hostBoundary.includes(term)),
    `${entry.canonicalId} should preserve browser/renderer ownership in the host`
  );

  const allowedKitNames = new Set([
    ...canonical.domainCutover,
    ...lane.reusableBoundaryCandidates,
    ...replay.protoKitReplayCoverage.map((coverage) => coverage.test),
    "generic-defense-aaa-dsk-bridge",
    "generic-defense-dsk-boundaries",
    "generic-defense-session-command-kit"
  ]);
  assert.ok(
    entry.protoKitsConsumedOrPlanned.some((kit) => allowedKitNames.has(kit)),
    `${entry.canonicalId} should name ProtoKits that are present in the manifest, lane candidates, or replay coverage`
  );

  if (entry.executableReplayClaimed) {
    assert.ok(
      Array.isArray(replay.routeExecutableReplayCoverage) && replay.routeExecutableReplayCoverage.length > 0,
      `${entry.canonicalId} should only claim executable replay when route executable coverage exists`
    );
  } else {
    assert.ok(
      replay.status === "planned-fixture" || replay.missingExecutableFixtures.length > 0,
      `${entry.canonicalId} should not hide its missing executable fixture pressure`
    );
  }
}

for (const canonical of cutoverManifest.canonicalRoutes) {
  assert.ok(seederById.has(canonical.id), `${canonical.id} should be represented in the seeder map`);
}

const executableClaimIds = seederMap.canonicalPortfolio
  .filter((entry) => entry.executableReplayClaimed)
  .map((entry) => entry.canonicalId);
assert.deepEqual(executableClaimIds, ["signal-bastion"], "Signal Bastion should remain the only executable route-domain lane claim");

const nextLedge = seederById.get("next-ledge");
assert.equal(nextLedge.routeDecision, "seed-and-harden", "Next Ledge should stay the first route/cargo seed-hardening candidate");
assert.ok(
  nextLedge.domainBoundariesValidated.some((boundary) => boundary.includes("engine.n.genericRouteProgress")),
  "Next Ledge should record partial downstream route-progress DSK consumption"
);
assert.ok(
  nextLedge.protoKitsConsumedOrPlanned.includes("generic-route-progress-kit"),
  "Next Ledge should name generic-route-progress-kit"
);
assert.ok(
  nextLedge.protoKitsConsumedOrPlanned.includes("generic-route-cargo-extraction-kit"),
  "Next Ledge should name generic-route-cargo-extraction-kit"
);
assert.ok(
  nextLedge.localJsShouldMoveToProtoKits.some((item) => item.includes("cargo") || item.includes("pressure")),
  "Next Ledge should now keep the remaining shrink target on cargo/resource/pressure rather than the consumed route-progress seam"
);
assert.ok(
  !nextLedge.localJsShouldMoveToProtoKits.some((item) => item.includes("checkpoint enter/exit ledger")),
  "Next Ledge seeder map should not describe the consumed route-progress seam as the primary remaining migration target"
);
assert.equal(nextLedge.executableReplayClaimed, false, "Next Ledge should not claim executable replay before route-cargo composite consumption and replay are proven");

const foldedSeedNames = seederMap.canonicalPortfolio.flatMap((entry) => entry.seedBacklogToFold);
for (const seedName of ["Harbor Salvage", "Cargo Chain", "Sky Courier", "Trainyard Switcher", "Dungeon Relay", "Floodplain Rescue"]) {
  assert.ok(foldedSeedNames.includes(seedName), `${seedName} should stay folded/backlog instead of becoming filler canonical content`);
}

const signalBastion = seederById.get("signal-bastion");
assert.equal(signalBastion.routeDecision, "canonical-harden", "Signal Bastion should be hardened, not split into route forks");
assert.ok(
  signalBastion.protoKitsConsumedOrPlanned.includes("generic-defense-session-command-kit"),
  "Signal Bastion should record the session command ProtoKit after setBlueprint/sell migration"
);
for (const staleSeam of ["foundation", "setBlueprint", "sell", "defenseBuild", "defenseWaves", "defenseScale"]) {
  assert.ok(
    !signalBastion.localJsShouldMoveToProtoKits.some((item) => item.includes(staleSeam)),
    `Signal Bastion seeder map should not reopen closed browser-host seam ${staleSeam}`
  );
}
assert.ok(
  signalBastion.smokeReplayScenarioNeeded.includes("presentation bridge hardening"),
  "Signal Bastion next seeder pressure should move to presentation bridge hardening after host facade closures"
);

console.log("Twenty experiment seeder map smoke passed.");
