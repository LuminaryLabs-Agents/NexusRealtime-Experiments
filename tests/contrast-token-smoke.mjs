import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assertIncludes(path, needle, label = needle) {
  const text = read(path);
  if (!text.includes(needle)) throw new Error(`${path} is missing ${label}`);
}

function assertNotIncludes(path, needle, label = needle) {
  const text = read(path);
  if (text.includes(needle)) throw new Error(`${path} still contains ${label}`);
}

function assertMatch(path, pattern, label) {
  const text = read(path);
  if (!pattern.test(text)) throw new Error(`${path} did not match ${label}`);
}

const shellPath = "experiments/_shared/nexus-experiments-shell.js";
const perfOverridePath = "experiments/_shared/arcade-gloss-overrides.js";
const generatorPath = "scripts/generate-application-routes.mjs";
const runtimeGeneratedPath = "apps/_shared/generated-app-route.js";
const rendererPath = "experiments/aaa-batch/host/canvas-renderer.js";
const meadowPath = "experiments/high-fidelity-meadow/index.html";
const openAbovePath = "experiments/the-open-above-harness/index.html";

assertIncludes(shellPath, "--contrast-panel", "contrast panel token");
assertIncludes(shellPath, "--contrast-text", "contrast text token");
assertIncludes(shellPath, ".nexus-route-desc", "route description contrast styling");
assertMatch(shellPath, /\.nexus-route-desc\s*\{[^}]*opacity:\.(9[0-9]|88)/s, "route descriptions at or above .88 opacity");
assertIncludes(shellPath, "nexus-contrast-boost", "contrast boost shell class");
assertIncludes(shellPath, "outline:3px solid rgba(255,245,180,.86)", "high contrast focus outline");
assertIncludes(shellPath, "@keyframes zipperCardIn", "zipper card entrance animation");
assertIncludes(shellPath, "--zipper-delay", "staggered zipper delay variable");
assertIncludes(shellPath, "--zipper-side", "alternating zipper side variable");
assertIncludes(shellPath, "is-even", "even arcade row class");
assertIncludes(shellPath, "is-odd", "odd arcade row class");
assertIncludes(shellPath, "--arcade-road", "arcade rainbow road token");
assertIncludes(shellPath, "min-height:clamp(122px,16vh,168px)", "tall arcade row height");

assertIncludes(perfOverridePath, "nexus-arcade-performance-overrides", "performance override style id");
assertIncludes(perfOverridePath, "--arcade-card-height: clamp(320px, 42vh, 460px)", "extra-tall arcade card token");
assertIncludes(perfOverridePath, "@keyframes zipperSwoopIn", "transform-only swoop entrance animation");
assertIncludes(perfOverridePath, "rotateZ(var(--swoop-rotation))", "angled card entrance rotation");
assertIncludes(perfOverridePath, "body::before", "background pseudo layer override");
assertIncludes(perfOverridePath, "opacity: 0 !important", "disabled heavy pseudo layers");
assertIncludes(perfOverridePath, "content-visibility: auto", "row content visibility optimization");
assertIncludes(perfOverridePath, "contain: layout style paint", "row containment optimization");
assertIncludes(perfOverridePath, "backdrop-filter: none !important", "removed frosted glass backdrop filters");
assertIncludes(perfOverridePath, "background: var(--candy-chip)", "bright non-dark text chips");
assertIncludes(perfOverridePath, "--candy-panel", "bright candy panel styling");
assertIncludes(perfOverridePath, "getCenteredArcadeRow", "center-most row selection helper");
assertIncludes(perfOverridePath, "applyCenteredArcadeSelection", "center selection applier");
assertIncludes(perfOverridePath, "scrollArcadeRowToCenter", "center scroll helper");
assertIncludes(perfOverridePath, "stopImmediatePropagation", "arrow key override for center-based navigation");
assertIncludes(perfOverridePath, "window.innerHeight * 0.5", "viewport center selection math");
assertNotIncludes(perfOverridePath, "filter: blur", "blur filters in performance override");
assertNotIncludes(perfOverridePath, "mix-blend-mode: screen", "screen blend mode in performance override");

assertIncludes(generatorPath, "--hud-bg:rgba(4,3,12,.88)", "generated high contrast HUD token");
assertIncludes(generatorPath, "#hud", "generated HUD style");
assertIncludes(generatorPath, "#err", "generated error style");
assertIncludes(runtimeGeneratedPath, "injectGeneratedRouteContrastStyles", "runtime generated route contrast injector");
assertIncludes(runtimeGeneratedPath, "--hud-bg: rgba(4,3,12,.88)", "runtime generated HUD token");

assertNotIncludes(rendererPath, "`${primary}55`", "low-alpha generated grid stroke");
assertIncludes(rendererPath, "`${primary}88`", "higher-alpha generated grid stroke");
assertIncludes(rendererPath, "createRadialGradient", "renderer vignette");
assertIncludes(rendererPath, "#fff6c7", "high contrast unsecured node stroke");
assertIncludes(rendererPath, "#11131a", "high contrast player outline");

assertNotIncludes(meadowPath, "background:rgba(5,10,7,.28)", "low-contrast meadow status background");
assertIncludes(meadowPath, "background:rgba(2,6,4,.78)", "high-contrast meadow status background");
assertIncludes(meadowPath, "--muted:#f2e7bd", "high-contrast meadow muted text");
assertIncludes(openAbovePath, "color:#10202a", "dark Open Above body fallback text");
assertIncludes(openAbovePath, "background:rgba(3,10,16,.82)", "high-contrast Open Above HUD background");

console.log("Contrast, arcade zipper, performance, and centered selection smoke checks passed.");
