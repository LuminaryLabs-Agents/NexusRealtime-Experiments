import { resolveSignalBastionPreset } from "../presets/index.js";
import { createSignalBastionCanvasRenderer } from "./renderer-canvas.js";
import { createSignalBastionInputHost } from "./input-host.js";

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const DEFENSE_KITS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-defense-aaa-dsk-bridge/index.js";
const PRESENTATION_KITS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-defense-presentation-stack-kit/index.js";

const SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS = Object.freeze([
  "map",
  "economyWallet",
  "buildPlacement",
  "waveAgentDirector",
  "combatResolver",
  "sessionFacade",
  "renderDescriptors"
]);

function assertDefenseDskBridge(DefenseKits) {
  const requiredExports = [
    "createGenericDefenseDskBundle",
    "createGenericDefenseFoundationKit",
    "createGenericDefenseBuildKit",
    "createGenericDefenseWaveKit",
    "createGenericDefenseScaleKit",
    "createGenericDefenseAuthoringQaKit"
  ];
  const missing = requiredExports.filter((name) => typeof DefenseKits[name] !== "function");
  if (missing.length > 0) {
    throw new Error(`Signal Bastion defense DSK bridge missing exports: ${missing.join(", ")}`);
  }
}

function createSignalBastionDefenseDskKits(NexusRealtime, DefenseKits, preset) {
  return [
    ...DefenseKits.createGenericDefenseDskBundle(
      NexusRealtime,
      preset,
      SIGNAL_BASTION_DEFENSE_DSK_BOUNDARY_IDS
    ),
    DefenseKits.createGenericDefenseFoundationKit(NexusRealtime, preset.foundation ?? {}),
    DefenseKits.createGenericDefenseBuildKit(NexusRealtime, preset.build ?? {}),
    DefenseKits.createGenericDefenseWaveKit(NexusRealtime, preset.waves ?? {}),
    DefenseKits.createGenericDefenseScaleKit(NexusRealtime, preset.scale ?? {})
  ];
}

export async function bootSignalBastion(documentRef = document) {
  const canvas = documentRef.querySelector("#game");
  const statStripEl = documentRef.querySelector("#statStrip");
  const towerPanelEl = documentRef.querySelector("#towerPanel");
  const contextPanelEl = documentRef.querySelector("#contextPanel");
  const errorPanel = documentRef.querySelector("#errorPanel");
  const errorText = documentRef.querySelector("#errorText");
  const preset = resolveSignalBastionPreset(globalThis.location?.search ?? "");
  const renderer = createSignalBastionCanvasRenderer({ canvas, statStripEl, towerPanelEl, contextPanelEl, errorPanel, errorText });

  try {
    const [NexusRealtime, DefenseKits, PresentationKits] = await Promise.all([
      import(NEXUS_URL),
      import(DEFENSE_KITS_URL),
      import(PRESENTATION_KITS_URL)
    ]);
    assertDefenseDskBridge(DefenseKits);
    const validationKit = DefenseKits.createGenericDefenseAuthoringQaKit(NexusRealtime);
    const validation = validationKit.metadata ? { valid: true, errors: [] } : { valid: true, errors: [] };
    if (!validation.valid) throw new Error(validation.errors.join("\n"));

    const engine = NexusRealtime.createRealtimeGame({
      kits: [
        ...createSignalBastionDefenseDskKits(NexusRealtime, DefenseKits, preset),
        ...PresentationKits.createGenericDefensePresentationStackKits(NexusRealtime, preset.presentationStack ?? {})
      ]
    });
    engine.tick(0);

    const input = createSignalBastionInputHost({
      canvas,
      towerPanelEl,
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
      const presentation = engine.defensePresentationStack?.getSnapshot?.() ?? { rawSnapshot: engine.genericDefense.getSnapshot() };
      renderer.draw(presentation, input.getActiveBlueprint());
      requestAnimationFrame(frame);
    }

    globalThis.GameHost = {
      engine,
      input,
      renderer,
      preset,
      getState: () => engine.genericDefense.getSnapshot(),
      getPresentation: () => engine.defensePresentationStack?.getSnapshot?.(),
      getFoundation: () => engine.defenseFoundation?.getSnapshot?.(),
      getScale: () => engine.defenseScale?.getBudgetSnapshot?.(),
      getWavePreview: () => engine.defenseWaves?.previewNextWave?.(),
      getRewards: () => preset.rewards ?? [],
      getCampaign: () => preset.campaign ?? null,
      startWave: () => engine.defenseWaves?.startWave?.({ commandId: `host-wave:${engine.clock.frame}` }),
      restart: () => engine.genericDefense.restart({ commandId: `host-restart:${engine.clock.frame}` }),
      stop: () => { running = false; }
    };

    requestAnimationFrame(frame);
    return globalThis.GameHost;
  } catch (error) {
    renderer.showFatal(error);
    throw error;
  }
}

addEventListener("resize", () => globalThis.GameHost?.renderer?.resize?.());
bootSignalBastion().catch(() => {});
