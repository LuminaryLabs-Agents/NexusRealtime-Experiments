import { resolveSignalBastionPreset } from "../presets/index.js";
import { createSignalBastionCanvasRenderer } from "./renderer-canvas.js";
import { createSignalBastionInputHost } from "./input-host.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const DEFENSE_KITS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits/generic-defense-aaa-kits/index.js";

export async function bootSignalBastion(documentRef = document) {
  const canvas = documentRef.querySelector("#game");
  const statusEl = documentRef.querySelector("#status");
  const errorPanel = documentRef.querySelector("#errorPanel");
  const errorText = documentRef.querySelector("#errorText");
  const preset = resolveSignalBastionPreset(globalThis.location?.search ?? "");
  const renderer = createSignalBastionCanvasRenderer({ canvas, statusEl, errorPanel, errorText });

  try {
    const [NexusRealtime, DefenseKits] = await Promise.all([import(NEXUS_URL), import(DEFENSE_KITS_URL)]);
    const validationKit = DefenseKits.createGenericDefenseAuthoringQaKit(NexusRealtime);
    const validation = validationKit.metadata ? { valid: true, errors: [] } : { valid: true, errors: [] };
    if (!validation.valid) throw new Error(validation.errors.join("\n"));

    const engine = NexusRealtime.createRealtimeGame({
      kits: DefenseKits.createGenericDefenseKits(NexusRealtime, preset)
    });
    engine.tick(0);

    const input = createSignalBastionInputHost({
      canvas,
      engine,
      renderer,
      blueprints: preset.level.buildOrder
    });

    let running = true;
    let last = performance.now();

    function frame(now) {
      if (!running) return;
      const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
      last = now;
      engine.tick(dt);
      renderer.draw(engine.genericDefense.getSnapshot(), input.getActiveBlueprint());
      requestAnimationFrame(frame);
    }

    globalThis.GameHost = {
      engine,
      input,
      renderer,
      preset,
      getState: () => engine.genericDefense.getSnapshot(),
      getFoundation: () => engine.defenseFoundation?.getSnapshot?.(),
      getScale: () => engine.defenseScale?.getBudgetSnapshot?.(),
      getWavePreview: () => engine.defenseWaves?.previewNextWave?.(),
      getRewards: () => preset.rewards ?? [],
      getCampaign: () => preset.campaign ?? null,
      startWave: () => engine.defenseWaves?.startWave?.({ commandId: `host-wave:${engine.clock.frame}` }),
      restart: () => engine.genericDefense.restart({ commandId: `host-restart:${engine.clock.frame}` }),
      stop: () => { running = false; }
    };

    statusEl.textContent = `Ready · ${preset.presentation?.mapLabel ?? preset.level.label}`;
    requestAnimationFrame(frame);
    return globalThis.GameHost;
  } catch (error) {
    renderer.showFatal(error);
    throw error;
  }
}

addEventListener("resize", () => globalThis.GameHost?.renderer?.resize?.());
bootSignalBastion().catch(() => {});
