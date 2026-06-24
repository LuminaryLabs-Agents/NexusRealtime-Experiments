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
    patchRadius: 6,
    nearSegments: 68,
    midSegments: 34,
    farSegments: 14,
    nearDistance: 820,
    midDistance: 2200,
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
  terrainShaping: {
    peakGain: 1.85,
    peakSharpness: 1.5,
    ridgeHeight: 34,
    ridgeScale: 0.009,
    ridgeCrossScale: 0.006,
    valleyDepth: 42,
    valleyScale: 0.0036,
    valleySharpness: 6,
    terraceStepNear: 6,
    terraceStepMid: 10,
    terraceStepFar: 18,
    terraceStrengthNear: 0.05,
    terraceStrengthMid: 0.1,
    terraceStrengthFar: 0.18,
    slopeRockMix: 3.2,
    normalStep: 4,
    snowLine: 180,
    midDistance: 1500,
    farDistance: 2200,
    materialPaint: {
      textureScale: 0.022,
      detailScale: 0.085,
      noiseStrength: 0.065,
      layerContrast: 1.08,
      riverPaintStrength: 0.62,
      snowLine: 190,
      snowSoftness: 48,
      slopeRockStart: 0.16,
      slopeRockEnd: 0.50,
      palette: {
        grass: [0.46, 0.57, 0.35],
        meadow: [0.58, 0.66, 0.42],
        forest: [0.25, 0.39, 0.25],
        highland: [0.58, 0.61, 0.48],
        rock: [0.50, 0.53, 0.48],
        cliff: [0.35, 0.42, 0.40],
        snow: [0.87, 0.90, 0.84],
        river: [0.55, 0.78, 0.80],
        silt: [0.56, 0.54, 0.39]
      }
    },
    celShading: {
      enabled: true,
      bands: [0.38, 0.56, 0.74, 0.92],
      shadowStrength: 0.28,
      highlightStrength: 0.08,
      rimStrength: 0.1,
      sunDirection: { x: -0.35, y: 0.72, z: 0.42 }
    }
  },
  terrainHydrology: {
    riverCount: 3,
    riverWidth: 38,
    riverDepth: 20,
    riverSoftness: 0.7,
    tributaryStrength: 0.55,
    valleyWidening: 1.2,
    meanderScale: 0.0026,
    meanderAmplitude: 150
  },
  terrainHorizon: {
    nearRadius: 900,
    midRadius: 1500,
    farRadius: 2200,
    horizonRadius: 22000,
    horizonBands: 4,
    horizonSegments: 80,
    ringThickness: 4800,
    heightCompressionFar: 0.42,
    heightCompressionHorizon: 0.16,
    silhouettePreservation: 0.82,
    fogBlendStart: 2200,
    fogBlendEnd: 18000
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
    groundClearance: 1.4,
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
    safeClearance: 16,
    criticalClearance: 6,
    terrainPitchBias: 0.18,
    terrainLift: 20,
    terrainSpeedBias: 9,
    sinkRateLimit: -72
  },
  flightStart: {
    clearance: 70,
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
  effects: {
    windStreaks: {
      enabled: true,
      count: 96,
      radius: 8.5,
      length: 2.4,
      speedScale: 0.032,
      boostOpacity: 0.62,
      baseOpacity: 0.22
    },
    smokeClouds: {
      count: 90,
      opacity: 0.28,
      minScale: 34,
      maxScale: 120
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
      id: "ancient-canopy-stands-v3",
      kind: "tree",
      archetypes: [{ id: "ancient-oak", weight: 1 }, { id: "giant-cedar", weight: 0.72 }],
      densityByBiome: { forest: 1, meadow: 0.08, rocky: 0.02, highland: 0.08 },
      maxPerPatch: 42,
      material: "tree.foliage",
      layer: "instanced-scatter",
      scaleMin: 30,
      scaleMax: 50
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
    wingSpan: 1,
    bodyLength: 0.62,
    flapRate: 7.2,
    speedFlapRate: 0.035
  },
  flock: {
    count: 7,
    archetype: "bird",
    maxSpeed: 38,
    followForce: 15,
    damping: 0.986
  },
  camera: {
    mode: "bird-follow",
    baseFov: 64,
    speedFovBoost: 10,
    diveFovBoost: 6,
    maxSpeed: 164,
    followDistance: 4.2,
    followHeight: 1.5,
    lookAhead: 5.5,
    verticalLookAhead: 0.65,
    positionLag: 0.16,
    targetLag: 0.14,
    headingLag: 0.10,
    velocityLeadWeight: 0.12,
    carveLookWeight: 0.08,
    rollFrameWeight: 0.04,
    horizonStabilization: 0.86,
    shakeBase: 0.006,
    shakeSpeed: 0.09,
    shakeDive: 0.07,
    shakeBoost: 0.11,
    shakeFrequency: 10.5
  },
  simulation: {
    fixedDt: 1 / 60,
    maxManualDelta: 1 / 30
  }
});
