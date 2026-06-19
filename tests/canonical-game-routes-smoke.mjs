import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { games, galleryConfig } from "../experiments/_shared/nexus-gallery-data.js";

const rootIndex = readFileSync("index.html", "utf8");
const shell = readFileSync("experiments/_shared/nexus-experiments-shell.js", "utf8");
const manifest = JSON.parse(readFileSync("experiments/domain-kit-cutover-manifest.json", "utf8"));

assert.ok(rootIndex.includes('id="app"'), "root index should keep only the app mount");
assert.ok(rootIndex.includes("nexus-experiments-shell.js"), "root index should load the data-driven gallery shell");
assert.ok(rootIndex.includes("./games/rogue-lite-hellscape-siege/"), "root noscript fallback should link the base Hellscape route");
assert.ok(!rootIndex.includes("./games/rogue-lite-hellscape-siege-v2/"), "root gallery should not link the legacy V2 route");
assert.ok(!/Play V2|>V2<|Rogue-Lite Hellscape Siege V2|rogue-lite-hellscape-siege-v2/.test(rootIndex), "root gallery should not advertise or link a V2 route");
assert.ok(!rootIndex.includes("gallery-wrap"), "root index should not keep the old gallery wrapper");
assert.ok(!rootIndex.includes("shader-bg"), "root index should not keep inline shader canvas markup");
assert.ok(!rootIndex.includes("data-filter"), "root gallery should not use filter buttons");

assert.ok(shell.includes("data-launch-selected"), "shell should expose a top launch-selected button");
assert.ok(shell.includes("is-selected"), "shell should use selected state for the scaled card");
assert.ok(shell.includes("--selected-scale"), "shell should visually scale selection without layout-width mutation");
assert.ok(!shell.includes("flex-basis:var(--selected)"), "selected card should not mutate layout width");
assert.ok(shell.includes("getNearestTile"), "shell should compute selected card from scroll position");
assert.ok(shell.includes("updateFromScroll"), "shell should update selected card while scrolling");
assert.ok(shell.includes("scheduleScrollUpdate"), "shell should schedule scroll-driven selection updates");
assert.ok(shell.includes("centerTile"), "shell should center selected cards for arrows/clicks");
assert.ok(shell.includes("dblclick"), "shell should support double-click launch for selected tiles");
assert.ok(!shell.includes("is-featured"), "shell should not keep static featured-card scaling");

assert.equal(galleryConfig.title, "Experiments", "gallery config should expose the product title");
assert.ok(galleryConfig.repoUrl.includes("NexusRealtime-Experiments"), "gallery config should expose the repo URL");
assert.equal(games.length, 21, "gallery data should expose the 20 canonical games plus the High Fidelity Meadow rendering route");
assert.ok(games.some((game) => game.id === "high-fidelity-meadow"), "gallery should include the High Fidelity Meadow rendering route");
assert.equal(games.filter((game) => game.featured).length, 1, "gallery should have exactly one initial featured route");

const galleryData = readFileSync("experiments/_shared/nexus-gallery-data.js", "utf8");
assert.ok(!galleryData.includes("aaaBatchGalleryGames"), "main gallery should not spread the full AAA batch registry");

const seenRoutes = new Set();
const seenIds = new Set();
const seenGenreTags = new Set();
for (const game of games) {
  assert.ok(game.id, "gallery games need ids");
  assert.ok(game.title, `${game.id} should have a title`);
  assert.ok(game.route, `${game.id} should have a route`);
  assert.ok(!/-v[0-9]+\/?$/.test(game.route), `${game.id} route should not be versioned`);
  assert.ok(Array.isArray(game.tags) && game.tags.length > 0, `${game.id} should have tags`);
  assert.ok(game.description, `${game.id} should have a description`);
  assert.ok(!seenIds.has(game.id), `${game.id} should not duplicate a gallery id`);
  assert.ok(!seenRoutes.has(game.route), `${game.id} should not duplicate a gallery route`);
  const primaryTag = game.tags[0]?.label;
  assert.ok(primaryTag, `${game.id} should have a primary genre tag`);
  assert.ok(!seenGenreTags.has(primaryTag), `${game.id} should not duplicate primary genre tag ${primaryTag}`);
  seenIds.add(game.id);
  seenRoutes.add(game.route);
  seenGenreTags.add(primaryTag);
  const routePath = game.route.replace(/^\.\//, "");
  assert.ok(existsSync(`${routePath}index.html`), `${game.id} route should have index.html`);
}

for (const entry of manifest.canonicalRoutes) {
  assert.ok(entry.id, "manifest entries need ids");
  assert.ok(entry.canonicalPath, `${entry.id} should declare a canonical path`);
  assert.ok(!/-v[0-9]+\/?$/.test(entry.canonicalPath), `${entry.id} canonical path should not be versioned`);
  assert.ok(Array.isArray(entry.domainCutover), `${entry.id} should list domain kit cutover targets`);
  assert.ok(entry.bridgeNeeded, `${entry.id} should list bridge/preset ownership`);
}

const baseIndex = readFileSync("games/rogue-lite-hellscape-siege/index.html", "utf8");
assert.ok(baseIndex.includes('src="./src/main.js"'), "base Hellscape route should own its entrypoint");
assert.ok(baseIndex.includes('id="game"'), "base Hellscape route should use the unified canvas id");

const baseMain = readFileSync("games/rogue-lite-hellscape-siege/src/main.js", "utf8");
assert.ok(baseMain.includes("makeGame") || baseMain.includes("createRealtimeGame"), "base Hellscape entrypoint should own the kit-shaped runtime composition");
assert.ok(!baseMain.includes("rogue-lite-hellscape-siege-v2"), "base Hellscape should not import the legacy V2 route");
assert.equal(existsSync("games/rogue-lite-hellscape-siege-v2/index.html"), false, "legacy V2 folder should not keep a playable index");

console.log("Canonical game route smoke passed.");
