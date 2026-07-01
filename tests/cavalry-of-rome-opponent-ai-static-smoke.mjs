import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const opponent = readFileSync("experiments/The Cavalry of Rome/src/hex-opponent-ai-pass.js", "utf8");
const actionUi = readFileSync("experiments/The Cavalry of Rome/src/hex-action-ui-pass.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");

assert.ok(opponent.includes("rag-onnx-opponent-counterplay-controller"), "opponent pass should document RAG ONNX counterplay controller");
assert.ok(opponent.includes("rag-onnx-enemy-policy"), "opponent policy should expose RAG ONNX intent");
assert.ok(opponent.includes("modelUrl"), "opponent policy should expose an ONNX model URL slot");
assert.ok(opponent.includes("rag-memory-fallback"), "opponent policy should include tactical-memory fallback");
assert.ok(opponent.includes("runEnemyTurn"), "opponent should move after player maneuver");
assert.ok(opponent.includes("retrieveTacticalMemory"), "opponent should retrieve tactical memory for counterplay");
assert.ok(opponent.includes("scoreEnemyMove"), "opponent should score counter moves");
assert.ok(opponent.includes("chooseEnemyMove"), "opponent should choose enemy moves");
assert.ok(opponent.includes("state.side = \"enemy\""), "opponent turn should switch side to enemy");
assert.ok(opponent.includes("state.side = \"player\""), "opponent turn should return control to player");
assert.ok(opponent.includes("state.remainingMoves = field.units.filter((u) => isRomeUnit(u) && sectionForCol(u.col) === maneuver.section).length"), "advance moves should no longer roll 1d6 and should count all units in section");
assert.ok(!opponent.includes("showDice([state.remainingMoves], maneuver.id)"), "advance maneuvers should not show unit-count dice");
assert.ok(opponent.includes("originalLineIds"), "line brigade should preserve the original line even if it breaks");
assert.ok(opponent.includes("state.activeManeuver?.kind === \"berserk\""), "berserk should have a dedicated attack flow");
assert.ok(opponent.includes("maneuver?.kind === \"scout\""), "scout should keep intuitive three-space movement");
assert.ok(opponent.includes("duration: reason === \"actionPoints\" ? 3200 : 2600"), "dice should animate slower");
assert.ok(opponent.includes("t*TAU*2.5"), "dice should roll more aggressively across the board");
assert.ok(opponent.includes("const range = 0x100000000"), "dice should use correct uint32 range for d6 rolls");
assert.ok(opponent.includes("const limit = range - (range % 6)"), "dice should use correct rejection limit for unbiased d6 rolls");
assert.ok(opponent.includes("host.startManeuver"), "opponent controller should patch GameHost maneuver entrypoint");
assert.ok(opponent.includes("host.rollActionPointsInPlace"), "opponent controller should patch GameHost roll entrypoint");
assert.ok(opponent.includes("getTacticalSnapshot"), "opponent controller should expose tactical snapshots");

assert.ok(actionUi.includes("All left-third units"), "Advance Left card should say all left-third units");
assert.ok(actionUi.includes("All center-third units"), "Advance Center card should say all center-third units");
assert.ok(actionUi.includes("All right-third units"), "Advance Right card should say all right-third units");
assert.ok(actionUi.includes("Original adjacent line"), "Line Brigade card should explain original-line movement");
assert.ok(!actionUi.includes("1d6 units"), "Action UI should no longer say advances roll 1d6 units");
assert.ok(actionUi.includes("Enemy thinking"), "Action UI should show enemy turn phase");

assert.ok(endpoint.includes("hex-opponent-ai-pass.js"), "live endpoint should load opponent AI pass");
assert.ok(experimentEntry.includes("hex-opponent-ai-pass.js"), "experiment entry should load opponent AI pass");

console.log("Cavalry opponent AI static smoke passed.");
