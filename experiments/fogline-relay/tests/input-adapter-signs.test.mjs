import assert from "node:assert/strict";

const windowListeners = new Map();
function addWindowListener(type, handler) {
  if (!windowListeners.has(type)) windowListeners.set(type, []);
  windowListeners.get(type).push(handler);
}
function fireWindow(type, event = {}) {
  for (const handler of windowListeners.get(type) ?? []) {
    handler({ preventDefault() {}, ...event });
  }
}

globalThis.window = { addEventListener: addWindowListener };

const canvasListeners = new Map();
const canvas = {
  addEventListener(type, handler) {
    if (!canvasListeners.has(type)) canvasListeners.set(type, []);
    canvasListeners.get(type).push(handler);
  },
  requestPointerLock() {
    globalThis.document.pointerLockElement = canvas;
  }
};

globalThis.document = { pointerLockElement: canvas };

const { createInputAdapter } = await import("../src/input-adapter.js");
const adapter = createInputAdapter({ canvas });
const payloads = [];
const engine = {
  foglineRelay: {
    input(payload) {
      payloads.push(payload);
    }
  }
};

function flush() {
  const payload = adapter.flush(engine);
  assert.equal(payloads.at(-1), payload, "flush returns the same payload it sends to the engine");
  return payload;
}

function press(key) {
  fireWindow("keydown", { key });
}

function releaseAll() {
  fireWindow("blur");
}

{
  press("a");
  const payload = flush();
  assert.equal(payload.moveX, 1, "A must send positive strafe after live feel correction");
  assert.equal(payload.moveZ, 0, "A must not affect forward/back");
  releaseAll();
}

{
  press("d");
  const payload = flush();
  assert.equal(payload.moveX, -1, "D must send negative strafe after live feel correction");
  assert.equal(payload.moveZ, 0, "D must not affect forward/back");
  releaseAll();
}

{
  press("w");
  const payload = flush();
  assert.equal(payload.moveX, 0, "W must not affect strafe");
  assert.equal(payload.moveZ, 1, "W remains forward");
  releaseAll();
}

{
  press("s");
  const payload = flush();
  assert.equal(payload.moveX, 0, "S must not affect strafe");
  assert.equal(payload.moveZ, -1, "S remains backward");
  releaseAll();
}

{
  fireWindow("mousemove", { movementX: 10, movementY: 0 });
  const payload = flush();
  assert.equal(payload.turn, -0.026, "positive mouse delta X must produce negative yaw delta");
}

{
  fireWindow("mousemove", { movementX: -10, movementY: 0 });
  const payload = flush();
  assert.equal(payload.turn, 0.026, "negative mouse delta X must produce positive yaw delta");
}

{
  press("ArrowRight");
  const payload = flush();
  assert.equal(payload.turn, -0.045, "ArrowRight follows corrected mouse-right yaw sign");
  releaseAll();
}

{
  press("ArrowLeft");
  const payload = flush();
  assert.equal(payload.turn, 0.045, "ArrowLeft follows corrected mouse-left yaw sign");
  releaseAll();
}

console.log("Fogline Relay input adapter signs match live first-person feel correction.");
