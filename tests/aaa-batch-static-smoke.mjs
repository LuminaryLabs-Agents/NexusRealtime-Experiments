import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { aaaBatchGames, aaaBatchGalleryGames } from "../experiments/aaa-batch/host/game-registry.js";
import { createAaaBatchGameHost } from "../experiments/aaa-batch/host/game-host.js";

assert.equal(aaaBatchGames.length, 100, "AAA batch should contain 100 GPT-specified games after final catalog buildout");
assert.equal(aaaBatchGalleryGames.length, aaaBatchGames.length, "gallery entries should match batch games");

const signatures = new Set();
for (const game of aaaBatchGames) {
  assert.ok(game.id && game.title && game.route, `${game.id} needs identity and route`);
  assert.ok(game.fantasy && game.verb && game.pressureLoop && game.visualIdentity, `${game.id} needs uniqueness fields`);
  assert.ok(Array.isArray(game.kitStack) && game.kitStack.length >= 4, `${game.id} needs meaningful kit stack`);
  assert.ok(existsSync(`experiments/aaa-batch/${game.id}/index.html`), `${game.id} should have route HTML`);
  assert.ok(existsSync(`experiments/aaa-batch/${game.id}/route.js`), `${game.id} should have route module`);
  const html = readFileSync(`experiments/aaa-batch/${game.id}/index.html`, "utf8");
  assert.ok(html.includes("nexus-realtime-page-loader.js"), `${game.id} should attach shared loader`);
  assert.ok(html.includes("role=\"application\""), `${game.id} should expose playable canvas`);
  signatures.add([game.fantasy, game.verb, game.pressureLoop, game.visualIdentity].join("|"));

  const host = createAaaBatchGameHost(game);
  const result = host.runSmoke();
  assert.equal(result.mode, "completed", `${game.id} smoke should complete`);
  assert.ok(result.progress >= 1, `${game.id} smoke should advance progress`);
  assert.ok(result.kitStack.length >= 4, `${game.id} should expose kit stack in GameHost`);
}

assert.equal(signatures.size, aaaBatchGames.length, "Batch games should not duplicate uniqueness signatures");

console.log("AAA batch static and GameHost smoke passed.");
