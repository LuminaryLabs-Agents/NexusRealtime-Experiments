import { getAaaBatchGame } from "./game-registry.js";
import { createAaaBatchGameHost } from "./game-host.js";
import { createAaaBatchRenderer } from "./canvas-renderer.js";

function readSlug() {
  return document.body?.dataset?.gameId || new URLSearchParams(location.search).get("game") || "ember-rail";
}

export function startAaaBatchRoute(slug = readSlug()) {
  const game = getAaaBatchGame(slug);
  if (!game) throw new Error(`Unknown AAA batch game: ${slug}`);
  const canvas = document.querySelector("#game");
  const title = document.querySelector("#title");
  const status = document.querySelector("#status");
  const readout = document.querySelector("#readout");
  const err = document.querySelector("#err");
  let host = createAaaBatchGameHost(game);
  const renderer = createAaaBatchRenderer({ canvas, game, host });

  function updateHud() {
    const state = host.getState();
    title.textContent = game.title;
    status.textContent = `${game.verb} · ${state.mode} · ${Math.round(state.progress * 100)}%`;
    readout.textContent = `${game.controls} · Pressure ${Math.round(state.pressure)} · Resource ${Math.round(state.resource)} · ${game.kitStack.join(" + ")}`;
  }

  function dispatch(action, payload) {
    try {
      host.dispatch(action, payload);
      updateHud();
    } catch (error) {
      err.hidden = false;
      err.textContent = String(error?.stack || error);
    }
  }

  const keys = new Set();
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["a", "d", "w", "s", " ", "e", "q", "shift", "r", "1", "2", "3"].includes(key)) event.preventDefault();
    if (key === "r") {
      host = createAaaBatchGameHost(game);
      globalThis.GameHost = makePublicHost();
      return;
    }
    keys.add(key);
    if (key === "a") dispatch("switchLane", { direction: "left" });
    if (key === "d") dispatch("switchLane", { direction: "right" });
    if (key === " ") dispatch("jump");
    if (key === "e") dispatch(game.id === "starwell-cartographer" ? "recallAnchor" : "recover");
    if (key === "q") dispatch("scan");
    if (key === "shift") dispatch("burst");
    if (["1", "2", "3"].includes(key)) dispatch("selectWard", { value: key });
  });
  window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener("pointerdown", () => dispatch(game.id === "mirage-stalker" ? "blink" : game.id === "starwell-cartographer" ? "placeAnchor" : "fireTether"));

  function makePublicHost() {
    return {
      id: game.id,
      title: game.title,
      getState: () => host.getState(),
      getValidationState: () => host.getValidationState(),
      tick: (dt) => host.tick(dt),
      dispatch,
      runSmoke: () => host.runSmoke(),
      restart: () => {
        host = createAaaBatchGameHost(game);
        globalThis.GameHost = makePublicHost();
        return host.getState();
      }
    };
  }

  globalThis.GameHost = makePublicHost();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    host.tick(dt);
    renderer.draw();
    updateHud();
    requestAnimationFrame(frame);
  }
  updateHud();
  requestAnimationFrame(frame);
}
