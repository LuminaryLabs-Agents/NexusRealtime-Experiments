import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const plan = JSON.parse(readFileSync("experiments/next-ledge-route-cargo-extraction-plan.json", "utf8"));
const routeProgressSpec = JSON.parse(readFileSync("experiments/next-ledge-route-progress-replay.json", "utf8"));
const domainManifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));
const replayManifest = JSON.parse(readFileSync("experiments/canonical-route-replay-manifest.json", "utf8"));
const sessionSource = readFileSync("experiments/next-ledge/src/session.js", "utf8");

assert.equal(plan.routeId, "next-ledge", "plan should target the canonical Next Ledge route");
assert.equal(plan.scenarioLane, "traversal-cargo-pressure", "plan should stay on the traversal/cargo pressure lane");
assert.equal(plan.higherLevelDomain, "Delivery/extraction loop", "plan should name the higher-level delivery/extraction domain");
assert.equal(plan.status, "composite-consumption-planned", "route-cargo composite consumption should remain planned until source consumes it");
assert.equal(plan.fullLaneExecutableClaim, false, "plan must not claim the full lane executable replay early");
assert.equal(plan.localJsReductionClaim, "none-yet-for-composite; this is guard/plan hardening only", "plan should not overclaim local JavaScript reduction");

const route = domainManifest.canonicalRoutes.find((entry) => entry.id === "next-ledge");
assert.ok(route, "Next Ledge should remain manifest-owned");
for (const required of [
  "generic-route-progress-kit",
  "generic-route-cargo-extraction-kit",
  "generic-resource-loop-kit",
  "generic-pressure-loop-kit"
]) {
  assert.ok(route.domainCutover.includes(required), `Next Ledge manifest should keep ${required} in the cutover target`);
}
assert.match(route.bridgeNeeded, /route-progress consumption is executable through engine\.n\.genericRouteProgress/, "manifest should preserve the existing executable route-progress seam");
assert.match(route.bridgeNeeded, /cargo\/resource\/pressure consumption remains planned/, "manifest should preserve the remaining composite gap");

const replay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === "next-ledge");
assert.ok(replay, "Next Ledge should remain in the canonical replay manifest");
assert.equal(replay.status, "planned-fixture", "replay manifest should not claim route-cargo executable replay yet");
assert.ok(
  replay.missingExecutableFixtures.some((fixture) => /generic-route-cargo-extraction-kit/.test(fixture)),
  "replay manifest should keep the generic-route-cargo-extraction executable fixture gap explicit"
);

assert.equal(routeProgressSpec.status, "partial-route-progress-dsk-consumed", "route-progress spec should remain the current executable seam");
assert.equal(routeProgressSpec.fullLaneExecutableClaim, false, "route-progress spec should not claim the full traversal/cargo lane");
assert.ok(
  routeProgressSpec.remainingExecutableGap.some((gap) => /cargo\/resource\/pressure/.test(gap)),
  "route-progress spec should keep the cargo/resource/pressure gap explicit"
);

assert.equal(plan.compositeBoundary.kit, "generic-route-cargo-extraction-kit", "plan should target the existing ProtoKit composite");
assert.equal(plan.compositeBoundary.namespace, "engine.n.genericRouteCargoExtraction", "plan should prefer the namespaced composite DSK facade");
for (const childNamespace of [
  "engine.n.genericRouteProgress",
  "engine.n.genericResourceLoop",
  "engine.n.genericPressureLoop"
]) {
  assert.ok(plan.compositeBoundary.childNamespaces.includes(childNamespace), `plan should compose child namespace ${childNamespace}`);
}
for (const surface of ["resources", "events", "methods", "snapshots", "descriptors"]) {
  assert.ok(Array.isArray(plan.compositeBoundary[surface]) && plan.compositeBoundary[surface].length > 0, `composite boundary should list ${surface}`);
}
for (const method of ["completeCheckpoint", "pickupCargo", "deliverCargo", "adjustPressure", "getSnapshot", "getDescriptors"]) {
  assert.ok(plan.compositeBoundary.methods.includes(method), `composite plan should include ${method}`);
}

assert.match(sessionSource, /createGenericRouteProgressKit/, "current source should still consume the route-progress ProtoKit");
assert.match(sessionSource, /engine\.n\?\.genericRouteProgress/, "current source should still prefer the namespaced route-progress boundary");
assert.doesNotMatch(sessionSource, /createGenericRouteCargoExtractionKit/, "source should not import the composite before the plan is executed");
assert.match(sessionSource, /routeProgress: routeProgressFacade\(engine\)\?\.getState/, "snapshots should still expose routeProgress explicitly");

for (const retained of [
  "tether physics",
  "grapple/collision sweep",
  "camera and visual trail state",
  "browser input bridge",
  "route fiction and climb labels",
  "renderer presentation"
]) {
  assert.ok(plan.routeHostRetains.includes(retained), `host should retain ${retained}`);
}
for (const excluded of ["DOM", "Canvas", "WebGL", "Three.js", "pointer lock", "browser audio", "asset loading"]) {
  assert.ok(plan.browserOwnershipExcludedFromDsk.includes(excluded), `DSK boundary should exclude ${excluded}`);
}
for (const folded of ["Harbor Salvage", "Cargo Chain", "Sky Courier", "Trainyard Switcher", "Dungeon Relay", "Floodplain Rescue"]) {
  assert.ok(plan.foldedVariantPressure.includes(folded), `${folded} should remain folded pressure, not filler canonical work`);
}

const phaseText = JSON.stringify(plan.phasePlan);
assert.match(phaseText, /no monolithic game-engine composite/, "plan should explicitly reject monolithic composite game engines");
assert.match(phaseText, /cargo\/resource\/pressure/, "plan should require cargo/resource/pressure proof before migration");
assert.match(plan.nextPatchGate, /Do not migrate source/, "plan should gate source migration until real composite consumption proof exists");

console.log("Next Ledge route-cargo extraction plan smoke passed.");
