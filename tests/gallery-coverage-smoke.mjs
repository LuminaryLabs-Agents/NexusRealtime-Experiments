import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { apps, tabs } from "../experiments/_shared/nexus-gallery-data.js";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const roots = ["experiments", "apps", "games"];
const ignore = new Set(["_shared", "aaa-batch", "assets"]);
const promotedAppIds = new Set(aaaBatchGames.map((app) => app.id));

function shouldSkip(root, entryName) {
  if (ignore.has(entryName) || entryName.startsWith(".")) return true;
  return root === "experiments" && promotedAppIds.has(entryName);
}

function discoverRoutes() {
  const routes = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || shouldSkip(root, entry.name)) continue;
      const indexPath = join(root, entry.name, "index.html");
      if (!existsSync(indexPath)) continue;
      routes.push(`./${root}/${entry.name}/`);
    }
  }
  return Array.from(new Set(routes)).sort();
}

const actualRoutes = discoverRoutes();
const galleryRoutes = apps.map((app) => app.route).sort();

assert.ok(tabs.length >= 1, "gallery tabs must be generated");
assert.equal(tabs[0].id, "experiments", "first tab must be experiments");
assert.ok(actualRoutes.length > 21, `expected more than 21 discoverable routes, found ${actualRoutes.length}`);
assert.deepEqual(galleryRoutes, actualRoutes, "gallery data must include every real experiment/app route and no missing route");

for (const app of apps) {
  assert.ok(app.id, "gallery item is missing id");
  assert.ok(app.title, `${app.id} is missing title`);
  assert.ok(app.kind, `${app.id} is missing kind`);
  assert.ok(app.subtype, `${app.id} is missing subtype`);
  assert.ok(app.tab, `${app.id} is missing tab`);
  assert.ok(app.description, `${app.id} is missing description`);
  assert.ok(Array.isArray(app.tags), `${app.id} tags must be an array`);
  assert.ok(existsSync(join(app.route.replace(/^\.\//, ""), "index.html")), `${app.id} points at a missing route ${app.route}`);
}

const experimentRoutes = apps.filter((app) => app.tab === "experiments");
assert.ok(experimentRoutes.length > 0, "experiments tab must list experiments");
assert.ok(experimentRoutes.every((app) => app.route.startsWith("./experiments/")), "experiments tab must contain experiment routes first");
assert.ok(apps.some((app) => app.route.startsWith("./apps/")), "gallery must include promoted application routes under apps/");
assert.ok(!apps.some((app) => app.route.startsWith("./experiments/") && promotedAppIds.has(app.id)), "promoted app ids must not appear as experiment routes");

const onnx = apps.find((app) => app.id === "onnx-agent-lab");
assert.ok(onnx, "onnx-agent-lab must remain listed");
assert.match(onnx.title, /ONNX Companion Workshop|ONNX Agent/i);
assert.doesNotMatch(onnx.description, /distilgpt2/i, "ONNX gallery description must not describe the old distilgpt2 chat shell");
assert.doesNotMatch(readFileSync("index.html", "utf8"), /tropical-island-scene-20260619/, "index shell cache buster must not be stale");

console.log(`gallery-coverage-smoke.mjs passed with ${actualRoutes.length} routes across ${tabs.length} tabs`);
