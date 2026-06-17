export const signalIslesKitUtilization = Object.freeze([
  { name: "foundation-kit", path: "protokits/foundation-kit/index.js", class: "A", domain: "foundation", why: "seeded math/id services and runtime binding" },
  { name: "token-registry-kit", path: "protokits/token-registry-kit/index.js", class: "F", domain: "contracts", why: "documents the capability token graph" },
  { name: "action-input-kit", path: "protokits/action-input-kit/index.js", class: "A", domain: "input", why: "host input becomes semantic action state" },
  { name: "view-rig-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "camera", why: "avatar/view/camera descriptor state" },
  { name: "spatial-interaction-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "interaction", why: "focus, validation and rejection state" },
  { name: "completion-ledger-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "completion", why: "unique completed fact ledger" },
  { name: "objective-bridge-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "objective", why: "maps completion facts into objective-facing records" },
  { name: "lock-group-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "locks", why: "gate and lock progression state" },
  { name: "damage-health-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "health", why: "health/damage state and failure hooks" },
  { name: "encounter-director-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "encounter", why: "wave/phase pressure records" },
  { name: "resource-node-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "resources", why: "harvestable node discovery state" },
  { name: "build-placement-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "building", why: "placement preview/rejection/selection descriptors" },
  { name: "structure-runtime-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "structures", why: "placed structure runtime descriptors" },
  { name: "diegetic-feedback-signal-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "feedback", why: "world-space markers, prompts and glow signals" },
  { name: "asset-descriptor-kit", path: "protokits/domain-service-kits/index.js", class: "A", domain: "assets", why: "renderer-agnostic asset descriptors" },
  { name: "timed-pressure-director-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "pressure", why: "pressure wave timing and thresholds" },
  { name: "zone-field-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "world", why: "sector, hazard and proximity zone state" },
  { name: "scan-survey-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "scan", why: "scan target progress and reveal state" },
  { name: "route-checkpoint-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "route", why: "ordered checkpoint and gate route state" },
  { name: "cargo-delivery-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "cargo", why: "carry, damage and delivery state" },
  { name: "agent-group-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "agents", why: "deterministic group spawn/goal state" },
  { name: "resource-pressure-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "resources", why: "signal shard / charge resource truth" },
  { name: "hazard-director-kit", path: "protokits/domain-foundation/index.js", class: "A", domain: "hazards", why: "hazard registry, activation and hit events" },
  { name: "content-preset-kit", path: "protokits/domain-foundation/index.js", class: "D", domain: "content", why: "preset descriptors without game rules" },
  { name: "visual-fidelity-maker-kit", path: "protokits/domain-foundation/index.js", class: "E", domain: "visuals", why: "renderer-agnostic fidelity descriptor state" },
  { name: "audio-event-feedback-maker-kit", path: "protokits/domain-foundation/index.js", class: "E", domain: "audio", why: "audio feedback descriptor state" },
  { name: "camera-cinematic-maker-kit", path: "protokits/domain-foundation/index.js", class: "E", domain: "camera", why: "camera/cinematic descriptor state" },
  { name: "scenario-qa-harness", path: "protokits/domain-foundation/index.js", class: "F", domain: "qa", why: "scenario assertion descriptors" },
  { name: "deterministic-replay-harness", path: "protokits/domain-foundation/index.js", class: "F", domain: "qa", why: "replay descriptor and digest state" },
  { name: "gamehost-standard-kit", path: "protokits/domain-foundation/index.js", class: "F", domain: "debug", why: "standard GameHost/debug descriptor state" },
  { name: "biome-field-kit", path: "protokits/biome-field-kit/index.js", class: "A", domain: "biome", why: "biome identity and placement rules" },
  { name: "vegetation-archetype-kit", path: "protokits/vegetation-archetype-kit/index.js", class: "A", domain: "vegetation", why: "species sampling descriptors" },
  { name: "ground-contact-kit", path: "protokits/ground-contact-kit/index.js", class: "A", domain: "placement", why: "terrain seating and slope filtering" },
  { name: "vegetation-lod-kit", path: "protokits/vegetation-lod-kit/index.js", class: "A", domain: "lod", why: "vegetation LOD and billboard descriptors" },
  { name: "scatter-object-kit", path: "protokits/scatter-object-kit/index.js", class: "A", domain: "scatter", why: "seeded detail object descriptors" },
  { name: "surface-material-kit", path: "protokits/surface-material-kit/index.js", class: "A", domain: "materials", why: "surface/material legend descriptors" }
]);

export const signalIslesLevel01 = Object.freeze({
  id: "nexus-frontier-signal-isles",
  title: "Nexus Frontier: Signal Isles",
  presetId: "signal-isles-frontier-01",
  seed: "signal-isles-01",
  promise: "The player is a field engineer restoring a beacon on a hostile living island by scanning, harvesting, building, defending, unlocking, delivering, and activating signal cargo.",
  playerStart: Object.freeze({ id: "player", x: -16, y: 1.6, z: 12, yaw: -0.65, pitch: -0.08, speed: 8 }),
  sceneRecipe: Object.freeze({
    id: "signal-isles-sector-a",
    sky: "storm-dawn-signal",
    terrain: Object.freeze({ radius: 38, waterRadius: 72, heightScale: 2.1, materialId: "living-moss-stone" }),
    objects: Object.freeze([
      { id: "scan-ruin-01", kit: "scan-survey", archetype: "ancient-signal-ruin", transform: { x: -8, y: 0.2, z: -6, rotationY: 35, scale: 1 }, visual: { assetId: "ruin-signal-pylon", materialId: "mossy-stone-emissive", feedbackSignalId: "scan-glow" }, metadata: { zoneId: "sector-a", scanRequired: 3, completionKey: "scan.ruin.01", unlocks: ["resource.node.01"] } },
      { id: "scan-ruin-02", kit: "scan-survey", archetype: "buried-relay-arch", transform: { x: 10, y: 0.2, z: 3, rotationY: -18, scale: 0.9 }, visual: { assetId: "relay-arch", materialId: "wet-stone-signal", feedbackSignalId: "scan-ring" }, metadata: { zoneId: "sector-a", scanRequired: 2, completionKey: "scan.ruin.02", unlocks: ["build.site.01"] } },
      { id: "scan-ruin-03", kit: "scan-survey", archetype: "final-beacon-root", transform: { x: 21, y: 0.2, z: -12, rotationY: 0, scale: 1.25 }, visual: { assetId: "beacon-root", materialId: "ancient-brass-emissive", feedbackSignalId: "beacon-pulse" }, metadata: { zoneId: "beacon-zone", scanRequired: 4, completionKey: "scan.ruin.03", unlocks: ["final.beacon"] } },
      { id: "resource-node-01", kit: "resource-node", archetype: "signal-crystal", transform: { x: -15, y: 0.45, z: -14, scale: 1 }, visual: { assetId: "signal-crystal-cluster", materialId: "cyan-crystal", feedbackSignalId: "resource-spark" }, metadata: { resourceId: "signal-shards", amount: 2, completionKey: "resource.node.01" } },
      { id: "resource-node-02", kit: "resource-node", archetype: "root-capacitor", transform: { x: 3, y: 0.25, z: 16, scale: 1 }, visual: { assetId: "root-capacitor", materialId: "amber-resin-metal", feedbackSignalId: "resource-spark" }, metadata: { resourceId: "signal-shards", amount: 3, completionKey: "resource.node.02" } },
      { id: "build-site-01", kit: "build-placement", archetype: "signal-mast-pad", transform: { x: 3, y: 0.1, z: -8, scale: 1 }, visual: { assetId: "mast-pad", materialId: "etched-basalt", feedbackSignalId: "build-ring" }, metadata: { cost: { "signal-shards": 3 }, structureId: "signal-mast-01", completionKey: "build.signal-mast.01" } },
      { id: "gate-01", kit: "lock-group", archetype: "humming-root-gate", transform: { x: 15, y: 0.2, z: -1, rotationY: 90, scale: 1 }, visual: { assetId: "root-gate", materialId: "dark-root-emissive", feedbackSignalId: "lock-bars" }, metadata: { requires: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01"], completionKey: "lock.gate.01" } },
      { id: "checkpoint-01", kit: "route-checkpoint", archetype: "ridge-checkpoint", transform: { x: 17, y: 0.35, z: -4, scale: 1 }, visual: { assetId: "wind-marker", materialId: "cloth-signal", feedbackSignalId: "route-beam" }, metadata: { routeId: "beacon-route", order: 0, completionKey: "route.checkpoint.01" } },
      { id: "cargo-01", kit: "cargo-delivery", archetype: "signal-charge", transform: { x: 18, y: 0.55, z: -8, scale: 1 }, visual: { assetId: "signal-charge", materialId: "charged-glass", feedbackSignalId: "cargo-orbit" }, metadata: { targetId: "final-beacon", completionKey: "cargo.picked.01", deliveredKey: "cargo.delivered.01" } },
      { id: "final-beacon", kit: "objective", archetype: "frontier-beacon", transform: { x: 24, y: 0.2, z: -14, scale: 1.5 }, visual: { assetId: "final-beacon-spire", materialId: "gold-cyan-emissive", feedbackSignalId: "beacon-complete" }, metadata: { requires: ["scan.ruin.03", "cargo.delivered.01"], completionKey: "final.beacon.activated" } }
    ])
  }),
  biomeDescriptors: Object.freeze({
    fallbackBiome: { id: "moss-rock", label: "Moss Rock", weight: 1, color: "#284533", placementRules: { treeDensity: 0.64 }, materialOverrides: { ground: "living-moss-stone" } },
    biomes: Object.freeze([
      { id: "moss-rock", label: "Moss Rock", weight: 1, color: "#284533", placementRules: { treeDensity: 0.64 }, materialOverrides: { ground: "living-moss-stone" } },
      { id: "storm-reed", label: "Storm Reed", weight: 0.6, color: "#2d4b57", placementRules: { treeDensity: 0.18, reedDensity: 0.9 }, materialOverrides: { ground: "wet-basalt" } },
      { id: "signal-ruin", label: "Signal Ruin", weight: 0.8, color: "#5a5134", placementRules: { treeDensity: 0.2 }, materialOverrides: { ground: "etched-basalt" } }
    ]),
    zones: Object.freeze([
      { id: "biome-east-reed", type: "circle", biomeId: "storm-reed", x: 15, z: 9, radius: 19, weight: 1.5 },
      { id: "biome-ruin-core", type: "circle", biomeId: "signal-ruin", x: 2, z: -7, radius: 16, weight: 2.1 }
    ])
  }),
  vegetation: Object.freeze({
    species: Object.freeze([
      { id: "leaning-pine", kind: "tree", biomes: { "moss-rock": 1, "signal-ruin": 0.35 }, scaleRange: [0.7, 1.35], sinkRange: [0.06, 0.18], materialSlots: { trunk: "wet-bark", leaf: "bluegreen-needles", billboard: "pine-billboard" }, lod: { near: "mesh", far: "billboard" } },
      { id: "storm-reed-clump", kind: "reed", biomes: { "storm-reed": 1, default: 0.15 }, scaleRange: [0.4, 0.95], sinkRange: [0.02, 0.08], materialSlots: { leaf: "storm-reed", billboard: "reed-billboard" }, lod: { near: "mesh", far: "billboard" } },
      { id: "signal-moss-stone", kind: "rock", biomes: { "signal-ruin": 1, "moss-rock": 0.35 }, scaleRange: [0.45, 1.25], sinkRange: [0.04, 0.14], materialSlots: { stone: "mossy-stone-emissive", billboard: "stone-billboard" }, lod: { near: "mesh", far: "billboard" } }
    ]),
    lodLevels: Object.freeze([
      { id: "near", minDistance: 0, maxDistance: 28, detail: "mesh" },
      { id: "mid", minDistance: 28, maxDistance: 58, detail: "simple-mesh" },
      { id: "far", minDistance: 58, maxDistance: 96, detail: "billboard" },
      { id: "culled", minDistance: 96, maxDistance: 9999, detail: "culled" }
    ])
  }),
  zones: Object.freeze([
    { id: "sector-a", shape: "circle", x: 0, z: 0, radius: 34, effects: [] },
    { id: "hazard-spore-field", shape: "circle", x: -1, z: 7, radius: 7.5, effects: [{ id: "spore-load", amountPerSecond: 0.08, threshold: 0.7, max: 1 }] },
    { id: "beacon-zone", shape: "circle", x: 22, z: -13, radius: 8, effects: [] }
  ]),
  scanSites: Object.freeze([
    { id: "scan-ruin-01", x: -8, z: -6, radius: 5, required: 3 },
    { id: "scan-ruin-02", x: 10, z: 3, radius: 5, required: 2 },
    { id: "scan-ruin-03", x: 21, z: -12, radius: 5.5, required: 4 }
  ]),
  resourceNodes: Object.freeze([
    { id: "resource-node-01", x: -15, z: -14, radius: 4.5, resourceId: "signal-shards", amount: 2, depleted: false },
    { id: "resource-node-02", x: 3, z: 16, radius: 4.5, resourceId: "signal-shards", amount: 3, depleted: false }
  ]),
  buildSites: Object.freeze([
    { id: "build-site-01", x: 3, z: -8, radius: 4.5, structureId: "signal-mast-01", cost: { "signal-shards": 3 } }
  ]),
  gates: Object.freeze([
    { id: "gate-01", x: 15, z: -1, radius: 4.5, requires: ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived"] }
  ]),
  hazards: Object.freeze([
    { id: "pressure-spores", x: -1, z: 7, radius: 7.5, amount: 0.18, kind: "spore-pressure" }
  ]),
  agents: Object.freeze([
    { id: "wisp-01", groupId: "pressure-wave-01", x: 26, z: 17, speed: 2.1, mood: "hostile" },
    { id: "wisp-02", groupId: "pressure-wave-01", x: -23, z: 5, speed: 1.8, mood: "hostile" },
    { id: "wisp-03", groupId: "pressure-wave-01", x: 8, z: -26, speed: 1.9, mood: "hostile" }
  ]),
  route: Object.freeze({
    id: "beacon-route",
    checkpoints: Object.freeze([{ id: "checkpoint-01", x: 17, z: -4 }])
  }),
  cargo: Object.freeze([{ id: "cargo-01", x: 18, z: -8, radius: 3.5, targetId: "final-beacon", value: 100, weight: 1, health: 1 }]),
  objectives: Object.freeze([
    { id: "scan-two-ruins", label: "Scan the first two ruins", requires: ["scan.ruin.01", "scan.ruin.02"] },
    { id: "harvest-and-build", label: "Harvest shards and build a signal mast", requires: ["resource.node.01", "resource.node.02", "build.signal-mast.01"] },
    { id: "survive-wave", label: "Survive the pressure wave", requires: ["pressure.wave.01.survived"] },
    { id: "unlock-route", label: "Unlock the root gate and reach the route marker", requires: ["lock.gate.01", "route.checkpoint.01"] },
    { id: "deliver-charge", label: "Deliver the signal charge", requires: ["cargo.delivered.01"] },
    { id: "activate-beacon", label: "Scan and activate the final beacon", requires: ["scan.ruin.03", "final.beacon.activated"] }
  ]),
  kitUtilization: signalIslesKitUtilization
});

export default signalIslesLevel01;
