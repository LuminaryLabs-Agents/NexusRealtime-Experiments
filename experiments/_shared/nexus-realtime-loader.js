const DEFAULT_STEPS = [
  "page",
  "nexus",
  "protokits",
  "visuals",
  "game",
  "start",
  "first-frame",
  "ready"
];

function now() {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

function normalizeStep(step) {
  if (typeof step === "string") return { id: step, label: step };
  return {
    id: String(step?.id ?? step?.label ?? "step"),
    label: String(step?.label ?? step?.id ?? "step")
  };
}

export function createNexusRealtimeBootTracker(options = {}) {
  const label = options.label ?? "Nexus Realtime Loader";
  const declared = (options.steps ?? DEFAULT_STEPS).map(normalizeStep);
  const startedAt = now();
  const records = [];
  const subscribers = new Set();

  function findRecord(id) {
    return records.find((record) => record.id === id);
  }

  function ensureRecord(id, title = id) {
    const step = normalizeStep({ id, label: title });
    let record = findRecord(step.id);
    if (!record) {
      record = {
        id: step.id,
        label: step.label,
        status: "pending",
        startedAt: null,
        endedAt: null,
        durationMs: 0,
        error: null
      };
      records.push(record);
    }
    return record;
  }

  function snapshot() {
    const completed = records.filter((record) => record.status === "done").length;
    const failed = records.find((record) => record.status === "failed") ?? null;
    const running = records.find((record) => record.status === "running") ?? null;
    const total = Math.max(declared.length, records.length, 1);
    return {
      label,
      startedAt,
      elapsedMs: Math.round(now() - startedAt),
      completed,
      total,
      progress: Math.min(1, completed / total),
      current: running ?? failed ?? records.at(-1) ?? null,
      failed,
      steps: records.map((record) => ({ ...record })),
      declared: declared.map((step) => ({ ...step }))
    };
  }

  function emit() {
    const state = snapshot();
    for (const subscriber of subscribers) subscriber(state);
    return state;
  }

  function start(id, title = id) {
    const record = ensureRecord(id, title);
    record.label = String(title ?? record.label);
    record.status = "running";
    record.startedAt = now();
    record.endedAt = null;
    record.durationMs = 0;
    record.error = null;
    return emit();
  }

  function done(id, payload = {}) {
    const record = ensureRecord(id, payload.label ?? id);
    record.status = "done";
    record.endedAt = now();
    record.durationMs = Math.round(record.endedAt - (record.startedAt ?? record.endedAt));
    record.error = null;
    record.payload = payload;
    return emit();
  }

  function fail(id, error) {
    const record = ensureRecord(id);
    record.status = "failed";
    record.endedAt = now();
    record.durationMs = Math.round(record.endedAt - (record.startedAt ?? record.endedAt));
    record.error = String(error?.stack ?? error);
    return emit();
  }

  async function track(id, title, task) {
    start(id, title);
    try {
      const result = await task();
      done(id);
      return result;
    } catch (error) {
      fail(id, error);
      throw error;
    }
  }

  return {
    label,
    start,
    done,
    fail,
    track,
    snapshot,
    subscribe(callback) {
      subscribers.add(callback);
      callback(snapshot());
      return () => subscribers.delete(callback);
    }
  };
}

export function createNexusRealtimeLoadingOverlay(options = {}) {
  const documentRef = options.document ?? globalThis.document;
  if (!documentRef?.createElement) {
    return {
      attach() {},
      update() {},
      hide() {},
      fail() {}
    };
  }

  const root = documentRef.createElement("section");
  root.setAttribute("aria-live", "polite");
  root.setAttribute("data-nexus-realtime-loader", "");
  root.innerHTML = `
    <style>
      [data-nexus-realtime-loader] {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        color: #eff8ff;
        background: radial-gradient(circle at 30% 20%, rgba(87,199,255,.18), transparent 34rem), linear-gradient(135deg, #03070b, #071321);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      [data-nexus-realtime-loader-card] {
        width: min(520px, calc(100vw - 36px));
        border: 1px solid rgba(125,206,255,.28);
        border-radius: 24px;
        padding: 22px;
        background: rgba(7,18,30,.88);
        box-shadow: 0 24px 80px rgba(0,0,0,.45);
      }
      [data-nexus-realtime-loader-title] {
        margin: 0 0 8px;
        color: #ffe36d;
        font-size: 13px;
        font-weight: 950;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      [data-nexus-realtime-loader-current] {
        margin: 0 0 16px;
        color: rgba(239,248,255,.82);
        font-size: 15px;
      }
      [data-nexus-realtime-loader-bar] {
        height: 8px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(125,206,255,.14);
      }
      [data-nexus-realtime-loader-fill] {
        display: block;
        width: 0%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #57c7ff, #ffe36d);
        transition: width 160ms ease;
      }
      [data-nexus-realtime-loader-detail] {
        margin: 12px 0 0;
        color: rgba(239,248,255,.58);
        font-size: 12px;
      }
      [data-nexus-realtime-loader][data-failed="true"] [data-nexus-realtime-loader-title] { color: #ff806c; }
    </style>
    <div data-nexus-realtime-loader-card>
      <h1 data-nexus-realtime-loader-title>Nexus Realtime Loader</h1>
      <p data-nexus-realtime-loader-current>Preparing page…</p>
      <div data-nexus-realtime-loader-bar><span data-nexus-realtime-loader-fill></span></div>
      <p data-nexus-realtime-loader-detail>0%</p>
    </div>
  `;

  const current = root.querySelector("[data-nexus-realtime-loader-current]");
  const fill = root.querySelector("[data-nexus-realtime-loader-fill]");
  const detail = root.querySelector("[data-nexus-realtime-loader-detail]");

  function attach(parent = documentRef.body) {
    if (!root.isConnected) parent.append(root);
  }

  function update(state) {
    const percent = Math.round((state.progress ?? 0) * 100);
    const step = state.current?.label ?? state.current?.id ?? "Preparing page";
    current.textContent = step;
    fill.style.width = `${percent}%`;
    detail.textContent = `${percent}% · ${state.completed}/${state.total} · ${state.elapsedMs}ms`;
    root.dataset.failed = state.failed ? "true" : "false";
    if (state.failed) current.textContent = `Failed: ${state.failed.label}`;
  }

  function hide() {
    root.remove();
  }

  function fail(error) {
    root.dataset.failed = "true";
    current.textContent = "Could not start experiment.";
    detail.textContent = String(error?.stack ?? error);
  }

  return { root, attach, update, hide, fail };
}

export async function loadNexusRealtimeExperiment(config = {}) {
  const tracker = config.tracker ?? createNexusRealtimeBootTracker({ label: config.title });
  const overlay = config.overlay ?? createNexusRealtimeLoadingOverlay({ document: config.document });
  overlay.attach?.();
  const unsubscribe = tracker.subscribe((state) => overlay.update?.(state));

  const importModule = config.importModule ?? ((url) => import(url));

  try {
    tracker.start("page", "Preparing page");
    tracker.done("page");

    const NexusRealtime = await tracker.track("nexus", "Loading NexusRealtime", () => importModule(config.nexusUrl));
    const ProtoKits = config.protoKitsUrl
      ? await tracker.track("protokits", "Loading ProtoKits", () => importModule(config.protoKitsUrl))
      : null;
    const Visuals = config.visualsUrl
      ? await tracker.track("visuals", "Loading visual systems", () => importModule(config.visualsUrl))
      : null;
    const Game = await tracker.track("game", "Loading experiment", () => importModule(config.gameUrl));

    const start = Game.start ?? Game.default;
    if (typeof start !== "function") {
      throw new TypeError("Experiment module must export start() or default start function.");
    }

    const host = await tracker.track("start", "Starting experiment", () => start({
      NexusRealtime,
      ProtoKits,
      Visuals,
      tracker,
      canvas: config.canvasSelector && (config.document ?? globalThis.document)?.querySelector?.(config.canvasSelector),
      document: config.document ?? globalThis.document,
      options: config.options ?? {}
    }));

    tracker.done("first-frame", { label: "First frame ready" });
    tracker.done("ready", { label: "Ready" });

    const target = config.globalObject ?? globalThis;
    target.GameHost = {
      ...(target.GameHost ?? {}),
      ...(host ?? {}),
      nexusRealtimeLoader: tracker,
      getBootState: tracker.snapshot
    };

    if (config.hideOverlay !== false) overlay.hide?.();
    unsubscribe?.();
    return target.GameHost;
  } catch (error) {
    overlay.fail?.(error);
    unsubscribe?.();
    throw error;
  }
}

export const NexusRealtimeLoader = Object.freeze({
  createBootTracker: createNexusRealtimeBootTracker,
  createLoadingOverlay: createNexusRealtimeLoadingOverlay,
  loadExperiment: loadNexusRealtimeExperiment
});
