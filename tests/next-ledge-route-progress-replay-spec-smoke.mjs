import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const spec = JSON.parse(readFileSync("experiments/next-ledge-route-progress-replay.json", "utf8"));
const domainManifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));
const replayManifest = JSON.parse(readFileSync("experiments/canonical-route-replay-manifest.json", "utf8"));
const sessionSource = readFileSync("experiments/next-ledge/src/session.js", "utf8");
const cutover = domainManifest.canonicalRoutes.find((entry) => entry.id === "next-ledge");
const replay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === "next-ledge");

assert.equal(spec.routeId, "next-ledge", "spec should be scoped to Next Ledge");
assert.equal(spec.canonicalPath, "experiments/next-ledge/", "spec should point at the canonical Next Ledge route");
assert.equal(spec.scenarioLane, "traversal-cargo-pressure", "spec should stay within the traversal/cargo lane");
assert.equal(spec.higherLevelDomain, "Delivery/extraction loop", "spec should name the higher-level domain under test");
assert.equal(spec.fullLaneExecutableClaim, false, "route-progress seam should not claim the full traversal/cargo executable lane");
assert.equal(spec.sourceManifest, "experiments/domain-kit-cutover-manifest.json", "spec should extend the cutover manifest");
assert.equal(spec.sourceReplayManifest, "experiments/canonical-route-replay-manifest.json", "spec should extend the replay manifest");
assert.equal(spec.sourceSession, "experiments/next-ledge/src/session.js", "spec should identify the route host source it guards");

assert.ok(cutover, "Next Ledge should remain in the canonical cutover manifest");
assert.ok(replay, "Next Ledge should remain in the canonical route replay manifest");
assert.equal(replay.status, "planned-fixture", "Next Ledge should remain planned until cargo/resource/pressure replay is executable");
assert.ok(
  replay.missingExecutableFixtures.some((fixture) => /cargo\/resource\/pressure/.test(fixture)),
  "replay manifest should keep the cargo/resource/pressure gap explicit"
);
assert.ok(
  !Array.isArray(replay.routeExecutableReplayCoverage) || replay.routeExecutableReplayCoverage.length === 0,
  "Next Ledge should not claim route executable replay coverage from this route-progress spec"
);
assert.match(
  cutover.bridgeNeeded,
  /route-progress consumption is executable through engine\.n\.genericRouteProgress/,
  "cutover manifest should record the executable route-progress seam"
);
assert.match(
  cutover.bridgeNeeded,
  /cargo\/resource\/pressure consumption remains planned/,
  "cutover manifest should keep cargo/resource/pressure planned"
);

const coverageTests = new Set(spec.sourceProtoKitCoverage.map((entry) => entry.test));
assert.ok(coverageTests.has("tests/generic-route-progress-kit-smoke.test.mjs"), "spec should point at the atomic route-progress ProtoKit smoke");
assert.ok(coverageTests.has("tests/generic-route-progress-replay-smoke.test.mjs"), "spec should point at the route-progress deterministic replay smoke");

assert.equal(spec.routeProgressBoundary.namespace, "engine.n.genericRouteProgress", "route-progress seam should use the namespaced DSK surface");
for (const surface of ["resources", "events", "methods", "snapshots", "descriptors"]) {
  assert.ok(Array.isArray(spec.routeProgressBoundary[surface]) && spec.routeProgressBoundary[surface].length > 0, `route-progress spec should list ${surface}`);
}
for (const method of ["setRoute", "enter", "complete", "getState"]) {
  assert.ok(spec.routeProgressBoundary.methods.includes(method), `route-progress seam should expose ${method}`);
}
assert.ok(spec.routeProgressBoundary.snapshots.includes("domain.routeProgress"), "route-progress snapshots should be exposed through domain.routeProgress");
assert.ok(spec.routeProgressBoundary.descriptors.includes("route-checkpoint"), "route-progress descriptors should stay renderer-agnostic");

assert.match(sessionSource, /createGenericRouteProgressKit/, "Next Ledge should import the generic route-progress ProtoKit");
assert.match(sessionSource, /engine\.n\?\.genericRouteProgress/, "Next Ledge should prefer engine.n.genericRouteProgress");
assert.match(sessionSource, /facade\.setRoute\?\(createRouteProgressRoute\(state\)/, "Next Ledge should sync climb anchors into the DSK route resource");
assert.match(sessionSource, /facade\.enter\?\(checkpointId/, "Next Ledge should mirror route events through DSK enter methods");
assert.match(sessionSource, /facade\.complete\?\(checkpointId/, "Next Ledge should mirror route events through DSK complete methods");
assert.match(sessionSource, /routeProgress: routeProgressFacade\(engine\)\?\.getState\?\.\(\)/, "Next Ledge snapshots should expose domain.routeProgress");
assert.doesNotMatch(sessionSource, /createGenericRouteCargoExtractionKit/, "Next Ledge should not claim cargo extraction consumption before the route imports it");

for (const forbidden of ["document.", "window.", "CanvasRenderingContext2D", "WebGLRenderingContext", "THREE.", "requestAnimationFrame"]) {
  assert.doesNotMatch(
    sessionSource,
    new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `Next Ledge route-progress session should not own browser/renderer API ${forbidden}`
  );
}

for (const owned of ["tether physics", "grapple/collision sweep", "browser input bridge", "renderer presentation"]) {
  assert.ok(spec.routeHostOwns.includes(owned), `spec should keep ${owned} in the route host`);
}
for (const excluded of ["DOM", "Canvas", "WebGL", "Three.js", "browser audio", "asset loading"]) {
  assert.ok(spec.browserOwnershipExcludedFromDsk.includes(excluded), `spec should exclude ${excluded} from reusable DSK logic`);
}
assert.ok(
  spec.remainingExecutableGap.some((gap) => /cargo\/resource\/pressure/.test(gap)),
  "spec should keep the full traversal/cargo gap explicit"
);

console.log("Next Ledge route-progress replay spec smoke passed.");
