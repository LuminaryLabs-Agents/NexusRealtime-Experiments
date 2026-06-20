import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const root = process.cwd();

assert.ok(aaaBatchGames.length > 20, `AAA registry should remain uncapped, got ${aaaBatchGames.length}`);

for (const game of aaaBatchGames) {
  const indexPath = join(root, "experiments", game.id, "index.html");
  assert.ok(existsSync(indexPath), `${game.id} should have generated experiments/<slug>/index.html`);
  const html = readFileSync(indexPath, "utf8");
  assert.ok(html.includes(`data-game-id="${game.id}"`), `${game.id} flat wrapper should declare its game id`);
  assert.ok(html.includes("startFlatAaaExperimentRoute"), `${game.id} flat wrapper should use the shared flat route helper`);
}

console.log(`Flat experiment route smoke passed for ${aaaBatchGames.length} generated AAA registry routes.`);
