export const OPEN_ABOVE_CONFIG = Object.freeze({
  id: "the-open-above",
  title: "The Open Above",
  seed: "open-above-high-fidelity-v1",
  runtime: {
    threeUrl: "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
    nexusUrl: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js",
    protoKitBaseUrl: "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits"
  },
  quality: {
    pixelRatioMax: 1.75,
    patchRadius: 2,
    maxInstancesPerPatch: 72,
    nearSegments: 56,
    midSegments: 34,
    farSegments: 18,
    nearDistance: 620,
    midDistance: 1180
  },
  controls: {
    pitchUp: ["KeyW", "ArrowUp"],
    pitchDown: ["KeyS", "ArrowDown"],
    bankLeft: ["KeyA", "ArrowLeft"],
    bankRight: ["KeyD", "ArrowRight"],
    boost: ["Space"]
  },
  terrain: {
    seed: "open-above-terrain-hires-v1",
    patchSize: 420,
    scale: 0.0046,
    detailScale: 0.025,
    amplitude: 118,
    detailAmplitude: 26,
    baseHeight: -52,
    biomeSize: 620
  },
  physics: {
    controlMode: "assisted",
    gravity: 0.13,
    drag: 0.022,
    lift: 1.22,
    maxSpeed: 148,
    boostImpulse: 44,
    boostCooldown: 1.35,
    pitchSpeed: 1.12,
    rollSpeed: 1.42,
    yawFromRoll: 1.18,
    groundClearance: 15,
    stallSpeed: 10,
    minForwardSpeed: 42,
    minimumAirspeed: 52,
    targetPitch: 0.045,
    targetRoll: 0,
    maxPitch: 0.62,
    maxRoll: 0.68,
    pitchResponse: 4.2,
    rollResponse: 5.4,
    autoLevel: 5.2,
    pitchDamping: 2.8,
    rollDamping: 4.8,
    stallRecoveryPitch: 0.16,
    stallRecoveryLift: 12,
    terrainAvoidance: true,
    safeClearance: 120,
    criticalClearance: 58,
    terrainPitchBias: 0.22,
    terrainLift: 24,
    terrainSpeedBias: 9,
    sinkRateLimit: -30
  },
  flightStart: {
    clearance: 230,
    speed: 82,
    pitch: 0.04,
    yaw: 0
  },
  heuristic: {
    mode: "debug-autopilot-only",
    targetClearance: 185,
    lowClearance: -999,
    highClearance: 9999,
    minAirSpeed: 999,
    boostBelowSpeed: -1
  },
  sky: {
    preset: "noon",
    sky: {
      zenith: "#66bfff",
      horizon: "#e9f7ff",
      fog: "#b9d8da",
      haze: 0.16,
      density: 0.0011,
      sun: { elevation: 52, azimuth: -28, color: "#fff3c4", intensity: 1.65 },
      clouds: [
        { id: "high-clouds", altitude: 920, density: 0.14, scale: 2.4 },
        { id: "far-bands", altitude: 520, density: 0.12, scale: 3.6 }
      ]
    }
  },
  lighting: {
    exposure: 1.08,
    toneMapping: "aces",
    outputColorSpace: "srgb",
    sun: { castShadow: true },
    shadows: { enabled: true, mapSize: 2048, distance: 560, bias: -0.00015, normalBias: 0.02 },
    hemisphere: { sky: "#bdeaff", ground: "#253a22", intensity: 0.72 },
    fog: { near: 140, far: 3400 }
  },
  materials: [
    { id: "terrain.meadow", role: "terrain", albedo: "#3f7f43", roughness: 0.94 },
    { id: "terrain.forest", role: "terrain", albedo: "#245b31", roughness: 0.95 },
    { id: "terrain.rock", role: "terrain", albedo: "#717a76", roughness: 0.88 },
    { id: "terrain.highland", role: "terrain", albedo: "#8b988c", roughness: 0.9 },
    { id: "tree.foliage", role: "static", albedo: "#1f6531", roughness: 0.86 },
    { id: "tree.bark", role: "static", albedo: "#49301e", roughness: 0.92 },
    { id: "actor.body", role: "character", albedo: "#f8fafc", roughness: 0.68 },
    { id: "cloud.soft", role: "transparent", albedo: "#ffffff", alpha: 0.36, roughness: 1 }
  ],
  scatterRules: [
    {
      id: "conifer-stands",
      kind: "tree",
      archetypes: [{ id: "pine", weight: 1 }, { id: "spruce", weight: 0.72 }],
      densityByBiome: { forest: 1, meadow: 0.16, rocky: 0.04, highland: 0.12 },
      maxPerPatch: 72,
      material: "tree.foliage",
      layer: "instanced-scatter",
      scaleMin: 0.82,
      scaleMax: 1.7
    },
    {
      id: "stone-fields",
      kind: "rock",
      archetypes: [{ id: "small-rock", weight: 1 }, { id: "slab-rock", weight: 0.46 }],
      densityByBiome: { forest: 0.18, meadow: 0.15, rocky: 0.86, highland: 0.54 },
      maxPerPatch: 46,
      material: "terrain.rock",
      layer: "instanced-scatter",
      scaleMin: 0.48,
      scaleMax: 1.42
    }
  ],
  actor: {
    id: "player",
    archetype: "bird",
    wingSpan: 8.8,
    bodyLength: 5.4,
    flapRate: 3.1,
    speedFlapRate: 0.018
  },
  flock: {
    count: 5,
    archetype: "bird",
    maxSpeed: 34,
    followForce: 14,
    damping: 0.985
  },
  camera: {
    baseFov: 64,
    speedFovBoost: 10,
    followDistance: 24,
    followHeight: 8.5,
    lookAhead: 24,
    smoothing: 0.14
  },
  simulation: {
    fixedDt: 1 / 60,
    maxManualDelta: 1 / 30
  }
});
