import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const root = process.cwd();

assert.ok(aaaBatchGames.length > 20, `application registry should remain uncapped, got ${aaaBatchGames.length}`);

for (const app of aaaBatchGames) {
  const indexPath = join(root, "apps", app.id, "index.html");
  assert.ok(existsSync(indexPath), `${app.id} should have generated apps/<slug>/index.html`);
  const html = readFileSync(indexPath, "utf8");
  assert.ok(html.includes(`data-app-id="${app.id}"`), `${app.id} application wrapper should declare its app id`);
  assert.ok(html.includes("startGeneratedApplicationRoute"), `${app.id} application wrapper should use the shared generated app route helper`);
}

console.log(`Generated application route smoke passed for ${aaaBatchGames.length} promoted application routes.`);
