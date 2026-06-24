export const OPEN_ABOVE_V2_CONFIG = Object.freeze({
  id: "the-open-above-v2",
  title: "The Open Above V2",
  seed: "open-above-v2-compositional-harness",
  runtime: {
    threeUrl: "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
    nexusUrl: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js",
    protoKitBaseUrl: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits"
  },
  controls: {
    pitchUp: ["KeyW", "ArrowUp"],
    pitchDown: ["KeyS", "ArrowDown"],
    bankLeft: ["KeyA", "ArrowLeft"],
    bankRight: ["KeyD", "ArrowRight"],
    boost: ["Space"]
  },
  quality: {
    pixelRatioMax: 1.65,
    patchRadius: 2,
    nearSegments: 64,
    midSegments: 38,
    farSegments: 20,
    nearDistance: 620,
    midDistance: 1240,
    maxInstancesPerPatch: 68
  },
  terrain: {
    seed: "open-above-v2-terrain",
    patchSize: 420,
    scale: 0.0048,
    detailScale: 0.026,
    amplitude: 128,
    detailAmplitude: 28,
    baseHeight: -58,
    biomeSize: 640
  },
  physics: {
    controlMode: "assisted",
    controlResponseMode: "direct",
    gravity: 0.13,
    drag: 0.019,
    lift: 1.18,
    maxSpeed: 164,
    boostImpulse: 48,
    boostCooldown: 1.2,
    pitchSpeed: 2.1,
    rollSpeed: 2.55,
    yawFromRoll: 1.48,
    groundClearance: 15,
    stallSpeed: 9,
    minForwardSpeed: 42,
    minimumAirspeed: 52,
    targetPitch: 0.035,
    pitchInputScale: 0.76,
    rollInputScale: 0.98,
    maxPitch: 0.72,
    maxRoll: 0.82,
    pitchResponse: 7.4,
    rollResponse: 11.2,
    autoLevel: 7.8,
    pitchDamping: 4.4,
    rollDamping: 6.8,
    flightPathAlignment: true,
    horizontalAlignRate: 5.8,
    verticalAlignRate: 5.4,
    carveMode: "screen-focus",
    carveStrength: 1.08,
    carveResponse: 10.4,
    bankCarveScale: 1.36,
    pitchCarveScale: 1.22,
    bankTurnAuthority: 1.86,
    turnLiftLoss: 0.05,
    turnDiveAssist: 0.028,
    swoopAcceleration: 20,
    diveAcceleration: 46,
    climbAcceleration: 18,
    stallRecoveryPitch: 0.13,
    stallRecoveryLift: 12,
    terrainAvoidance: true,
    safeClearance: 105,
    criticalClearance: 52,
    terrainPitchBias: 0.18,
    terrainLift: 20,
    terrainSpeedBias: 9,
    sinkRateLimit: -72
  },
  flightStart: {
    clearance: 260,
    speed: 94,
    pitch: 0.035,
    yaw: 0
  },
  sky: {
    preset: "high-noon",
    sky: {
      zenith: "#60bfff",
      horizon: "#f0fbff",
      fog: "#bdd9dd",
      haze: 0.15,
      density: 0.00105,
      sun: { elevation: 50, azimuth: -28, color: "#fff0ba", intensity: 1.75 },
      clouds: [
        { id: "high-haze", altitude: 980, density: 0.14, scale: 2.8 },
        { id: "ridge-bands", altitude: 560, density: 0.12, scale: 3.7 }
      ]
    }
  },
  lighting: {
    exposure: 1.08,
    toneMapping: "aces",
    outputColorSpace: "srgb",
    sun: { castShadow: true },
    shadows: { enabled: true, mapSize: 2048, distance: 620, bias: -0.00015, normalBias: 0.02 },
    hemisphere: { sky: "#bdeaff", ground: "#233b24", intensity: 0.74 },
    fog: { near: 120, far: 3600 }
  },
  materials: [
    { id: "terrain.meadow", role: "terrain", albedo: "#407d42", roughness: 0.94 },
    { id: "terrain.forest", role: "terrain", albedo: "#245b31", roughness: 0.95 },
    { id: "terrain.rock", role: "terrain", albedo: "#747d78", roughness: 0.88 },
    { id: "terrain.highland", role: "terrain", albedo: "#8d988e", roughness: 0.9 },
    { id: "tree.foliage", role: "static", albedo: "#1f6531", roughness: 0.86 },
    { id: "tree.bark", role: "static", albedo: "#49301e", roughness: 0.92 },
    { id: "actor.body", role: "character", albedo: "#f8fafc", roughness: 0.68 }
  ],
  scatterRules: [
    {
      id: "conifer-stands-v2",
      kind: "tree",
      archetypes: [{ id: "pine", weight: 1 }, { id: "spruce", weight: 0.72 }],
      densityByBiome: { forest: 1, meadow: 0.15, rocky: 0.035, highland: 0.1 },
      maxPerPatch: 68,
      material: "tree.foliage",
      layer: "instanced-scatter",
      scaleMin: 0.85,
      scaleMax: 1.75
    },
    {
      id: "stone-fields-v2",
      kind: "rock",
      archetypes: [{ id: "small-rock", weight: 1 }, { id: "slab-rock", weight: 0.45 }],
      densityByBiome: { forest: 0.16, meadow: 0.14, rocky: 0.82, highland: 0.5 },
      maxPerPatch: 44,
      material: "terrain.rock",
      layer: "instanced-scatter",
      scaleMin: 0.48,
      scaleMax: 1.46
    }
  ],
  actor: {
    id: "player",
    archetype: "bird",
    wingSpan: 6.6,
    bodyLength: 4.2,
    flapRate: 2.6,
    speedFlapRate: 0.016
  },
  flock: {
    count: 7,
    archetype: "bird",
    maxSpeed: 38,
    followForce: 15,
    damping: 0.986
  },
  camera: {
    baseFov: 65,
    speedFovBoost: 14,
    followDistance: 22,
    followHeight: 7.4,
    lookAhead: 28,
    smoothing: 0.2,
    lookVelocityWeight: 0.18,
    lookCarveFocusWeight: 0.68,
    followVelocityBias: 0.36,
    pitchLag: 4.8,
    verticalLookAhead: 16,
    diveFovBoost: 9
  },
  simulation: {
    fixedDt: 1 / 60,
    maxManualDelta: 1 / 30
  }
});
