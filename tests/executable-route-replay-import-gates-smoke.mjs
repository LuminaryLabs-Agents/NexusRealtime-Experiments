import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const gatePath = "experiments/executable-route-replay-import-gates.json";
const replayManifestPath = "experiments/canonical-route-replay-manifest.json";
const laneContractsPath = "experiments/headless-lane-replay-contracts.json";
const routeReplaySpecPath = "experiments/signal-bastion-route-domain-replay.json";
const executableSmokePath = "tests/signal-bastion-executable-route-replay-smoke.mjs";

const gateManifest = JSON.parse(readFileSync(gatePath, "utf8"));
const replayManifest = JSON.parse(readFileSync(replayManifestPath, "utf8"));
const laneContracts = JSON.parse(readFileSync(laneContractsPath, "utf8"));
const routeReplaySpec = JSON.parse(readFileSync(routeReplaySpecPath, "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const bootSource = readFileSync("games/signal-bastion/src/boot.js", "utf8");

assert.equal(gateManifest.version, 1, "import gate manifest should be versioned");
assert.equal(gateManifest.sourceReplayManifest, replayManifestPath, "import gate should extend the canonical replay manifest");
assert.equal(gateManifest.sourceLaneContracts, laneContractsPath, "import gate should extend the lane replay contracts");
assert.equal(gateManifest.sourceRouteReplaySpec, routeReplaySpecPath, "import gate should extend the Signal Bastion replay spec");

for (const exclusion of replayManifest.browserOwnershipExcluded) {
  assert.ok(gateManifest.browserOwnershipExcluded.includes(exclusion), `import gate should preserve browser ownership exclusion ${exclusion}`);
}

const gate = gateManifest.gates.find((entry) => entry.canonicalId === "signal-bastion");
assert.ok(gate, "Signal Bastion should have an executable route replay import gate");
assert.equal(gate.scenarioLane, "strategic-pressure-loop", "Signal Bastion gate should target the strategic pressure lane");
assert.equal(gate.gateStatus, "satisfied-by-package-wiring", "Signal Bastion executable replay gate should be satisfied by real package wiring");
assert.equal(gate.currentRouteImportMode.file, "games/signal-bastion/src/boot.js", "gate should point at the route boot file");
assert.ok(existsSync(executableSmokePath), "satisfied gate should point at an executable replay smoke file");
assert.ok(
  gate.executableReplayCoverage?.some((coverage) => coverage.test === executableSmokePath),
  "gate should list executable replay coverage"
);

const routeReplay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === gate.canonicalId);
const lane = replayManifest.replayLanes.find((entry) => entry.id === gate.scenarioLane);
const contract = laneContracts.contracts.find((entry) => entry.id === gate.scenarioLane);
assert.ok(routeReplay, "Signal Bastion should still exist in the replay manifest");
assert.ok(lane, "strategic-pressure-loop should still exist in the replay manifest");
assert.ok(contract, "strategic-pressure-loop should still exist in the lane contracts");
assert.equal(routeReplay.status, "protokit-covered", "Signal Bastion should remain ProtoKit-covered at the route replay layer");
assert.equal(lane.coverageStatus, "protokit-covered", "strategic-pressure-loop should remain ProtoKit-covered");
assert.equal(contract.executionStatus, "protokit-backed", "strategic-pressure-loop lane should remain ProtoKit-backed");
assert.equal(routeReplaySpec.executionStatus, "executable-smoked-protokit-backed", "Signal Bastion spec should be executable-smoked and ProtoKit-backed");
assert.equal(routeReplaySpec.sourceExecutableSmoke, executableSmokePath, "route spec should point at executable replay smoke");
assert.equal(routeReplaySpec.remainingGap.includes("host convenience facades"), true, "route spec should keep the remaining local-JS reduction gap explicit");

const dependencyNames = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...Object.keys(packageJson.optionalDependencies ?? {})
]);
const dependencyText = JSON.stringify({
  dependencies: packageJson.dependencies ?? {},
  devDependencies: packageJson.devDependencies ?? {},
  peerDependencies: packageJson.peerDependencies ?? {},
  optionalDependencies: packageJson.optionalDependencies ?? {},
  workspaces: packageJson.workspaces ?? []
});

for (const required of gate.requiredLocalPackageWiring) {
  assert.ok(required.repo?.startsWith("LuminaryLabs-"), `${required.packageName} should identify the source repo`);
  assert.ok(required.packageName, "required package wiring entries should name a package");
  assert.ok(required.expectedImport, `${required.packageName} should name the expected import surface`);
  assert.equal(dependencyNames.has(required.packageName), true, `${required.packageName} should now be wired into Experiments package metadata`);
  assert.ok(dependencyText.includes(required.repo), `${required.packageName} dependency should point at ${required.repo}`);
}

assert.match(bootSource, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Dev\/NexusRealtime@main\/src\/index\.js/, "Signal Bastion browser boot can still use the Core CDN import while Node replay uses package wiring");
assert.match(bootSource, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Agents\/NexusRealtime-ProtoKits@main\/protokits\/generic-defense-aaa-dsk-bridge\/index\.js/, "Signal Bastion browser boot should consume the ProtoKits defense DSK bridge CDN import");
assert.match(bootSource, /cdn\.jsdelivr\.net\/gh\/LuminaryLabs-Agents\/NexusRealtime-ProtoKits@main\/protokits\/generic-defense-presentation-stack-kit\/index\.js/, "Signal Bastion browser boot should consume the ProtoKits presentation CDN import");
assert.match(bootSource, /createGenericDefenseDskBundle/, "route boot should compose generic-defense through DSK aliases");
assert.doesNotMatch(bootSource, /\bcreateGenericDefenseKits\s*\(/, "route boot should not compose the whole broad defense compatibility facade");
assert.match(bootSource, /import\(NEXUS_URL\)/, "route boot should load Core through the declared dynamic import URL");
assert.match(bootSource, /import\(DEFENSE_KITS_URL\)/, "route boot should load defense kits through the declared dynamic import URL");
assert.doesNotMatch(bootSource, /from ["']nexusrealtime["']|from ["']@luminarylabs\/nexusrealtime-protokits/, "route boot should not silently switch browser runtime mode as part of the Node replay gate");

for (const forbidden of [
  "route-local generic-defense interpreter",
  "copied ProtoKit fixtures under Experiments",
  "browser CDN imports inside Node replay smoke",
  "DOM or Canvas shim that owns reusable simulation",
  "new V1/V2/V3 Signal Bastion route fork just to satisfy replay"
]) {
  assert.ok(gate.forbiddenFallbacks.includes(forbidden), `gate should forbid ${forbidden}`);
}

for (const phrase of ["resources", "events", "methods", "snapshots", "descriptors"]) {
  assert.ok(
    gate.executableReplayCoverage.some((coverage) => coverage.coverage.includes(phrase)) || routeReplaySpec.expectedAssertions[phrase]?.length > 0,
    `gate or route spec should keep ${phrase} visible for the executable replay`
  );
}

assert.ok(
  gate.satisfiedBy.some((entry) => entry.includes("nexusrealtime")) && gate.satisfiedBy.some((entry) => entry.includes("generic-defense-dsk-boundaries")),
  "satisfied gate should document package wiring and real DSK alias imports"
);
assert.ok(
  gate.pruningEffect.includes("fake local replays") && gate.pruningEffect.includes("route forks"),
  "gate should still protect canonical pruning from fake replays and route sprawl"
);

console.log("Executable route replay import gate smoke passed.");
