const MAP_EXTENTS = Object.freeze({ width: 42, depth: 29, halfWidth: 21, halfDepth: 14.5 });
const VEGETATION_DSK_ID = "procedural-vegetation-field-kit-local-candidate";
const VEGETATION_STYLE = "procedural-grass-plants-trees-biome-density-field";
const VEGETATION_PRESENTATION = "metadata-only-until-terrain-anchored-instancing";
const VEGETATION_COUNTS = Object.freeze({ grass: 5200, reeds: 620, shrubs: 860, trees: 320, flowers: 520, rocks: 260 });
const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

function hashNoise(x, z, salt = 0) {
  const value = Math.sin(x * 127.1 + z * 311.7 + salt * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

function valueNoise2D(x, z, salt = 0) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = smoothstep(0, 1, x - x0);
  const tz = smoothstep(0, 1, z - z0);
  const a = hashNoise(x0, z0, salt);
  const b = hashNoise(x0 + 1, z0, salt);
  const c = hashNoise(x0, z0 + 1, salt);
  const d = hashNoise(x0 + 1, z0 + 1, salt);
  return lerp(lerp(a, b, tx), lerp(c, d, tx), tz) * 2 - 1;
}

function fbmNoise(x, z, octaves = 5, lacunarity = 2.03, gain = 0.5, salt = 0) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise2D(x * frequency, z * frequency, salt + i * 19.1) * amplitude;
    norm += amplitude;
    frequency *= lacunarity + i * 0.017;
    amplitude *= gain;
  }
  return value / Math.max(0.0001, norm);
}

function ridgedNoise(x, z, octaves = 4, salt = 100) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    const n = 1 - Math.abs(valueNoise2D(x * frequency, z * frequency, salt + i * 23.7));
    value += n * n * amplitude;
    norm += amplitude;
    frequency *= 2.12;
    amplitude *= 0.47;
  }
  return value / Math.max(0.0001, norm);
}

function domainWarp(x, z, kind = "world") {
  const strength = kind === "world" ? 3.15 : 1.05;
  const scale = kind === "world" ? 0.052 : 0.11;
  const wx = fbmNoise(x * scale + 42.1, z * scale - 11.3, 5, 2.08, 0.53, 41) * strength;
  const wz = fbmNoise(x * scale - 17.7, z * scale + 29.4, 5, 2.04, 0.52, 83) * strength;
  const curl = fbmNoise((x + wx) * scale * 2, (z - wz) * scale * 2, 4, 2.21, 0.48, 127) * strength * 0.42;
  return { x: x + wx - curl * 0.34, z: z + wz + curl * 0.28, wx, wz };
}

function riverMaskAt(x, z, kind = "world") {
  if (kind !== "world") return Math.exp(-Math.abs(z) * 2.1);
  const w = domainWarp(x * 0.7, z * 0.7, "world");
  const riverZ = Math.sin((w.x + 3.7) * 0.18 + fbmNoise(w.x * 0.07, w.z * 0.07, 4, 2, 0.5, 205) * 2.2) * 2.1 + lerp(-3.2, 3.4, clamp((x + MAP_EXTENTS.halfWidth) / MAP_EXTENTS.width, 0, 1));
  return Math.exp(-Math.abs(z - riverZ) * 1.12);
}

function terrainHeight(x, z, kind = "world") {
  const w = domainWarp(x, z, kind);
  if (kind === "battlefield") {
    return fbmNoise(w.x * 0.105, w.z * 0.105, 5, 2.03, 0.52, 14) * 0.34 + ridgedNoise((w.x - 1.8) * 0.12, (w.z + 0.6) * 0.12, 4, 64) * 0.24 + fbmNoise(w.x * 0.62, w.z * 0.62, 4, 2.2, 0.42, 96) * 0.055 - riverMaskAt(x, z, kind) * 0.08;
  }
  const nx = x / MAP_EXTENTS.halfWidth;
  const nz = z / MAP_EXTENTS.halfDepth;
  const edge = Math.max(Math.abs(nx), Math.abs(nz));
  const continent = 1 - smoothstep(0.72, 1.04, edge + fbmNoise(w.x * 0.055, w.z * 0.055, 5, 2, 0.5, 111) * 0.12);
  const massifA = Math.exp(-((w.x - 7.6) ** 2 + (w.z + 8.8) ** 2) * 0.016) * 1.34;
  const massifB = Math.exp(-((w.x + 10.0) ** 2 + (w.z - 1.8) ** 2) * 0.012) * 0.74;
  const broadHills = fbmNoise(w.x * 0.065, w.z * 0.065, 6, 2.02, 0.54, 9) * 1.05;
  const valleys = ridgedNoise((w.x + 3.0) * 0.055, (w.z - 1.0) * 0.055, 5, 37) * 0.58;
  const rockRidges = ridgedNoise((w.x - 4.5) * 0.11, (w.z + 6.5) * 0.11, 4, 91) * 0.62;
  const micro = fbmNoise(w.x * 0.42, w.z * 0.42, 4, 2.17, 0.43, 53) * 0.13;
  return (broadHills + massifA + massifB + rockRidges - valleys * 0.46 + micro - riverMaskAt(x, z, kind) * 0.24) * continent - (1 - continent) * 0.52;
}

function estimateSlope(x, z, kind = "world") {
  const e = kind === "world" ? 0.35 : 0.18;
  const dx = terrainHeight(x + e, z, kind) - terrainHeight(x - e, z, kind);
  const dz = terrainHeight(x, z + e, kind) - terrainHeight(x, z - e, kind);
  return clamp(Math.hypot(dx, dz) / (e * 2), 0, 2.4);
}

function moistureAt(x, z, kind = "world") {
  const w = domainWarp(x * 0.6 + 20, z * 0.6 - 10, kind);
  const broad = fbmNoise(w.x * 0.062, w.z * 0.062, 5, 2, 0.55, 211) * 0.5 + 0.5;
  return clamp(broad * 0.68 + riverMaskAt(x, z, kind) * 0.42, 0, 1);
}

function biomeForSample(x, z, kind = "world") {
  const height = terrainHeight(x, z, kind);
  const slope = estimateSlope(x, z, kind);
  const moisture = moistureAt(x, z, kind);
  const river = riverMaskAt(x, z, kind);
  const canopyNoise = fbmNoise(x * 0.14 + 10, z * 0.14 - 3, 5, 2.1, 0.5, 611) * 0.5 + 0.5;
  const scrubNoise = fbmNoise(x * 0.22 - 5, z * 0.22 + 7, 4, 2.2, 0.45, 727) * 0.5 + 0.5;
  return { height, slope, moisture, river, canopyNoise, scrubNoise };
}

function vegetationDensityForSample(x, z, kind, category) {
  const b = biomeForSample(x, z, kind);
  const flat = 1 - smoothstep(0.26, 1.05, b.slope);
  const mountain = smoothstep(0.72, 1.52, b.height);
  const lowland = 1 - smoothstep(0.75, 1.4, b.height);
  if (category === "grass") return clamp(flat * lowland * (0.42 + b.moisture * 0.48) + b.river * 0.18, 0, 1);
  if (category === "reed") return clamp(b.river * flat * (0.55 + b.moisture * 0.45), 0, 1);
  if (category === "shrub") return clamp((0.42 + b.scrubNoise * 0.58) * (1 - b.river * 0.3) * (0.35 + b.moisture * 0.35) * (1 - mountain * 0.5), 0, 1);
  if (category === "tree") return clamp(flat * b.moisture * b.canopyNoise * (1 - mountain * 0.45) + b.river * 0.26, 0, 1);
  if (category === "flower") return clamp(flat * (1 - b.river * 0.3) * (0.35 + b.moisture * 0.45) * (1 - mountain), 0, 1);
  if (category === "rock") return clamp(b.slope * 0.55 + mountain * 0.65, 0, 1);
  return 0;
}

function candidatePoint(index, category, count, salt = 0) {
  const a = index + salt * 101.17;
  const x = (hashNoise(a, count * 0.17, 31 + salt) - 0.5) * MAP_EXTENTS.width * 0.95;
  const z = (hashNoise(a, count * 0.23, 53 + salt) - 0.5) * MAP_EXTENTS.depth * 0.92;
  const jitter = hashNoise(a, count * 0.31, 89 + salt);
  return { x, z, jitter, density: vegetationDensityForSample(x, z, "world", category) };
}

function makeVegetationDescriptor(category, index, point) {
  const y = terrainHeight(point.x, point.z, "world");
  const variant = hashNoise(point.x * 3.17, point.z * 2.91, index + 101);
  return {
    id: `${category}-${index}`,
    kind: category,
    position: { x: point.x, y, z: point.z },
    scale: 0.7 + hashNoise(point.x, point.z, index) * 1.15,
    rotation: hashNoise(point.z, point.x, index + 10) * TAU,
    biome: biomeForSample(point.x, point.z),
    windResponse: category === "grass" || category === "reed" ? 1 : category === "tree" ? 0.32 : 0.55,
    lodBand: category === "grass" || category === "flower" ? 0 : category === "tree" ? 2 : 1,
    descriptor: { source: VEGETATION_DSK_ID, rendererNeutral: true, vegetationStyle: VEGETATION_STYLE, presentation: VEGETATION_PRESENTATION }
  };
}

function createVegetationInstances(category, targetCount, salt) {
  const descriptors = [];
  const attempts = targetCount * 5;
  for (let i = 0; i < attempts && descriptors.length < targetCount; i += 1) {
    const point = candidatePoint(i, category, targetCount, salt);
    const gate = hashNoise(point.x * 1.7, point.z * 1.9, salt + 177);
    if (gate > point.density) continue;
    if (category === "tree" && gate < 0.14) continue;
    descriptors.push(makeVegetationDescriptor(category, descriptors.length, point));
  }
  return descriptors;
}

function createVegetationDescriptorField() {
  const grass = createVegetationInstances("grass", VEGETATION_COUNTS.grass, 1);
  const reeds = createVegetationInstances("reed", VEGETATION_COUNTS.reeds, 2);
  const shrubs = createVegetationInstances("shrub", VEGETATION_COUNTS.shrubs, 3);
  const trees = createVegetationInstances("tree", VEGETATION_COUNTS.trees, 4);
  const flowers = createVegetationInstances("flower", VEGETATION_COUNTS.flowers, 5);
  const rocks = createVegetationInstances("rock", VEGETATION_COUNTS.rocks, 6);
  const descriptors = [...grass, ...reeds, ...shrubs, ...trees, ...flowers, ...rocks].sort((a, b) => a.position.z - b.position.z || a.lodBand - b.lodBand);
  return {
    id: "cavalry-procedural-vegetation-field",
    version: "0.2.0",
    sourceDskCandidate: VEGETATION_DSK_ID,
    existingDskBridge: ["zone-field-kit", "visual-fidelity-maker-kit", "scenario-qa-harness", "gamehost-standard-kit"],
    rendererNeutral: true,
    vegetationStyle: VEGETATION_STYLE,
    presentation: VEGETATION_PRESENTATION,
    disabledScreenSpaceRendering: true,
    floatingFix: "Screen-space vegetation rendering is disabled until terrain-anchored WebGPU instancing exists.",
    counts: { grass: grass.length, reeds: reeds.length, shrubs: shrubs.length, trees: trees.length, flowers: flowers.length, rocks: rocks.length, total: descriptors.length },
    descriptors
  };
}

const proceduralVegetationDsk = createVegetationDescriptorField();

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || host.__cavalryVegetationPatched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const snapshot = originalSnapshot() ?? {};
    return {
      ...snapshot,
      proceduralVegetation: {
        id: proceduralVegetationDsk.id,
        sourceDskCandidate: proceduralVegetationDsk.sourceDskCandidate,
        vegetationStyle: proceduralVegetationDsk.vegetationStyle,
        presentation: proceduralVegetationDsk.presentation,
        disabledScreenSpaceRendering: true,
        rendererNeutral: true,
        counts: proceduralVegetationDsk.counts,
        descriptorSample: proceduralVegetationDsk.descriptors.slice(0, 24)
      }
    };
  };
  host.getVegetationDescriptors = () => proceduralVegetationDsk.descriptors.slice();
  host.getVegetationSnapshot = () => ({
    id: proceduralVegetationDsk.id,
    counts: proceduralVegetationDsk.counts,
    vegetationStyle: proceduralVegetationDsk.vegetationStyle,
    presentation: proceduralVegetationDsk.presentation,
    disabledScreenSpaceRendering: true,
    existingDskBridge: proceduralVegetationDsk.existingDskBridge
  });
  host.__cavalryVegetationPatched = true;
  return true;
}

function bootVegetationPass() {
  globalThis.CavalryVegetationProceduralDsk = {
    id: VEGETATION_DSK_ID,
    metadata: {
      version: "0.2.0",
      purpose: "Renderer-neutral procedural vegetation descriptor field for Cavalry terrain fidelity.",
      existingDskBridge: proceduralVegetationDsk.existingDskBridge,
      futureProtoKitCandidate: true,
      presentation: VEGETATION_PRESENTATION,
      disabledScreenSpaceRendering: true,
      boundary: "Owns deterministic grass, shrub, reed, flower, rock, and tree placement descriptors. No screen-space vegetation is rendered because it can float above the terrain."
    },
    getSnapshot: () => ({ counts: proceduralVegetationDsk.counts, vegetationStyle: VEGETATION_STYLE, presentation: VEGETATION_PRESENTATION, disabledScreenSpaceRendering: true }),
    getDescriptors: () => proceduralVegetationDsk.descriptors.slice()
  };
  let attempts = 0;
  const patchTimer = setInterval(() => {
    if (patchGameHost()) clearInterval(patchTimer);
    attempts += 1;
    if (attempts > 240) clearInterval(patchTimer);
  }, 100);
}

bootVegetationPass();
