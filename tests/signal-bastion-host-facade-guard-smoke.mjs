import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const spec = JSON.parse(readFileSync("experiments/signal-bastion-route-domain-replay.json", "utf8"));
const replayManifest = JSON.parse(readFileSync("experiments/canonical-route-replay-manifest.json", "utf8"));
const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const input = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");

const routeReplay = replayManifest.canonicalRouteReplays.find((entry) => entry.canonicalId === "signal-bastion");
assert.ok(routeReplay, "Signal Bastion should remain in the replay manifest");
assert.equal(spec.executionStatus, "executable-smoked-protokit-backed", "host facade guard should build on the executable route replay closure");
assert.match(spec.remainingGap, /presentation bridge hardening/, "spec should move the remaining shrink gap to presentation bridge hardening after host facade closures");
for (const staleGap of [
  /defenseFoundation/i,
  /defenseScale/i,
  /defenseWaves/i,
  /defenseBuild/i,
  /foundation plus build/i,
  /only `setBlueprint` \/ `sell` remain/i
]) {
  assert.doesNotMatch(spec.remainingGap, staleGap, `remaining gap should not re-open closed browser-host facade seam ${staleGap}`);
}
for (const closedSignal of [
  /wave preview/i,
  /scale\/budget snapshot/i,
  /foundation debug snapshot/i,
  /setBlueprint\/sell/i
]) {
  assert.ok(
    spec.localJsReductionSignal.some((entry) => closedSignal.test(entry)),
    `localJsReductionSignal should preserve the closed Signal Bastion seam ${closedSignal}`
  );
}
assert.deepEqual(routeReplay.missingExecutableFixtures ?? [], [], "Signal Bastion should not regress to a missing executable replay fixture");

const expectedBoundaryIds = spec.protokitBoundaries.map((boundary) => boundary.id);
assert.deepEqual(expectedBoundaryIds, [
  "map",
  "economyWallet",
  "buildPlacement",
  "waveAgentDirector",
  "combatResolver",
  "sessionFacade",
  "renderDescriptors"
], "Signal Bastion spec should keep the seven generic-defense DSK aliases explicit");
for (const boundaryId of expectedBoundaryIds) {
  assert.match(boot, new RegExp(`"${boundaryId}"`), `boot should request the ${boundaryId} DSK alias`);
}

const allowedDefenseFactories = new Set([
  "createGenericDefenseDskBundle",
  "createGenericDefenseAuthoringQaKit"
]);

const namedDefenseExports = [...boot.matchAll(/"(createGenericDefense[A-Za-z0-9]+)"/g)].map((match) => match[1]);
const calledDefenseFactories = [...boot.matchAll(/DefenseKits\.(createGenericDefense[A-Za-z0-9]+)\s*\(/g)].map((match) => match[1]);
for (const factory of [...namedDefenseExports, ...calledDefenseFactories]) {
  assert.ok(allowedDefenseFactories.has(factory), `boot should not add unguarded generic-defense host facade ${factory}`);
}
for (const factory of allowedDefenseFactories) {
  assert.ok(
    namedDefenseExports.includes(factory) || calledDefenseFactories.includes(factory),
    `boot should make ${factory} explicit when it remains part of the browser host boundary`
  );
}

assert.doesNotMatch(boot, /\bcreateGenericDefenseKits\s*\(/, "boot should not return to the broad generic-defense compatibility facade");
assert.doesNotMatch(boot, /generic-defense-kits\/index\.js/, "boot should not import the broad generic-defense-kit CDN module");
assert.match(boot, /generic-defense-aaa-dsk-bridge\/index\.js/, "boot should keep the narrower DSK bridge import");
assert.match(boot, /generic-defense-session-command-kit\/index\.js/, "boot should import the reusable session command ProtoKit instead of broad build/wave compatibility facades");
assert.match(boot, /SessionCommandKits\.createGenericDefenseSessionCommandKit\(/, "boot should install the reusable session command ProtoKit");
assert.match(boot, /engine\.n\?\.genericDefense/, "boot should depend on the pruned generic-defense DSK namespace");
assert.match(input, /engine\.n\?\.genericDefense/, "input host should depend on the pruned generic-defense DSK namespace");

const browserHostSources = [boot, input, renderer].join("\n");
for (const forbiddenFacade of [
  "defenseMap",
  "defenseEconomy",
  "defenseStructures",
  "defenseAgents",
  "defenseCombat",
  "defenseRender"
]) {
  assert.doesNotMatch(
    browserHostSources,
    new RegExp(`engine\\.${forbiddenFacade}\\b`),
    `browser host should not bypass genericDefense/session/presentation boundaries through engine.${forbiddenFacade}`
  );
}

for (const semanticHostMethod of [
  "engine.placementProjector?.confirm?.(",
  "sessionFacade()?.startWave?.(",
  "sessionFacade()?.upgrade?.(",
  "sessionFacade()?.restart?.(",
  "sessionFacade()?.select?.(",
  "sessionFacade()?.setBlueprint?.(",
  "sessionFacade()?.sell?.(",
  "getSignalBastionSessionFacade(engine)?.getSnapshot?.()",
  "getSignalBastionFoundationSnapshot(engine)",
  "getSignalBastionWavePreview(engine)",
  "getSignalBastionBudgetSnapshot(engine)",
  "engine.defensePresentationStack?.getSnapshot?.()"
]) {
  assert.ok(browserHostSources.includes(semanticHostMethod), `browser host should keep semantic bridge call ${semanticHostMethod}`);
}

for (const legacyBypass of [
  /engine\.genericDefense\./,
  /engine\.defenseWaves\?\.startWave\?\.\(/,
  /engine\.defenseWaves\?\.previewNextWave\?\.\(/,
  /engine\.defenseBuild\?\.setBlueprint\?\.\(/,
  /engine\.defenseBuild\?\.sell\?\.\(/,
  /engine\.defenseBuild\?\.upgrade\?\.\(/,
  /engine\.defenseScale\?\.getBudgetSnapshot\?\.\(/,
  /engine\.defenseFoundation\?\.getSnapshot\?\.\(/
]) {
  assert.doesNotMatch(browserHostSources, legacyBypass, `browser host should route migrated calls through engine.n.genericDefense instead of ${legacyBypass}`);
}

assert.doesNotMatch(browserHostSources, /engine\.defenseBuild\b/, "browser host should not depend on the broad defenseBuild compatibility facade after session-command migration");
assert.doesNotMatch(browserHostSources, /engine\.defenseWaves\b/, "browser host should not depend on the broad defenseWaves compatibility facade after session-command migration");

for (const forbidden of [
  "Math.random",
  "Date.now",
  "crypto.getRandomValues"
]) {
  assert.doesNotMatch(browserHostSources, new RegExp(forbidden.replace(".", "\\.")), `host facade guard should exclude ${forbidden}`);
}

assert.doesNotMatch(input, /\.push\s*\(|\.splice\s*\(|\.sort\s*\(/, "input host should not mutate route-local simulation collections");
assert.doesNotMatch(renderer, /engine\.|createRealtimeGame|createGenericDefense/, "renderer should stay a descriptor/snapshot projection layer, not a domain facade");

console.log("Signal Bastion host facade guard smoke passed.");
