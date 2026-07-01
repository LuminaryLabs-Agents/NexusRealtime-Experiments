import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const combat = readFileSync("experiments/The Cavalry of Rome/src/hex-combat-controller-pass.js", "utf8");
const actionUi = readFileSync("experiments/The Cavalry of Rome/src/hex-action-ui-pass.js", "utf8");
const endpoint = readFileSync("apps/the-cavalry-of-rome/index.html", "utf8");
const experimentEntry = readFileSync("experiments/The Cavalry of Rome/index.html", "utf8");

assert.ok(combat.includes("full-2d6-combat-ap-carryover-controller"), "combat controller should document combat style");
assert.ok(combat.includes("attack: { id: \"attack\""), "combat controller should define attack maneuver");
assert.ok(combat.includes("cost: 1, kind: \"attack\""), "attack should cost one AP");
assert.ok(combat.includes("canRollActionPoints"), "AP roll should be tracked once per player turn");
assert.ok(combat.includes("state.actionPoints += sum(faces)"), "AP rolls should carry over by adding to current AP");
assert.ok(combat.includes("state.canRollActionPoints = false"), "AP roll should disable after use");
assert.ok(combat.includes("passTurn"), "combat controller should expose pass turn");
assert.ok(combat.includes("concede"), "combat controller should expose concede");
assert.ok(combat.includes("rankAdvantage"), "combat controller should calculate rank advantage");
assert.ok(combat.includes("return 5"), "two-rank advantage should exist");
assert.ok(combat.includes("return 2"), "one-rank advantage should exist");
assert.ok(combat.includes("return a.troopType === \"light\" ? -4 : -6"), "range two penalties should be -4 for light and -6 otherwise");
assert.ok(combat.includes("resolveCombat"), "combat controller should resolve combat");
assert.ok(combat.includes("const aFaces = roll2d6(), dFaces = roll2d6()"), "combat should roll two 2d6 pools");
assert.ok(combat.includes("attackerTotal > defenderTotal"), "highest total should win combat");
assert.ok(combat.includes("loser.strength = Math.max(0, loser.strength - diff)"), "loser should lose strength equal to roll difference");
assert.ok(combat.includes("routed = true"), "units should be wiped out at zero strength");
assert.ok(combat.includes("DICE_TIMING"), "dice timing should be centralized");
assert.ok(combat.includes("holdFor: 3000"), "dice should hold still for three seconds after landing");
assert.ok(combat.includes("fadeFor: 1100"), "dice should fade after the hold window");
assert.ok(combat.includes("landAt: DICE_TIMING.landAt"), "dice should use explicit landing timing");
assert.ok(combat.includes("if(age>state.dice.holdUntil)"), "dice should remain stable until the hold window ends");
assert.ok(combat.includes("gameOver"), "combat controller should track win/loss state");
assert.ok(combat.includes("liveUnits(f, \"rome\").length <= 0"), "Rome wipeout should end game");
assert.ok(combat.includes("liveUnits(f, \"enemy\").length <= 0"), "enemy wipeout should end game");
assert.ok(combat.includes("reachableHexes"), "movement should remain constrained by reachable hexes");
assert.ok(combat.includes("state.activeManeuver?.kind === \"advance\""), "fixed advance movement should remain maneuver-bound");
assert.ok(combat.includes("state.activeManeuver?.kind === \"berserk\""), "Berserk movement should remain maneuver-bound");
assert.ok(combat.includes("host.passTurn = passTurn"), "GameHost should expose pass turn");
assert.ok(combat.includes("host.concedeBattle = concede"), "GameHost should expose concede");

assert.ok(actionUi.includes("Pass Turn"), "action UI should include pass turn button");
assert.ok(actionUi.includes("Concede"), "action UI should include concede button");
assert.ok(actionUi.includes("Attack"), "action UI should include attack card");
assert.ok(actionUi.includes("globalThis.GameHost?.passTurn"), "pass button should call GameHost.passTurn");
assert.ok(actionUi.includes("globalThis.GameHost?.concedeBattle"), "concede button should call GameHost.concedeBattle");
assert.ok(actionUi.includes("canRollInPlace"), "roll button should obey one-roll-per-turn availability");
assert.ok(actionUi.includes("card.disabled=locked||(action.id===\"rollAp\""), "Roll AP card should grey out when canRollInPlace is false");

assert.ok(endpoint.includes("hex-combat-controller-pass.js"), "live endpoint should load combat controller last");
assert.ok(experimentEntry.includes("hex-combat-controller-pass.js"), "experiment entry should load combat controller last");

console.log("Cavalry combat static smoke passed.");
