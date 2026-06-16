import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("experiments/fogline-relay/src/main.js", "utf8");
const threeRenderer = readFileSync("experiments/fogline-relay/src/three-renderer.js", "utf8");
const canvasRenderer = readFileSync("experiments/fogline-relay/src/renderer.js", "utf8");
const html = readFileSync("experiments/fogline-relay/index.html", "utf8");

assert.ok(main.includes("createThreeRenderer"), "Fogline main should import the Three/WebGL renderer");
assert.ok(main.includes("createPreferredRenderer"), "Fogline main should prefer Three and fallback safely");
assert.ok(main.includes("createCanvasRenderer"), "Fogline main should keep Canvas fallback");
assert.ok(main.indexOf("createThreeRenderer") < main.indexOf("createCanvasRenderer") || main.includes("await createThreeRenderer"), "Fogline should attempt Three before fallback Canvas drawing");

assert.ok(threeRenderer.includes("THREE_URL"), "Three renderer should load Three as the 3D renderer dependency");
assert.ok(threeRenderer.includes("WebGLRenderer"), "Three renderer should create a WebGL renderer");
assert.ok(threeRenderer.includes("PerspectiveCamera"), "Three renderer should use a perspective camera");
assert.ok(threeRenderer.includes("FogExp2"), "Three renderer should use real scene fog");
assert.ok(threeRenderer.includes("makeTerrain"), "Three renderer should create terrain geometry");
assert.ok(threeRenderer.includes("makeRelay"), "Three renderer should create relay meshes");
assert.ok(threeRenderer.includes("makeGate"), "Three renderer should create gate meshes");
assert.ok(threeRenderer.includes("makeWraith"), "Three renderer should create wraith meshes");
assert.ok(threeRenderer.includes("makeTree"), "Three renderer should create tree/prop meshes");
assert.ok(threeRenderer.includes("syncObjects"), "Three renderer should bind gameplay snapshots to scene objects");
assert.ok(threeRenderer.includes("forwardFromYaw"), "Three renderer should drive camera direction from player yaw");

assert.ok(canvasRenderer.includes('canvas.getContext("2d")'), "legacy Canvas renderer should remain as fallback");
assert.ok(html.includes('<canvas id="game"'), "Fogline page should keep the same canvas host");

console.log("Fogline Three renderer smoke passed.");
