import {
  createNexusRealtimeBootTracker,
  createNexusRealtimeLoadingOverlay
} from "./nexus-realtime-loader.js";

function waitFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function attachNexusRealtimePageLoader(options = {}) {
  const tracker = createNexusRealtimeBootTracker({ label: options.title ?? "Nexus Realtime Loader" });
  const overlay = createNexusRealtimeLoadingOverlay({ document: options.document ?? globalThis.document });
  const target = options.globalObject ?? globalThis;
  const timeoutMs = Number(options.timeoutMs ?? 20000);
  const hideDelayMs = Number(options.hideDelayMs ?? 220);
  const isReady = options.isReady ?? (() => Boolean(target.GameHost));

  overlay.attach();
  const unsubscribe = tracker.subscribe((state) => overlay.update(state));

  async function run() {
    const startedAt = performance.now();
    try {
      tracker.start("page", "Preparing page");
      tracker.done("page");
      tracker.start("game", options.loadingLabel ?? "Loading experiment");

      while (!isReady()) {
        if (performance.now() - startedAt > timeoutMs) {
          throw new Error(`${options.title ?? "Experiment"} did not expose GameHost before timeout.`);
        }
        await waitFrame();
      }

      tracker.done("game");
      tracker.done("first-frame", { label: "First frame ready" });
      tracker.done("ready", { label: "Ready" });

      target.GameHost = {
        ...(target.GameHost ?? {}),
        nexusRealtimeLoader: tracker,
        getBootState: tracker.snapshot
      };

      setTimeout(() => {
        overlay.hide();
        unsubscribe();
      }, hideDelayMs);
    } catch (error) {
      tracker.fail("game", error);
      overlay.fail(error);
      unsubscribe();
    }
  }

  run();
  return { tracker, overlay };
}

export default attachNexusRealtimePageLoader;
