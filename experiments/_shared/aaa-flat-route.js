import { startAaaBatchRoute } from "../aaa-batch/host/batch-host.js";

export function startFlatAaaExperimentRoute(slug = document.body?.dataset?.gameId) {
  if (!slug) throw new Error("Missing flat AAA experiment slug.");
  startAaaBatchRoute(slug);
}
