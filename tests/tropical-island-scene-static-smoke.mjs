import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const htmlPath = join(root, "experiments", "tropical-island-scene", "index.html");
const mainPath = join(root, "experiments", "tropical-island-scene", "src", "main.js");
const removedFluidPath = join(root, "experiments", "fluid-water-lab", "index.html");

assert.ok(existsSync(htmlPath), "tropical-island-scene should expose index.html");
assert.ok(existsSync(mainPath), "tropical-island-scene should expose src/main.js");
assert.equal(existsSync(removedFluidPath), false, "fluid-water-lab route should be deleted");

const html = readFileSync(htmlPath, "utf8");
const main = readFileSync(mainPath, "utf8");

assert.match(html, /<main\b/i, "experiment should use a semantic main host");
assert.match(html, /<canvas\b/i, "experiment should include a canvas host");
assert.ok(main.includes('getContext("webgl2"'), "experiment should use WebGL2");
assert.ok(main.includes("FRAGMENT_SHADER"), "experiment should own a WebGL fragment shader");
assert.ok(main.includes("sobel"), "experiment should include Sobel outline review/render text");
assert.ok(main.includes("reviewComposition"), "experiment should expose a composition review loop");
assert.ok(main.includes("coconuts.length !== 3"), "review loop should enforce exactly three coconuts");
assert.ok(main.includes("reflectiveWater"), "review loop should enforce reflective water");
assert.ok(main.includes("horizonWater"), "review loop should enforce horizon water");
assert.ok(main.includes("window.GameHost"), "experiment should expose GameHost for state-first debugging");

for (const kit of [
  "island-kit",
  "palm-tree-kit",
  "coconut-prop-kit",
  "timer-kit",
  "fall-motion-kit",
  "fish-school-kit",
  "fish-motion-kit",
  "float-prop-kit",
  "float-motion-kit",
  "orbit-camera-kit",
  "cel-shading-kit",
  "outline-sobel-kit",
  "normal-style-kit",
  "reflect-probe-kit",
  "fluid-field-kit",
  "fluid-motion-kit",
  "fluid-shading-kit",
  "fluid-effects-kit",
  "water-mode-kit",
  "water-data-kit",
  "water-stream-kit",
  "water-surface-kit",
  "water-mesh-kit",
  "water-shading-kit",
  "water-physics-kit",
  "water-effects-kit"
]) {
  assert.ok(main.includes(`/protokits/${kit}/index.js`), `main.js should import ${kit}`);
}

assert.equal(main.includes("tropical-island-kit"), false, "kit names should not be app-named");
assert.equal(main.includes("tropical-isle-kit"), false, "kit names should not be app-named");

console.log("Tropical Island Scene static smoke passed.");
