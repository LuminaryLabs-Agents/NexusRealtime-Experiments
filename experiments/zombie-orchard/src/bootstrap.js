import { createCanvasView } from "./canvas-view.js";
import { createHud } from "./hud.js";
import { createInputController } from "./input.js";
import { createZombieOrchardSession } from "./session.js";
import { startLoop } from "./runtime-loop.js";

async function createPreferredView(canvas) {
  try {
    const { createThreeView } = await import("./three-view.js");
    return await createThreeView(canvas);
  } catch (error) {
    console.warn("Three.js view failed; using Canvas fallback.", error);
    return createCanvasView(canvas);
  }
}

async function boot() {
  const game = createZombieOrchardSession();
  const input = createInputController(window);
  const view = await createPreferredView(document.querySelector("#orchard-canvas"));
  const hud = createHud();
  const loop = startLoop(game, input, view, hud);
  globalThis.GameHost = { game, engine: game.engine, input, view, hud, loop, getState: game.snapshot, tick: game.update };
}

boot().catch((error) => {
  console.error(error);
  const message = document.querySelector("#message");
  if (message) message.textContent = String(error?.stack ?? error?.message ?? error);
});
