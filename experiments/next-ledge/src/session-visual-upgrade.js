import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js";
import { createParallaxKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/parallax-kit/index.js";
import { createConfigurableRenderLayerKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/configurable-render-layer-kit/index.js";
import { createNextLedgeSession as createBaseNextLedgeSession } from "./session.js";
import {
  createNextLedgeParallaxInput,
  createNextLedgeRenderStyleInput,
  createNextLedgeVisualQualityReport
} from "./next-ledge-visual-domain.js";

function createVisualEngine() {
  return NexusRealtime.createRealtimeGame({
    kits: [
      createParallaxKit(NexusRealtime, createNextLedgeParallaxInput({})),
      createConfigurableRenderLayerKit(NexusRealtime, createNextLedgeRenderStyleInput({}))
    ],
    renderer: typeof NexusRealtime.createRenderer === "function" ? NexusRealtime.createRenderer("headless") : undefined
  });
}

export function createNextLedgeSession(options = {}) {
  const base = createBaseNextLedgeSession(options);
  const visualEngine = createVisualEngine();

  function decorate(snapshot = {}) {
    const parallaxInput = createNextLedgeParallaxInput(snapshot);
    visualEngine.parallax?.configure?.(parallaxInput, "next-ledge-visual-sync");
    visualEngine.tick?.(0);

    const parallaxSnapshot = visualEngine.parallax?.getDescriptors?.() ?? null;
    const renderStyleInput = createNextLedgeRenderStyleInput(snapshot, parallaxSnapshot);
    visualEngine.configurableRenderLayers?.configure?.(renderStyleInput, "next-ledge-style-sync");
    visualEngine.tick?.(0);

    const renderStyleSnapshot = visualEngine.configurableRenderLayers?.getResolvedLayers?.() ?? null;
    return {
      ...snapshot,
      domain: {
        ...(snapshot.domain ?? {}),
        parallax: parallaxSnapshot,
        renderStyles: renderStyleSnapshot,
        visualQuality: createNextLedgeVisualQualityReport(snapshot, parallaxSnapshot, renderStyleSnapshot)
      }
    };
  }

  function update(dt, input = {}) {
    return decorate(base.update(dt, input));
  }

  function snapshot() {
    return decorate(base.snapshot());
  }

  return {
    ...base,
    visualEngine,
    update,
    snapshot
  };
}

export default createNextLedgeSession;
