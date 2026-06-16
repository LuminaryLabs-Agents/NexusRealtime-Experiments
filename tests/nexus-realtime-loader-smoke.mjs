import assert from "node:assert/strict";
import {
  NexusRealtimeLoader,
  createNexusRealtimeBootTracker,
  loadNexusRealtimeExperiment
} from "../experiments/_shared/nexus-realtime-loader.js";

const tracker = createNexusRealtimeBootTracker({
  label: "Smoke Loader",
  steps: ["page", "nexus", "game", "start", "ready"]
});

await tracker.track("page", "Preparing page", async () => true);
await tracker.track("nexus", "Loading NexusRealtime", async () => ({ ok: true }));
const snapshot = tracker.snapshot();
assert.equal(snapshot.completed, 2, "tracker should count completed steps");
assert.ok(snapshot.elapsedMs >= 0, "tracker should report elapsed time");

const calls = [];
const host = await loadNexusRealtimeExperiment({
  title: "Smoke Experiment",
  nexusUrl: "nexus:mock",
  gameUrl: "game:mock",
  hideOverlay: true,
  globalObject: {},
  overlay: {
    attach() {},
    update() {},
    hide() {},
    fail(error) { throw error; }
  },
  importModule: async (url) => {
    calls.push(url);
    if (url === "nexus:mock") return { createRealtimeGame: () => ({}) };
    if (url === "game:mock") return {
      start: async ({ NexusRealtime, tracker: bootTracker }) => ({
        engine: NexusRealtime.createRealtimeGame(),
        boot: bootTracker.snapshot()
      })
    };
    throw new Error(`unexpected import ${url}`);
  }
});

assert.deepEqual(calls, ["nexus:mock", "game:mock"], "loader should import runtime then game");
assert.ok(host.engine, "loader should return a GameHost-like host");
assert.equal(typeof host.getBootState, "function", "host should expose boot state");
assert.equal(NexusRealtimeLoader.loadExperiment, loadNexusRealtimeExperiment, "namespace export should expose loader");

console.log("Nexus Realtime Loader smoke passed.");
