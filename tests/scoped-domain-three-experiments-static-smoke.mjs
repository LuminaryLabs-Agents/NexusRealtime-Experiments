// Smoke signature: NexusRealtime-scoped-domain-three-experiments::2026-06-20
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const routes = [
  "domain-arcane-duel",
  "domain-forest-weaver",
  "domain-wraith-bodies",
  "domain-zone-graph",
  "domain-mana-rift"
];

const composer = join(root, "experiments", "_shared", "scoped-domain-three-composer.js");
assert.ok(existsSync(composer), "shared scoped domain Three composer exists");
const composerText = readFileSync(composer, "utf8");
for (const kit of ["enemy-object-domain-kit", "enemy-agent-domain-kit", "damage-health-domain-kit", "guard-domain-kit", "parry-window-domain-kit", "mana-meter-domain-kit", "status-effect-domain-kit", "vegetation-placement-domain-kit", "route-clearance-domain-kit", "terrain-ground-contact-domain-kit", "world-zone-domain-kit", "interaction-domain-kit"]) {
  assert.ok(composerText.includes(kit), `composer imports ${kit}`);
}

for (const route of routes) {
  const file = join(root, "experiments", route, "index.html");
  assert.ok(existsSync(file), `${route} has index.html`);
  const html = readFileSync(file, "utf8");
  assert.ok(html.includes("scoped-domain-three-composer.js"), `${route} uses shared composer`);
  assert.ok(html.includes("startScopedDomainThreeExperiment"), `${route} starts scoped domain experiment`);
}

console.log(`Scoped domain Three experiment static smoke passed for ${routes.length} routes.`);
