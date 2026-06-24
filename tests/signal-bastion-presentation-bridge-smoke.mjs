import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const spec = JSON.parse(readFileSync("experiments/signal-bastion-route-domain-replay.json", "utf8"));
const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
const inputHost = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");

function section(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing section start ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing section end ${endMarker}`);
  return source.slice(start, end);
}

assert.equal(spec.canonicalId, "signal-bastion", "presentation bridge smoke is scoped to Signal Bastion");
assert.equal(spec.scenarioLane, "strategic-pressure-loop", "presentation bridge should stay on the strategic-pressure lane");
assert.equal(spec.executionStatus, "executable-smoked-protokit-backed", "presentation bridge guard should build on the executable replay lane");
assert.match(spec.remainingGap, /presentation bridge hardening/, "remaining shrink gap should be presentation bridge hardening, not host simulation facades");
assert.match(spec.kitOwnership, /descriptor generation/, "spec should keep descriptor generation owned by ProtoKits");
assert.ok(
  spec.localJsReductionSignal.some((entry) => /Keep route JavaScript limited to browser input bridging, canvas\/HUD projection/.test(entry)),
  "local JS reduction notes should limit route code to browser input and presentation projection"
);
assert.ok(
  spec.routeHostBoundary.owns.includes("canvas draw projection") && spec.routeHostBoundary.owns.includes("HUD DOM projection"),
  "route host should own Canvas and HUD projection only"
);
assert.ok(
  spec.routeHostBoundary.mustNotOwn.includes("descriptor generation"),
  "route host must not own reusable descriptor generation"
);

assert.match(
  boot,
  /PresentationKits\.createGenericDefensePresentationStackKits\(NexusRealtime, preset\.presentationStack \?\? \{\}\)/,
  "boot should compose presentation stack kits from ProtoKits"
);
assert.match(boot, /function getSignalBastionPresentation\(engine\)/, "boot should keep a single presentation bridge helper");
assert.match(
  boot,
  /engine\.defensePresentationStack\?\.getSnapshot\?\.\(\) \?\? \{/,
  "presentation bridge should prefer the reusable presentation stack snapshot"
);
assert.match(
  boot,
  /rawSnapshot: getSignalBastionSessionFacade\(engine\)\?\.getSnapshot\?\.\(\)/,
  "presentation fallback should read raw state through the namespaced session facade"
);
assert.match(
  boot,
  /render: getSignalBastionRenderDescriptors\(engine\)\?\.getSnapshot\?\.\(\)/,
  "presentation fallback should read render descriptors through the namespaced descriptor boundary"
);

assert.match(inputHost, /function presentation\(\)/, "input host should centralize presentation reads for hit testing");
assert.match(
  inputHost,
  /engine\.defensePresentationStack\?\.getSnapshot\?\.\(\) \?\? \{/,
  "input host should prefer the presentation stack before fallback descriptor snapshots"
);
assert.match(
  inputHost,
  /renderer\.findHit\(renderer\.screenToWorld\(event\), presentation\(\)\)/,
  "input host should pass presentation snapshots into renderer hit tests"
);
assert.doesNotMatch(inputHost, /createRealtimeGame|createGenericDefense|Math\.random|Date\.now|crypto\.getRandomValues/, "input host should stay browser-input bridge code only");

assert.doesNotMatch(
  renderer,
  /engine\.|createRealtimeGame|createGenericDefense|sessionFacade|defensePresentationStack|getSnapshot\(/,
  "renderer should never reach into engine or reusable kit APIs"
);
assert.match(renderer, /function draw\(presentation, activeBlueprint = "bolt"\)/, "renderer draw should consume a presentation object");
assert.match(renderer, /const ui = presentation\.ui \?\? \[\]/, "renderer UI should come from presentation UI descriptors");
assert.match(renderer, /renderStats\(ui\.find/, "stat strip should render descriptor entries");
assert.match(renderer, /renderTowerPanel\(ui\.find/, "tower panel should render descriptor entries");
assert.match(renderer, /renderContext\(ui\)/, "context panel should render descriptor entries");

const findHit = section(renderer, "function findHit", "function draw");
const rendererOutsideFindHit = renderer.replace(findHit, "");
assert.match(findHit, /presentation\?\.rawSnapshot \?\? presentation/, "hit testing may use the raw snapshot inside the renderer-only hit-test seam");
assert.match(findHit, /raw\?\.structures\?\.structures/, "hit testing should keep structure lookup local to pointer hit tests");
assert.match(findHit, /raw\?\.map\?\.slots/, "hit testing should keep slot lookup local to pointer hit tests");
assert.doesNotMatch(
  rendererOutsideFindHit,
  /raw\?\.(structures|agents|combat|economy|session|level)\b/,
  "renderer should not use raw simulation state outside the explicit pointer hit-test seam"
);
assert.doesNotMatch(
  renderer,
  /\.tick\(|dispatchEvent\(|\.emit\(|\.publish\(|\.setResource\(|\.writeResource\(/,
  "renderer should not tick or mutate reusable domain state"
);

console.log("Signal Bastion presentation bridge smoke passed.");
