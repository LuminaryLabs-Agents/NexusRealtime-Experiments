import { NEXUS_URL, RENDER_LAYER_URL } from "./urls.js";
import { createFoglineRelayKit } from "./fogline-relay-kit.js";
import { createFoglineRelayLevel } from "./level.js";
import { createVisualSignals } from "./visual-signals.js";
import { DOMAIN_KITS_URL, createUnifiedDomainKits, syncUnifiedDomainState } from "../../_shared/domain-foundation.js";

function domainSnapshot(engine) {
  return {
    timedPressure: engine.timedPressure?.getSnapshot?.(),
    zoneField: engine.zoneField?.getSnapshot?.(),
    scanSurvey: engine.scanSurvey?.getSnapshot?.(),
    routeCheckpoint: engine.routeCheckpoint?.getSnapshot?.(),
    resourcePressure: engine.resourcePressure?.getSnapshot?.(),
    hazardDirector: engine.hazardDirector?.getSnapshot?.(),
    visualFidelity: engine.visualFidelity?.getSnapshot?.(),
    audioEventFeedback: engine.audioEventFeedback?.getSnapshot?.(),
    cameraCinematic: engine.cameraCinematic?.getSnapshot?.(),
    scenarioQa: engine.scenarioQa?.getSnapshot?.(),
    deterministicReplay: engine.deterministicReplay?.getSnapshot?.(),
    gamehostStandard: engine.gamehostStandard?.getSnapshot?.(),
    tokenRegistry: engine.tokenRegistry?.getSnapshot?.(),
    foglineSurveyPressure: engine.foglineSurveyPressure?.getSnapshot?.()
  };
}

export async function createFoglineRelaySession() {
  const [NexusRealtime, VisualPipeline, DomainKits] = await Promise.all([
    import(NEXUS_URL),
    import(RENDER_LAYER_URL),
    import(DOMAIN_KITS_URL)
  ]);

  const level = createFoglineRelayLevel();
  const visualPreset = VisualPipeline.createFoglineVisualPreset();
  const domainKits = createUnifiedDomainKits(NexusRealtime, DomainKits, {
    prefix: "fogline-relay",
    presetId: level.id,
    includeFoglineBridge: true,
    relayTargetIds: (level.relays ?? []).map((relay) => relay.id),
    durationSeconds: 480,
    visualProfile: "fogline-relay",
    zoneX: 0,
    zoneY: 20,
    zoneRadius: 999,
    zoneEffects: [{ id: "corruption", amountPerSecond: 0.03, threshold: 1 }],
    consumes: ["scan:survey", "zone:field", "pressure:timed"],
    provides: ["experiment:fogline-relay"]
  });
  const realismKit = NexusRealtime.createRealismKit({
    id: "fogline-realism-kit",
    preset: visualPreset,
    quality: "high"
  });
  const forestKit = NexusRealtime.createForestPlacementKit({
    id: "fogline-forest-placement-kit",
    seed: "fogline-relay-forest",
    route: level.route,
    focus: level.spawn,
    activeRadius: 2,
    chunkSize: 18,
    placementsPerChunk: 8,
    routeSafeWidth: 5,
    routeAccentWidth: 12
  });
  const foglineKit = createFoglineRelayKit(NexusRealtime, {
    kitId: "fogline-relay-kit",
    level,
    objectiveFlowAction: NexusRealtime.ObjectiveFlowAction,
    objectiveFlowReset: NexusRealtime.ObjectiveFlowReset
  });
  const renderLayerKit = VisualPipeline.createRenderLayerKit(NexusRealtime, {
    id: "fogline-render-layer-kit",
    renderDescriptorResource: NexusRealtime.RenderDescriptorState,
    realismSnapshotResource: realismKit.definitions.resources.RealismSnapshot,
    extraObjectResources: [forestKit.resources.ForestPlacementSnapshot],
    preset: visualPreset,
    quality: "high"
  });

  const engine = NexusRealtime.createRealtimeGame({
    kits: [
      NexusRealtime.createRenderDescriptorKit({ ...level, id: "fogline-render-descriptor-kit" }),
      realismKit,
      forestKit,
      renderLayerKit,
      NexusRealtime.createInteractionTargetKit({ id: "fogline-interaction-target-kit", sceneRecipe: level.sceneRecipe }),
      ...domainKits,
      foglineKit,
      NexusRealtime.createObjectiveFlowKit({
        id: "fogline-objective-flow-kit",
        objectiveDataset: {
          id: level.id,
          steps: level.steps,
          completion: { label: "Relay restored" }
        }
      })
    ]
  });

  function prepareFrame() {
    const game = engine.foglineRelay.getState();
    syncUnifiedDomainState(engine, { level, game }, {
      label: "fogline-relay",
      scanRadius: 4,
      scanAmount: 0.08,
      zoneX: 0,
      zoneY: 20,
      zoneRadius: 999,
      zoneEffects: [{ id: "corruption", amountPerSecond: 0.03, threshold: 1 }],
      visualProfile: "fogline-relay",
      cameraMode: "first-person",
      consumes: ["scan:survey", "zone:field", "pressure:timed"],
      provides: ["experiment:fogline-relay"]
    });
    engine.visualPipeline.setViewer({ x: game.player.x, y: 1.6, z: game.player.z });
    engine.visualPipeline.setSignals(createVisualSignals(game));
  }

  function snapshot() {
    return {
      level,
      clock: engine.clock,
      game: engine.foglineRelay.getState(),
      objective: engine.objectiveFlow?.getState?.(),
      interactions: engine.interactionTargets?.getState?.(),
      visual: engine.visualPipeline.snapshot(),
      render: engine.renderDescriptors?.getState?.(),
      domain: domainSnapshot(engine)
    };
  }

  return {
    engine,
    level,
    NexusRealtime,
    VisualPipeline,
    DomainKits,
    prepareFrame,
    snapshot,
    getState: snapshot
  };
}
