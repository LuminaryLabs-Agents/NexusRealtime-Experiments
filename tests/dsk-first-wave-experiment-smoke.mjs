import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDskFirstWaveProof } from "../experiments/dsk-first-wave-proof/src/proof.js";

const html = readFileSync("experiments/dsk-first-wave-proof/index.html", "utf8");
assert.ok(html.includes('"nexusrealtime"'), "proof experiment should declare the browser import map for nexusrealtime");
assert.ok(html.includes("./src/proof.js"), "proof experiment should load the proof module");

const proof = createDskFirstWaveProof();
for (const key of ["completionLedger", "hazardDirector", "resourcePressure", "routeCheckpoint", "scanSurvey", "zoneField"]) {
  assert.ok(proof.installed.includes(key), `proof should install engine.n.${key}`);
}
assert.deepEqual(proof.scanCompleted, ["proof-relay"]);
assert.equal(proof.routeProgress, 1);
assert.equal(proof.signal, 0.875);
assert.equal(proof.hazardActive, true);
assert.deepEqual(proof.ledgerCompleted, ["proof-relay"]);
assert.deepEqual(proof.zoneSample, ["proof-zone"]);

console.log("DSK first-wave experiment smoke passed.");
