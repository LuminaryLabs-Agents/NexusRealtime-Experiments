import { createCanvasView } from "./canvas-view.js";
import { createInputController } from "./input.js";
import { createZombieOrchardSession } from "./session.js";
import { startLoop } from "./runtime-loop.js";
const game = createZombieOrchardSession();
const input = createInputController(window);
const view = createCanvasView(document.querySelector("#orchard-canvas"));
startLoop(game, input, view, () => {});
