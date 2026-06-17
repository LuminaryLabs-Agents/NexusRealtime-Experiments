import assert from "node:assert/strict";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";
import { createAaaBatchGameHost } from "../experiments/aaa-batch/host/game-host.js";

const stableFields = (state) => ({
  id: state.id,
  title: state.title,
  mode: state.mode,
  progress: state.progress,
  pressure: state.pressure,
  resource: state.resource,
  resources: state.resources,
  completed: state.completed,
  failed: state.failed,
  score: state.score,
  kitStack: state.kitStack
});

for (const game of aaaBatchGames) {
  assert.ok(game.id && game.title && game.routePath, `${game.id} should expose route identity`);
  assert.ok(game.controls, `${game.id} should describe controls`);
  assert.ok(game.palette.length >= 4, `${game.id} should expose a usable palette`);
  assert.ok(game.smokeActions.length === 3, `${game.id} should expose three smoke actions`);
  assert.ok(game.actions.length >= 3, `${game.id} should expose declared actions`);
  assert.ok(game.affordances.length >= 3, `${game.id} should expose declared affordances`);

  const host = createAaaBatchGameHost(game);
  assert.equal(typeof host.getState, "function", `${game.id} should expose getState`);
  assert.equal(typeof host.tick, "function", `${game.id} should expose tick`);
  assert.equal(typeof host.restart, "function", `${game.id} should expose restart`);
  assert.equal(typeof host.runSmoke, "function", `${game.id} should expose runSmoke`);

  const initial = host.getState();
  assert.equal(initial.mode, "active", `${game.id} should boot active`);
  assert.equal(typeof initial.pressure, "number", `${game.id} should expose pressure`);
  assert.ok(initial.resources?.primary, `${game.id} should expose resource loop state`);
  assert.equal(typeof initial.completed, "boolean", `${game.id} should expose completed flag`);
  assert.equal(typeof initial.failed, "boolean", `${game.id} should expose failed flag`);
  assert.ok(Array.isArray(initial.recentEvents), `${game.id} should expose recent events`);
  assert.ok(initial.affordances?.available?.length >= 3, `${game.id} should expose available affordance descriptors`);

  host.dispatch("__invalid_contract_action__");
  const rejected = host.getState();
  assert.match(rejected.lastRejectionReason, /unknown action/, `${game.id} should reject invalid input in GameHost`);
  assert.match(rejected.lastRejectionReason, /__invalid_contract_action__/, `${game.id} should keep stable rejection reason`);

  const invalidTargetHost = createAaaBatchGameHost(game);
  invalidTargetHost.dispatch(game.smokeActions[0], { targetId: "__missing_target__" });
  assert.match(invalidTargetHost.getState().lastRejectionReason, /affordance unavailable/, `${game.id} should reject invalid target affordance`);

  const first = createAaaBatchGameHost(game).runSmoke();
  const second = createAaaBatchGameHost(game).runSmoke();
  assert.deepEqual(stableFields(first), stableFields(second), `${game.id} smoke should be deterministic`);
  assert.equal(first.mode, "completed", `${game.id} smoke should complete`);

  const restarted = createAaaBatchGameHost(game).restart();
  assert.equal(restarted.getState().mode, "active", `${game.id} restart should return active host`);
}

console.log("AAA batch GameHost contract smoke passed.");
