import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
import { createHandAuthoringDsks } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@v2/protokits/spatial-authoring-kits/index.js";
import { createSpatialRenderer } from "./renderer.js";
import { createWebXRHandInput } from "./hand-input.js";
import { createDskHandRouter } from "./dsk-router.js";
import { createInitialWorkspace } from "./workspace.js";

const status = document.querySelector("#status");
const errorPanel = document.querySelector("#errorPanel");
const enterButton = document.querySelector("#enterXR");
const canvas = document.querySelector("#xr-canvas");

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
  status.textContent = "Spatial Authoring Workbench failed to boot.";
}

function snapshot(engine) {
  return {
    scene: engine.spatialScene?.getState?.(),
    selection: engine.selection?.getState?.(),
    gestures: engine.handGestures?.getState?.(),
    webxr: engine.webxrHandAdapter?.getState?.(),
    transform: engine.transforms?.getState?.(),
    widgets: engine.widgets?.getState?.(),
    interactions: engine.interactions?.getState?.(),
    persistence: engine.persistence?.getState?.()
  };
}

async function boot() {
  const engine = NexusRealtime.createRealtimeGame({
    kits: createHandAuthoringDsks(NexusRealtime, {
      scene: { sceneId: "spatial-authoring-workbench", objects: createInitialWorkspace() },
      webxrHand: { referenceSpace: "local-floor" },
      openxrHand: { referenceSpace: "local-floor" }
    })
  });

  const spatialRenderer = createSpatialRenderer({ canvas });
  const handInput = createWebXRHandInput({ renderer: spatialRenderer.renderer, spatialRenderer, status });
  const dskRouter = createDskHandRouter({ engine, spatialRenderer, status });

  window.GameHost = {
    engine,
    spatialRenderer,
    handInput,
    dskRouter,
    getState: () => snapshot(engine),
    tick(dt = 1 / 60) {
      engine.tick(dt);
      spatialRenderer.draw(snapshot(engine));
      return snapshot(engine);
    },
    save() {
      engine.persistence?.capture?.("manual-save");
      engine.tick(1 / 60);
      return engine.persistence?.getState?.();
    }
  };

  status.textContent = "Ready. Enter XR, show hands, point at a panel, pinch to select and drag.";

  enterButton.addEventListener("click", async () => {
    if (!navigator.xr) {
      status.textContent = "WebXR is not available in this browser.";
      return;
    }
    const session = await navigator.xr.requestSession("immersive-vr", {
      optionalFeatures: ["hand-tracking", "local-floor", "bounded-floor"]
    });
    await spatialRenderer.renderer.xr.setSession(session);
    status.textContent = "XR session started. Waiting for hand tracking frames.";
  });

  let last = performance.now();
  spatialRenderer.renderer.setAnimationLoop((time, frame) => {
    const now = Number.isFinite(time) ? time : performance.now();
    const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
    last = now;
    const commands = handInput.read(frame);
    dskRouter.route(commands);
    engine.tick(dt);
    spatialRenderer.draw(snapshot(engine));
  });
}

boot().catch(showFatal);
