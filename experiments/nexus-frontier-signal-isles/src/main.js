import { signalIslesLevel01 } from "./level-01.js";
import { signalIslesPreset } from "./signal-isles-preset.js";
import { signalIslesSequences } from "./sequences.js";
import { createSignalIslesComposition } from "./game-composition.js";
import { createSignalIslesRenderer } from "./renderer.js";
import { createSignalIslesInputAdapter } from "./input-adapter.js";
import { createSignalIslesDebugHost } from "./debug-host.js";

const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const controlsEl = document.querySelector("#controls");
const errorPanel = document.querySelector("#errorPanel");
const errorText = document.querySelector("#errorText");

let running = true;
let lastTime = performance.now();
let composition = null;
let renderer = null;
let input = null;

function showFatal(error) {
  errorPanel.hidden = false;
  errorText.textContent = String(error?.stack ?? error?.message ?? error);
  console.error(error);
}

function formatStatus(snapshot) {
  const session = snapshot.session;
  const objective = snapshot.objective.current?.label ?? "Complete";
  const scans = snapshot.scanCompletedCount;
  const shards = session.resources["signal-shards"] ?? 0;
  const mode = session.completed ? "complete" : session.failed ? "failed" : session.phase;
  return `${objective} · ${mode} · scan ${scans}/3 · shards ${shards}`;
}

function updateHud(snapshot) {
  statusEl.textContent = formatStatus(snapshot);
  const rejection = composition.getLastRejection();
  controlsEl.textContent = rejection
    ? `Blocked: ${rejection.reason} · F/Mouse scan · E interact · B build · R reset`
    : "F/Mouse scan · E interact/harvest/cargo · B build · WASD move · R reset";
}

function frame(now) {
  if (!running) return;
  const delta = Math.min(signalIslesPreset.tuning.maxDelta, Math.max(0, (now - lastTime) / 1000 || 1 / 60));
  lastTime = now;

  input.flush(delta);
  composition.tick(delta);
  const snapshot = composition.getRenderSnapshot();
  renderer.draw(snapshot);
  updateHud(snapshot);

  requestAnimationFrame(frame);
}

async function boot() {
  composition = await createSignalIslesComposition({
    level: signalIslesLevel01,
    preset: signalIslesPreset,
    sequences: signalIslesSequences
  });

  renderer = await createSignalIslesRenderer({
    canvas,
    level: signalIslesLevel01,
    preset: signalIslesPreset
  });

  input = createSignalIslesInputAdapter({ canvas, composition, renderer });

  window.GameHost = createSignalIslesDebugHost({ composition, renderer, input });
  statusEl.textContent = "Restore signal · kit stack ready";
  controlsEl.textContent = "Click for pointer lock · F/Mouse scan · E interact · B build · R reset";

  requestAnimationFrame(frame);
}

window.addEventListener("beforeunload", () => {
  running = false;
  input?.dispose?.();
  renderer?.dispose?.();
});

boot().catch(showFatal);
