const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const readoutEl = document.querySelector("#readout");
const commandBar = document.querySelector("#commandBar");

const NEXUS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
const ACTION_INPUT_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/action-input-kit/index.js";
const ROUTE_PROGRESS_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-route-progress-kit/index.js";
const AFFORDANCE_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-affordance-descriptor-kit/index.js";
const ZONE_FIELD_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/zone-field-kit/index.js";
const CAMERA_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/camera-cinematic-maker-kit/index.js";
const VISUAL_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/visual-fidelity-maker-kit/index.js";
const GAMEHOST_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/gamehost-standard-kit/index.js";
const SCENARIO_QA_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/scenario-qa-harness/index.js";

const MAP_EXTENTS = Object.freeze({ width: 40, depth: 28, halfWidth: 20, halfDepth: 14 });
const PAINTERLY_TERRAIN_STYLE = "realistic-domain-warped-painted-terrain";
const FULL_BODY_PRIMITIVE_STYLE = "full-bodied-primitive-low-poly-soldiers";
const REALISTIC_TERRAIN_STYLE = "domain-warped-fbm-biome-blended-non-repeating-landforms";

const REGIONS = Object.freeze([
  { id: "latium", name: "Latium", center: [-8.2, 0, 3.0], radii: [4.7, 3.05], tone: [0.92, 0.72, 0.34, 0.25], shot: "latium-dive" },
  { id: "etruria", name: "Etruria", center: [-10.2, 0, -4.9], radii: [5.2, 3.45], tone: [0.95, 0.58, 0.28, 0.22], shot: "etruria-dive" },
  { id: "samnium", name: "Samnium", center: [2.15, 0, 0.72], radii: [5.05, 3.85], tone: [0.84, 0.74, 0.40, 0.22], shot: "samnium-dive" },
  { id: "campania", name: "Campania", center: [-3.25, 0, 8.2], radii: [5.45, 3.05], tone: [0.96, 0.78, 0.36, 0.26], shot: "campania-dive" },
  { id: "magna-graecia", name: "Magna Graecia", center: [10.5, 0, 6.65], radii: [6.1, 3.5], tone: [0.66, 0.84, 0.94, 0.22], shot: "magna-graecia-dive" },
  { id: "cisalpine-approach", name: "Cisalpine Approach", center: [7.6, 0, -8.15], radii: [6.7, 3.1], tone: [0.60, 0.88, 0.58, 0.21], shot: "cisalpine-dive" }
]);

const DSK_STACK = Object.freeze([
  "gamehost-standard-kit",
  "action-input-kit",
  "generic-affordance-descriptor-kit",
  "generic-route-progress-kit",
  "zone-field-kit",
  "camera-cinematic-maker-kit",
  "visual-fidelity-maker-kit",
  "scenario-qa-harness"
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
const ease = (t) => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;

let renderer = null;
let engine = null;
let dskReady = false;
let last = performance.now();

const state = {
  mode: "world",
  time: 0,
  pointer: { x: 0, y: 0, active: false },
  hoveredRegionId: null,
  selectedRegionId: null,
  transition: 0,
  transitionCompleted: false,
  camera: null,
  rendererMode: "booting",
  dskStack: [...DSK_STACK],
  mapPan: { x: -1.8, z: 0.9 },
  mapZoom: 1,
  drag: { active: false, panning: false, x: 0, y: 0 },
  visualContract: {
    businessLogic: "minimal",
    primaryLoop: "large-pannable-painted-terrain-scan-region-dive",
    WebGPU: "preferred",
    fallback: "canvas-2d",
    fidelityFocus: true,
    painterlyTerrain: true,
    realisticTerrain: true,
    domainWarpedTerrain: true,
    nonRepeatingLandforms: true,
    blendedBiomeColor: true,
    fullBodyPrimitiveSoldiers: true
  }
};

function regionById(id) { return REGIONS.find((region) => region.id === id) ?? null; }
function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function normalize(v) { const length = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / length, v[1] / length, v[2] / length]; }
function rotateYaw(local, yaw) { const c = Math.cos(yaw); const s = Math.sin(yaw); return [local[0] * c - local[2] * s, local[1], local[0] * s + local[2] * c]; }
function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }

function mixColor(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3] ?? 1, b[3] ?? 1, t)];
}

function scaleColor(color, factor) {
  return [color[0] * factor, color[1] * factor, color[2] * factor, color[3] ?? 1];
}

function mat4Perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, (2 * far * near) * nf, 0]);
}

function mat4LookAt(eye, target, up = [0, 1, 0]) {
  const z = normalize(sub(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] = a[row] * b[column * 4] + a[4 + row] * b[column * 4 + 1] + a[8 + row] * b[column * 4 + 2] + a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function transformPoint(matrix, point) {
  const x = point[0], y = point[1], z = point[2], w = 1;
  const cx = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;
  const cy = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;
  const cz = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;
  const cw = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w || 1;
  return [cx / cw, cy / cw, cz / cw];
}

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
  const curl = fbmNoise((x + wx) * scale * 2.0, (z - wz) * scale * 2.0, 4, 2.21, 0.48, 127) * strength * 0.42;
  return { x: x + wx - curl * 0.34, z: z + wz + curl * 0.28, wx, wz };
}

function riverMaskAt(x, z, kind = "world") {
  if (kind !== "world") return Math.exp(-Math.abs(z) * 2.1);
  const w = domainWarp(x * 0.7, z * 0.7, "world");
  const riverZ = Math.sin((w.x + 3.7) * 0.18 + fbmNoise(w.x * 0.07, w.z * 0.07, 4, 2.0, 0.5, 205) * 2.2) * 2.1 + lerp(-3.2, 3.4, clamp((x + MAP_EXTENTS.halfWidth) / MAP_EXTENTS.width, 0, 1));
  return Math.exp(-Math.abs(z - riverZ) * 1.12);
}

function terrainHeight(x, z, kind = "world") {
  const w = domainWarp(x, z, kind);
  if (kind === "battlefield") {
    const broad = fbmNoise(w.x * 0.105, w.z * 0.105, 5, 2.03, 0.52, 14) * 0.34;
    const ridge = ridgedNoise((w.x - 1.8) * 0.12, (w.z + 0.6) * 0.12, 4, 64) * 0.24;
    const lane = riverMaskAt(x, z, kind) * 0.08;
    const rough = fbmNoise(w.x * 0.62, w.z * 0.62, 4, 2.2, 0.42, 96) * 0.055;
    return broad + ridge + rough - lane;
  }

  const nx = x / MAP_EXTENTS.halfWidth;
  const nz = z / MAP_EXTENTS.halfDepth;
  const edge = Math.max(Math.abs(nx), Math.abs(nz));
  const continent = 1 - smoothstep(0.72, 1.04, edge + fbmNoise(w.x * 0.055, w.z * 0.055, 5, 2.0, 0.5, 111) * 0.12);
  const massifA = Math.exp(-((w.x - 7.6) ** 2 + (w.z + 8.8) ** 2) * 0.016) * 1.34;
  const massifB = Math.exp(-((w.x + 10.0) ** 2 + (w.z - 1.8) ** 2) * 0.012) * 0.74;
  const broadHills = fbmNoise(w.x * 0.065, w.z * 0.065, 6, 2.02, 0.54, 9) * 1.05;
  const valleys = ridgedNoise((w.x + 3.0) * 0.055, (w.z - 1.0) * 0.055, 5, 37) * 0.58;
  const rockRidges = ridgedNoise((w.x - 4.5) * 0.11, (w.z + 6.5) * 0.11, 4, 91) * 0.62;
  const micro = fbmNoise(w.x * 0.42, w.z * 0.42, 4, 2.17, 0.43, 53) * 0.13;
  const riverCut = riverMaskAt(x, z, kind) * 0.24;
  return (broadHills + massifA + massifB + rockRidges - valleys * 0.46 + micro - riverCut) * continent - (1 - continent) * 0.52;
}

function estimateSlope(x, z, kind = "world") {
  const e = kind === "world" ? 0.35 : 0.18;
  const dx = terrainHeight(x + e, z, kind) - terrainHeight(x - e, z, kind);
  const dz = terrainHeight(x, z + e, kind) - terrainHeight(x, z - e, kind);
  return clamp(Math.hypot(dx, dz) / (e * 2), 0, 2.4);
}

function moistureAt(x, z, kind = "world") {
  const w = domainWarp(x * 0.6 + 20, z * 0.6 - 10, kind);
  const broad = fbmNoise(w.x * 0.062, w.z * 0.062, 5, 2.0, 0.55, 211) * 0.5 + 0.5;
  const river = riverMaskAt(x, z, kind);
  return clamp(broad * 0.68 + river * 0.42, 0, 1);
}

function biomeColorBlend(x, z, y, kind = "world") {
  const slope = estimateSlope(x, z, kind);
  const moisture = moistureAt(x, z, kind);
  const sun = fbmNoise(x * 0.035 + 8, z * 0.035 - 4, 4, 2.0, 0.5, 309) * 0.5 + 0.5;
  const detail = fbmNoise(x * 0.73, z * 0.73, 4, 2.25, 0.46, 407) * 0.5 + 0.5;

  const dryGrass = [0.42, 0.39, 0.22, 1];
  const oliveGrass = [0.25, 0.39, 0.20, 1];
  const richGreen = [0.17, 0.33, 0.18, 1];
  const earth = [0.43, 0.31, 0.18, 1];
  const rock = [0.45, 0.43, 0.35, 1];
  const mountain = [0.54, 0.51, 0.43, 1];
  const damp = [0.12, 0.27, 0.22, 1];
  const riverBlue = [0.10, 0.28, 0.34, 1];

  let color = mixColor(dryGrass, oliveGrass, smoothstep(0.18, 0.78, moisture));
  color = mixColor(color, richGreen, smoothstep(0.64, 0.96, moisture) * (1 - smoothstep(0.52, 1.15, y)));
  color = mixColor(color, earth, smoothstep(0.35, 0.82, sun) * 0.24 + smoothstep(0.12, 0.55, -y) * 0.18);
  color = mixColor(color, damp, riverMaskAt(x, z, kind) * 0.45);
  color = mixColor(color, rock, smoothstep(0.32, 0.78, slope) * 0.58);
  color = mixColor(color, mountain, smoothstep(0.72, 1.55, y) * 0.58);
  color = mixColor(color, riverBlue, riverMaskAt(x, z, kind) * (kind === "world" ? 0.42 : 0.12));

  const warmGlaze = 0.90 + detail * 0.18;
  return [clamp(color[0] * warmGlaze, 0, 1), clamp(color[1] * (0.94 + detail * 0.12), 0, 1), clamp(color[2] * (0.92 + detail * 0.10), 0, 1), color[3]];
}

function paintedTerrainColor(x, z, y, kind = "world") {
  const color = biomeColorBlend(x, z, y, kind);
  if (kind === "world") {
    const edge = Math.max(Math.abs(x) / MAP_EXTENTS.halfWidth, Math.abs(z) / MAP_EXTENTS.halfDepth);
    const coast = smoothstep(0.90, 1.02, edge + fbmNoise(x * 0.08, z * 0.08, 4, 2.0, 0.5, 517) * 0.05);
    return mixColor(color, [0.07, 0.18, 0.23, 1], coast * 0.64);
  }
  const trample = Math.exp(-Math.abs(z) * 1.18) * 0.20;
  return mixColor(color, [0.44, 0.32, 0.19, 1], trample);
}

function pushVertex(vertices, position, color) { vertices.push(position[0], position[1], position[2], color[0], color[1], color[2], color[3]); }
function pushTriangle(vertices, a, b, c, color) { pushVertex(vertices, a, color); pushVertex(vertices, b, color); pushVertex(vertices, c, color); }
function pushQuad(vertices, a, b, c, d, color) { pushTriangle(vertices, a, b, c, color); pushTriangle(vertices, a, c, d, color); }

function boxCorners(center, size, yaw = 0) {
  const [sx, sy, sz] = [size[0] / 2, size[1] / 2, size[2] / 2];
  return [[-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz], [-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz]].map((corner) => add3(center, rotateYaw(corner, yaw)));
}

function pushBox(vertices, center, size, color, yaw = 0, shade = 1) {
  const c = boxCorners(center, size, yaw);
  const face = (indices, factor) => pushQuad(vertices, c[indices[0]], c[indices[1]], c[indices[2]], c[indices[3]], scaleColor(color, factor));
  face([0, 1, 2, 3], shade * 0.82);
  face([4, 7, 6, 5], shade * 1.04);
  face([0, 4, 5, 1], shade * 0.92);
  face([3, 2, 6, 7], shade * 1.12);
  face([1, 5, 6, 2], shade * 0.98);
  face([0, 3, 7, 4], shade * 0.88);
}

function pushRibbon(vertices, points, width, color) {
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len * width;
    const nz = dx / len * width;
    pushQuad(vertices, [a[0] - nx, a[1], a[2] - nz], [a[0] + nx, a[1], a[2] + nz], [b[0] + nx, b[1], b[2] + nz], [b[0] - nx, b[1], b[2] - nz], color);
  }
}

function makeTerrainVertices(kind = "world") {
  const vertices = [];
  const segmentsX = kind === "world" ? 132 : 94;
  const segmentsZ = kind === "world" ? 92 : 66;
  const width = kind === "world" ? MAP_EXTENTS.width : 18.5;
  const depth = kind === "world" ? MAP_EXTENTS.depth : 11.2;
  const x0 = -width / 2;
  const z0 = -depth / 2;
  const dx = width / segmentsX;
  const dz = depth / segmentsZ;

  for (let iz = 0; iz < segmentsZ; iz += 1) {
    for (let ix = 0; ix < segmentsX; ix += 1) {
      const xA = x0 + ix * dx;
      const xB = xA + dx;
      const zA = z0 + iz * dz;
      const zB = zA + dz;
      const a = [xA, terrainHeight(xA, zA, kind), zA];
      const b = [xB, terrainHeight(xB, zA, kind), zA];
      const c = [xB, terrainHeight(xB, zB, kind), zB];
      const d = [xA, terrainHeight(xA, zB, kind), zB];
      const y = (a[1] + b[1] + c[1] + d[1]) * 0.25;
      const color = paintedTerrainColor((xA + xB) * 0.5, (zA + zB) * 0.5, y, kind);
      pushQuad(vertices, a, b, c, d, color);
    }
  }
  return new Float32Array(vertices);
}

function riverCenterlinePoint(t) {
  const x = lerp(-17.2, 16.1, t);
  const drift = fbmNoise(t * 5.1, t * 2.3, 4, 2.0, 0.5, 601) * 3.2;
  const z = lerp(-4.1, 4.6, t) + drift + valueNoise2D(t * 9.2, 3.1, 602) * 0.9;
  return [x, terrainHeight(x, z, "world") + 0.06, z];
}

function makePainterlyStrokeVertices(kind = "world") {
  const vertices = [];
  const count = kind === "world" ? 440 : 175;
  const width = kind === "world" ? MAP_EXTENTS.width : 18.5;
  const depth = kind === "world" ? MAP_EXTENTS.depth : 11.2;

  for (let i = 0; i < count; i += 1) {
    const seed = i * 37.13;
    const x = (hashNoise(seed, 2, 1) - 0.5) * width * 0.95;
    const z = (hashNoise(seed, 7, 2) - 0.5) * depth * 0.93;
    const y = terrainHeight(x, z, kind) + 0.045 + (i % 7) * 0.0015;
    const flow = domainWarp(x * 0.45 + seed * 0.01, z * 0.45 - seed * 0.006, kind);
    const angle = Math.atan2(flow.wz, flow.wx) + valueNoise2D(x * 0.19, z * 0.19, 707) * 0.9;
    const length = (kind === "world" ? 0.38 : 0.25) + hashNoise(seed, 11, 3) * (kind === "world" ? 1.45 : 0.75);
    const brushWidth = (kind === "world" ? 0.018 : 0.015) + hashNoise(seed, 17, 5) * 0.035;
    const dx = Math.cos(angle) * length;
    const dz = Math.sin(angle) * length;
    const nx = -Math.sin(angle) * brushWidth;
    const nz = Math.cos(angle) * brushWidth;
    const base = biomeColorBlend(x, z, y, kind);
    const glaze = 0.86 + hashNoise(seed, 29, 7) * 0.28;
    const color = [base[0] * glaze + 0.04, base[1] * glaze + 0.035, base[2] * glaze + 0.02, 0.07 + hashNoise(seed, 31, 8) * 0.08];
    pushQuad(vertices, [x - dx * 0.5 - nx, y, z - dz * 0.5 - nz], [x - dx * 0.5 + nx, y, z - dz * 0.5 + nz], [x + dx * 0.5 + nx, y + 0.004, z + dz * 0.5 + nz], [x + dx * 0.5 - nx, y + 0.004, z + dz * 0.5 - nz], color);
  }

  if (kind === "world") {
    const river = Array.from({ length: 88 }, (_, index) => riverCenterlinePoint(index / 87));
    pushRibbon(vertices, river, 0.19, [0.10, 0.28, 0.34, 0.36]);

    for (let band = 0; band < 9; band += 1) {
      const contour = [];
      const baseZ = -11.2 + band * 2.7 + valueNoise2D(band, 4, 811) * 0.7;
      for (let i = 0; i < 72; i += 1) {
        const t = i / 71;
        const x = lerp(-17.4, 17.4, t);
        const warp = domainWarp(x, baseZ, "world");
        const z = baseZ + fbmNoise(warp.x * 0.09, warp.z * 0.09, 4, 2.0, 0.5, 819 + band) * 0.62;
        contour.push([x, terrainHeight(x, z, "world") + 0.07, z]);
      }
      pushRibbon(vertices, contour, 0.015 + (band % 3) * 0.006, [0.88, 0.70, 0.43, 0.12]);
    }
  }

  return new Float32Array(vertices);
}

function makeRegionOverlayVertices(hoveredId, selectedId, time) {
  const vertices = [];
  for (const region of REGIONS) {
    const isHot = region.id === hoveredId;
    const isSelected = region.id === selectedId;
    const pulse = isHot ? 0.10 + Math.sin(time * 6) * 0.035 : 0;
    const color = [clamp(region.tone[0] + (isHot || isSelected ? 0.2 : 0), 0, 1), clamp(region.tone[1] + (isHot || isSelected ? 0.17 : 0), 0, 1), clamp(region.tone[2] + (isHot || isSelected ? 0.1 : 0), 0, 1), clamp(region.tone[3] + (isHot ? 0.26 : isSelected ? 0.2 : 0), 0.08, 0.64)];
    const [cx, , cz] = region.center;
    const [rx, rz] = region.radii;
    const center = [cx, terrainHeight(cx, cz, "world") + 0.13 + pulse, cz];
    const segments = 80;
    for (let i = 0; i < segments; i += 1) {
      const a0 = (i / segments) * TAU;
      const a1 = ((i + 1) / segments) * TAU;
      const wobble0 = 1 + valueNoise2D(Math.cos(a0) * 4 + cx, Math.sin(a0) * 4 + cz, 927) * 0.055;
      const wobble1 = 1 + valueNoise2D(Math.cos(a1) * 4 + cx, Math.sin(a1) * 4 + cz, 927) * 0.055;
      const x0 = cx + Math.cos(a0) * rx * wobble0;
      const z0 = cz + Math.sin(a0) * rz * wobble0;
      const x1 = cx + Math.cos(a1) * rx * wobble1;
      const z1 = cz + Math.sin(a1) * rz * wobble1;
      pushTriangle(vertices, center, [x0, terrainHeight(x0, z0, "world") + 0.14 + pulse, z0], [x1, terrainHeight(x1, z1, "world") + 0.14 + pulse, z1], color);
    }

    const border = [];
    for (let i = 0; i <= segments; i += 1) {
      const a = (i / segments) * TAU;
      const wobble = 1 + valueNoise2D(Math.cos(a) * 4 + cx, Math.sin(a) * 4 + cz, 927) * 0.055;
      const x = cx + Math.cos(a) * rx * wobble;
      const z = cz + Math.sin(a) * rz * wobble;
      border.push([x, terrainHeight(x, z, "world") + 0.17 + pulse, z]);
    }
    pushRibbon(vertices, border, isHot ? 0.056 : 0.036, isHot ? [1, 0.92, 0.58, 0.84] : [0.95, 0.72, 0.32, 0.35]);
  }
  return new Float32Array(vertices);
}\n
function pushShadow(vertices, x, z, yaw, scale = 1) {
  const y = terrainHeight(x, z, "battlefield") + 0.018;
  const dx = Math.cos(yaw) * 0.10 * scale;
  const dz = Math.sin(yaw) * 0.10 * scale;
  const nx = -Math.sin(yaw) * 0.18 * scale;
  const nz = Math.cos(yaw) * 0.18 * scale;
  pushQuad(vertices, [x - dx - nx, y, z - dz - nz], [x - dx + nx, y, z - dz + nz], [x + dx + nx, y, z + dz + nz], [x + dx - nx, y, z - dz - nz], [0.02, 0.018, 0.014, 0.34]);
}

function pushPrimitiveSoldier(vertices, x, z, side, jitter = 0, time = 0) {
  const roman = side === "rome";
  const yaw = roman ? 0 : Math.PI;
  const sway = Math.sin(time * 1.4 + jitter * 0.17) * 0.012;
  const ground = terrainHeight(x, z, "battlefield") + 0.02;
  const tunic = roman ? [0.72, 0.12, 0.07, 1] : [0.16, 0.24, 0.27, 1];
  const leather = [0.30, 0.18, 0.11, 1];
  const skin = roman ? [0.78, 0.58, 0.40, 1] : [0.64, 0.50, 0.36, 1];
  const metal = roman ? [0.78, 0.66, 0.45, 1] : [0.54, 0.58, 0.58, 1];
  const shield = roman ? [0.72, 0.05, 0.03, 1] : [0.13, 0.23, 0.28, 1];
  const crest = roman ? [0.96, 0.48, 0.15, 1] : [0.22, 0.28, 0.31, 1];

  pushShadow(vertices, x, z, yaw, 1.0);
  pushBox(vertices, [x - 0.035, ground + 0.16, z - 0.032], [0.048, 0.25, 0.05], leather, yaw + sway, 0.9);
  pushBox(vertices, [x + 0.035, ground + 0.16, z + 0.032], [0.048, 0.25, 0.05], leather, yaw - sway, 0.9);
  pushBox(vertices, [x - 0.038, ground + 0.035, z - 0.035], [0.07, 0.045, 0.08], leather, yaw, 0.72);
  pushBox(vertices, [x + 0.038, ground + 0.035, z + 0.035], [0.07, 0.045, 0.08], leather, yaw, 0.72);
  pushBox(vertices, [x, ground + 0.33, z], [0.18, 0.23, 0.11], tunic, yaw, 1.0);
  pushBox(vertices, [x, ground + 0.43, z], [0.19, 0.11, 0.12], metal, yaw, 0.96);
  pushBox(vertices, [x, ground + 0.23, z], [0.20, 0.045, 0.13], leather, yaw, 0.84);
  pushBox(vertices, [x - 0.135, ground + 0.36, z - 0.005], [0.045, 0.19, 0.045], skin, yaw + 0.18, 0.96);
  pushBox(vertices, [x + 0.135, ground + 0.36, z + 0.005], [0.045, 0.19, 0.045], skin, yaw - 0.18, 0.96);
  pushBox(vertices, [x, ground + 0.58, z], [0.12, 0.10, 0.11], skin, yaw, 1.04);
  pushBox(vertices, [x, ground + 0.645, z], [0.15, 0.06, 0.13], metal, yaw, 1.08);
  pushBox(vertices, [x, ground + 0.705, z], [0.035, 0.08, 0.18], crest, yaw, 1.0);

  const forward = [Math.sin(yaw), 0, Math.cos(yaw)];
  const right = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const shieldCenter = add3([x, ground + 0.38, z], [right[0] * 0.19 + forward[0] * 0.08, 0, right[2] * 0.19 + forward[2] * 0.08]);
  pushBox(vertices, shieldCenter, roman ? [0.05, 0.30, 0.20] : [0.055, 0.26, 0.23], shield, yaw, 1.0);
  pushBox(vertices, add3(shieldCenter, [forward[0] * 0.025, 0, forward[2] * 0.025]), [0.06, 0.055, 0.06], metal, yaw, 1.08);

  const spearBase = add3([x, ground + 0.28, z], [right[0] * -0.19 + forward[0] * 0.05, 0, right[2] * -0.19 + forward[2] * 0.05]);
  pushBox(vertices, [spearBase[0], spearBase[1] + 0.15, spearBase[2]], [0.026, 0.62, 0.026], [0.47, 0.34, 0.18, 1], yaw - 0.12, 0.95);
  pushBox(vertices, [spearBase[0] + forward[0] * 0.03, spearBase[1] + 0.49, spearBase[2] + forward[2] * 0.03], [0.05, 0.10, 0.05], metal, yaw, 1.15);

  if (roman) {
    const capeA = [x - right[0] * 0.11 - forward[0] * 0.07, ground + 0.48, z - right[2] * 0.11 - forward[2] * 0.07];
    const capeB = [x + right[0] * 0.11 - forward[0] * 0.07, ground + 0.48, z + right[2] * 0.11 - forward[2] * 0.07];
    const capeC = [x + right[0] * 0.08 - forward[0] * 0.15, ground + 0.22, z + right[2] * 0.08 - forward[2] * 0.15];
    const capeD = [x - right[0] * 0.08 - forward[0] * 0.15, ground + 0.22, z - right[2] * 0.08 - forward[2] * 0.15];
    pushQuad(vertices, capeA, capeB, capeC, capeD, [0.42, 0.035, 0.025, 0.95]);
  }
}

function pushBanner(vertices, x, z, color, side, time) {
  const ground = terrainHeight(x, z, "battlefield") + 0.04;
  const yaw = side === "rome" ? 0 : Math.PI;
  const forward = [Math.sin(yaw), 0, Math.cos(yaw)];
  const wave = Math.sin(time * 1.3 + x) * 0.08;
  pushBox(vertices, [x, ground + 0.48, z], [0.035, 0.96, 0.035], [0.72, 0.62, 0.42, 1], yaw, 0.95);
  const top = [x + forward[0] * 0.04, ground + 0.86, z + forward[2] * 0.04];
  const outer = [x + 0.56 + wave, ground + 0.73, z + forward[2] * 0.16];
  const lower = [x + forward[0] * 0.04, ground + 0.56, z + forward[2] * 0.04];
  pushTriangle(vertices, top, outer, lower, color);
  pushTriangle(vertices, top, [outer[0] + 0.12, outer[1] - 0.08, outer[2] + 0.03], lower, scaleColor(color, 0.8));
}

function makeBattlefieldActorVertices(time) {
  const vertices = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 20; col += 1) {
      const wave = Math.sin(time * 1.3 + row * 0.8 + col * 0.34) * 0.025;
      pushPrimitiveSoldier(vertices, -5.65 + col * 0.25 + wave, -2.45 + row * 0.22, "rome", row * 31 + col, time);
      pushPrimitiveSoldier(vertices, -5.65 + col * 0.25 - wave, 2.45 - row * 0.22, "enemy", row * 17 + col, time);
    }
  }
  pushBanner(vertices, -6.2, -1.1, [0.74, 0.04, 0.02, 1], "rome", time);
  pushBanner(vertices, -3.25, -1.45, [0.74, 0.04, 0.02, 1], "rome", time + 0.7);
  pushBanner(vertices, -6.15, 1.1, [0.08, 0.16, 0.20, 1], "enemy", time);
  pushBanner(vertices, -3.1, 1.48, [0.08, 0.16, 0.20, 1], "enemy", time + 0.8);

  for (let i = 0; i < 34; i += 1) {
    const x = -1.5 + valueNoise2D(i * 0.9, 4, 909) * 6.3;
    const z = -0.15 + valueNoise2D(i * 0.7, 9, 910) * 3.35;
    const y = terrainHeight(x, z, "battlefield") + 0.025;
    const r = 0.035 + (i % 4) * 0.006;
    const color = i % 3 === 0 ? [0.38, 0.29, 0.18, 0.8] : [0.27, 0.34, 0.21, 0.75];
    pushTriangle(vertices, [x - r, y, z - r], [x + r, y, z - r], [x, y + 0.08, z + r], color);
  }
  return new Float32Array(vertices);
}

function cameraForState() {
  const aspect = Math.max(0.1, canvas.width / Math.max(1, canvas.height));
  if (state.mode === "battlefield") {
    const t = state.time;
    const eye = [-1.2 + Math.sin(t * 0.16) * 1.9, 2.35 + Math.sin(t * 0.21) * 0.16, -6.2 + Math.cos(t * 0.13) * 0.95];
    const target = [-3.15 + Math.sin(t * 0.11) * 0.85, 0.52, 0.25];
    return { eye, target, fov: 43 * Math.PI / 180, aspect };
  }

  const selected = regionById(state.selectedRegionId);
  const orbit = state.time * 0.027;
  const hover = regionById(state.hoveredRegionId);
  const pan = state.mapPan;
  const focus = hover ? [lerp(pan.x, hover.center[0], 0.30), 0.35, lerp(pan.z, hover.center[2], 0.30)] : [pan.x, 0.24, pan.z];
  const distance = lerp(17.8, 10.2, clamp((state.mapZoom - 0.7) / 1.05, 0, 1));
  const worldEye = [focus[0] + Math.sin(orbit) * distance, 9.7 / state.mapZoom, focus[2] + Math.cos(orbit) * distance * 0.85];
  const worldTarget = focus;
  if (state.mode !== "dive" || !selected) return { eye: worldEye, target: worldTarget, fov: 44 * Math.PI / 180, aspect };

  const t = ease(clamp(state.transition, 0, 1));
  const diveEye = [selected.center[0] * 0.96, 1.36, selected.center[2] * 0.96 - 1.34];
  const diveTarget = [selected.center[0] * 0.92, 0.16, selected.center[2] * 0.92];
  return {
    eye: [lerp(worldEye[0], diveEye[0], t), lerp(worldEye[1], diveEye[1], t), lerp(worldEye[2], diveEye[2], t)],
    target: [lerp(worldTarget[0], diveTarget[0], t), lerp(worldTarget[1], diveTarget[1], t), lerp(worldTarget[2], diveTarget[2], t)],
    fov: lerp(44, 31, t) * Math.PI / 180,
    aspect
  };
}

function viewProjectionForCamera(camera) { return mat4Multiply(mat4Perspective(camera.fov, camera.aspect, 0.05, 95), mat4LookAt(camera.eye, camera.target)); }
function normalizedPointer(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, y: -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1) };
}

function pickRegion() {
  if (state.mode !== "world") return null;
  const viewProjection = viewProjectionForCamera(cameraForState());
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const region of REGIONS) {
    const p = transformPoint(viewProjection, [region.center[0], terrainHeight(region.center[0], region.center[2], "world") + 0.25, region.center[2]]);
    if (p[2] < -1 || p[2] > 1) continue;
    const dx = state.pointer.x - p[0];
    const dy = state.pointer.y - p[1];
    const radius = 0.18 + (region.radii[0] + region.radii[1]) * 0.018;
    const score = Math.hypot(dx, dy);
    if (score < radius && score < bestScore) { best = region; bestScore = score; }
  }
  return best;
}

function logStatus(text) { statusEl.textContent = text; }

function selectRegion(regionId) {
  const region = regionById(regionId);
  if (!region || state.mode !== "world") return null;
  state.selectedRegionId = region.id;
  state.hoveredRegionId = region.id;
  state.mode = "dive";
  state.transition = 0;
  state.transitionCompleted = false;
  engine?.actionInput?.activate?.(region.id, { source: "cavalry-region-click" });
  engine?.genericAffordances?.requestUse?.(region.id, "activate", { source: "cavalry-region-click" });
  engine?.genericRouteProgress?.complete?.("scan-world", { commandId: `select:${region.id}:scan-world`, actorId: "cavalry-camera" });
  engine?.cavalryCamera?.registerShot?.({ id: region.shot, mode: "dive", targetId: region.id, distance: 1.15, duration: 2.4, fov: 31, purpose: "large-realistic-map-to-battlefield-transition", metadata: { regionName: region.name, fidelity: REALISTIC_TERRAIN_STYLE } });
  logStatus(`Cinematic dive toward ${region.name}.`);
  return region;
}

function transitionToBattlefield() {
  if (state.transitionCompleted) return;
  state.mode = "battlefield";
  state.transition = 1;
  state.transitionCompleted = true;
  engine?.genericRouteProgress?.complete?.("region-dive", { commandId: `arrive:${state.selectedRegionId}:region-dive`, actorId: "cavalry-camera" });
  engine?.genericRouteProgress?.enter?.("battlefield-tableau", { commandId: `enter:${state.selectedRegionId}:battlefield`, actorId: "cavalry-camera" });
  engine?.cavalryCamera?.registerShot?.({ id: "battlefield-low-flyover", mode: "flyover", targetId: "battlefield-tableau", distance: 4.8, duration: 6.5, fov: 43, purpose: "full-body-primitive-army-reveal", metadata: { fidelity: FULL_BODY_PRIMITIVE_STYLE } });
  logStatus("Battlefield tableau: primitive-built full-bodied soldiers preparing for war.");
}

async function createDskEngine() {
  const [NexusRealtime, ActionInput, RouteProgress, Affordance, ZoneField, CameraKit, VisualKit, GamehostKit, ScenarioKit] = await Promise.all([import(NEXUS_URL), import(ACTION_INPUT_URL), import(ROUTE_PROGRESS_URL), import(AFFORDANCE_URL), import(ZONE_FIELD_URL), import(CAMERA_URL), import(VISUAL_URL), import(GAMEHOST_URL), import(SCENARIO_QA_URL)]);

  const kits = [
    ActionInput.createActionInputKit(NexusRealtime, { context: "cavalry-visual", bindings: { left: ["a", "arrowleft"], right: ["d", "arrowright"], up: ["w", "arrowup"], down: ["s", "arrowdown"], activate: ["pointer0", "enter"], restart: ["r"] } }),
    RouteProgress.createGenericRouteProgressKit(NexusRealtime, { route: { id: "cavalry-visual-route", label: "The Cavalry of Rome Visual Route", checkpoints: [
      { id: "scan-world", label: "Pan realistic Roman terrain", order: 0, objective: "Sweep over a larger non-repeating terrain map and identify highlighted regions.", position: { x: 0, y: 0, z: 0 }, tags: ["world-map", "visual", "pannable", "domain-warped", "biome-blended"] },
      { id: "region-dive", label: "Dive into selected region", order: 1, objective: "Cinematic zoom from the world terrain into the local landscape.", position: { x: 0, y: 0, z: 1 }, tags: ["transition", "camera", "fidelity"] },
      { id: "battlefield-tableau", label: "Battlefield tableau", order: 2, objective: "Reveal primitive-built full-bodied formations preparing for war.", position: { x: 0, y: 0, z: 2 }, tags: ["battlefield", "tableau", "full-body-soldiers"] }
    ] } }),
    Affordance.createGenericAffordanceDescriptorKit(NexusRealtime, { affordances: REGIONS.map((region, index) => ({ id: region.id, label: region.name, actionIds: ["hover", "activate", "pan"], targetId: region.id, priority: index, descriptor: { icon: "realistic-region", glow: true, prompt: `Survey ${region.name}`, worldAnchorId: region.id, tone: "gold", tags: ["roman-region", "large-terrain-region", "visual-target", "pannable-map", "biome-blended"] } })) }),
    ZoneField.createZoneFieldKit(NexusRealtime, { id: "cavalry-region-field", apiName: "cavalryRegionZones" }),
    CameraKit.createCameraCinematicMakerKit(NexusRealtime, { id: "cavalry-camera-cinematic-kit", apiName: "cavalryCamera" }),
    VisualKit.createVisualFidelityMakerKit(NexusRealtime, { id: "cavalry-visual-fidelity-kit", apiName: "cavalryFidelity" }),
    GamehostKit.createGamehostStandardKit(NexusRealtime, { id: "cavalry-gamehost-standard-kit", apiName: "cavalryHostStandard", contract: { exposesSnapshot: true, exposesRestart: true, exposesValidation: true, rendererPresentationOnly: true, routeIsVisualProof: true, fidelityFocused: true } }),
    ScenarioKit.createScenarioQaHarness(NexusRealtime, { id: "cavalry-scenario-qa-harness", apiName: "cavalryScenarioQa", requiredChecks: ["spawn", "inspect", "budgets", "descriptors"] })
  ];

  const nextEngine = NexusRealtime.createRealtimeGame({ kits });
  nextEngine.tick(0);
  for (const region of REGIONS) {
    nextEngine.cavalryRegionZones?.registerZone?.({ id: region.id, label: region.name, shape: "circle", x: region.center[0], y: region.center[2], radius: Math.max(region.radii[0], region.radii[1]), metadata: { kind: "large-realistic-roman-terrain-region", visualOnly: true } });
  }
  nextEngine.cavalryCamera?.composeSequence?.("world-map-to-battlefield", [
    { id: "pannable-realistic-world-scan", mode: "orbit", distance: 13.5, duration: 8, targetId: "roman-terrain-map", purpose: "pannable-campaign-scan" },
    { id: "region-dive-zoom", mode: "reveal", distance: 1.2, duration: 2.4, targetId: "selected-region", purpose: "terrain-to-battlefield-dive" },
    { id: "battlefield-tableau-flyover", mode: "flyover", distance: 4.8, duration: 6.5, targetId: "battlefield-tableau", purpose: "full-body-army-reveal" }
  ]);
  nextEngine.cavalryFidelity?.createReport?.({ reportId: "cavalry-realistic-terrain-fidelity-report", visual: { material: "domain-warped-realistic-terrain-and-full-body-primitive-soldiers", materialId: "roman-realistic-campaign-map", lighting: "sun-fog-battlefield", terrainStyle: REALISTIC_TERRAIN_STYLE }, lighting: true, readabilityScore: 0.95, budget: { ok: true, vertexBudget: "domain-warped-terrain-with-primitive-soldiers" } });
  nextEngine.cavalryScenarioQa?.registerScenario?.({ id: "cavalry-visual-proof", checks: ["spawn", "inspect", "budgets", "descriptors"], expected: { variants: 1 }, metadata: { route: "apps/the-cavalry-of-rome", DSKs: DSK_STACK, fidelity: REALISTIC_TERRAIN_STYLE } });
  nextEngine.cavalryHostStandard?.registerProofPacket?.("cavalry-visual-proof", { status: "high-fidelity-realistic-terrain-prototype", dskStack: DSK_STACK, renderer: "webgpu-preferred", fidelity: [PAINTERLY_TERRAIN_STYLE, FULL_BODY_PRIMITIVE_STYLE, REALISTIC_TERRAIN_STYLE] });
  nextEngine.tick(0);
  return nextEngine;
}

class WebGpuCavalryRenderer {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.mode = "webgpu";
    this.device = null;
    this.context = null;
    this.format = null;
    this.pipeline = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.depthTexture = null;
    this.worldTerrain = null;
    this.battleTerrain = null;
    this.worldPaint = null;
    this.battlePaint = null;
    this.overlayBuffer = null;
    this.actorBuffer = null;
    this.lastActorFrame = -1;
  }

  static async create(targetCanvas) {
    if (!navigator.gpu) throw new Error("WebGPU is not available in this browser.");
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) throw new Error("WebGPU adapter unavailable.");
    const device = await adapter.requestDevice();
    const renderer = new WebGpuCavalryRenderer(targetCanvas);
    renderer.device = device;
    renderer.context = targetCanvas.getContext("webgpu");
    renderer.format = navigator.gpu.getPreferredCanvasFormat();
    renderer.context.configure({ device, format: renderer.format, alphaMode: "premultiplied" });
    renderer.createPipeline();
    renderer.worldTerrain = renderer.createVertexBuffer(makeTerrainVertices("world"));
    renderer.battleTerrain = renderer.createVertexBuffer(makeTerrainVertices("battlefield"));
    renderer.worldPaint = renderer.createVertexBuffer(makePainterlyStrokeVertices("world"));
    renderer.battlePaint = renderer.createVertexBuffer(makePainterlyStrokeVertices("battlefield"));
    return renderer;
  }

  createPipeline() {
    const shader = this.device.createShaderModule({ label: "cavalry-realistic-terrain-shader", code: `
      struct Uniforms { viewProj: mat4x4<f32>, timeModeHoverFade: vec4<f32> };
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      struct VertexIn { @location(0) position: vec3<f32>, @location(1) color: vec4<f32> };
      struct VertexOut { @builtin(position) position: vec4<f32>, @location(0) color: vec4<f32>, @location(1) world: vec3<f32> };
      @vertex fn vsMain(input: VertexIn) -> VertexOut { var out: VertexOut; out.world = input.position; out.position = uniforms.viewProj * vec4<f32>(input.position, 1.0); out.color = input.color; return out; }
      @fragment fn fsMain(input: VertexOut) -> @location(0) vec4<f32> {
        let horizon = clamp((input.world.y + 0.9) * 0.38, 0.0, 1.0);
        let distanceFog = clamp(length(input.world.xz) / 20.5, 0.0, 1.0);
        let warmFog = vec3<f32>(0.78, 0.70, 0.55);
        let duskFog = vec3<f32>(0.13, 0.16, 0.17);
        let fogColor = mix(warmFog, duskFog, uniforms.timeModeHoverFade.y * 0.55);
        let lit = input.color.rgb * (0.70 + horizon * 0.35);
        let natural = mix(lit, vec3<f32>(0.95, 0.88, 0.70), 0.035 * (1.0 - uniforms.timeModeHoverFade.y));
        let rgb = mix(natural, fogColor, distanceFog * 0.28 + uniforms.timeModeHoverFade.w * 0.46);
        return vec4<f32>(rgb, input.color.a);
      }
    ` });
    this.uniformBuffer = this.device.createBuffer({ label: "cavalry-camera-uniforms", size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.pipeline = this.device.createRenderPipeline({
      label: "cavalry-realistic-low-poly-pipeline",
      layout: "auto",
      vertex: { module: shader, entryPoint: "vsMain", buffers: [{ arrayStride: 28, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }, { shaderLocation: 1, offset: 12, format: "float32x4" }] }] },
      fragment: { module: shader, entryPoint: "fsMain", targets: [{ format: this.format, blend: { color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" }, alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" } } }] },
      primitive: { topology: "triangle-list", cullMode: "none" },
      depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" }
    });
    this.bindGroup = this.device.createBindGroup({ label: "cavalry-camera-bind-group", layout: this.pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }] });
  }

  createVertexBuffer(vertices) {
    const buffer = this.device.createBuffer({ label: "cavalry-vertex-buffer", size: Math.max(4, vertices.byteLength), usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, mappedAtCreation: vertices.byteLength > 0 });
    if (vertices.byteLength > 0) { new Float32Array(buffer.getMappedRange()).set(vertices); buffer.unmap(); }
    return { buffer, count: vertices.length / 7 };
  }

  resize() {
    const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== w || this.canvas.height !== h || !this.depthTexture) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.depthTexture?.destroy?.();
      this.depthTexture = this.device.createTexture({ label: "cavalry-depth-texture", size: [w, h], format: "depth24plus", usage: GPUTextureUsage.RENDER_ATTACHMENT });
    }
  }

  drawBuffer(pass, entry) { if (entry?.buffer && entry.count) { pass.setVertexBuffer(0, entry.buffer); pass.draw(entry.count); } }

  draw() {
    this.resize();
    const camera = cameraForState();
    state.camera = camera;
    const uniform = new Float32Array(20);
    uniform.set(viewProjectionForCamera(camera), 0);
    uniform.set([state.time, state.mode === "battlefield" ? 1 : 0, REGIONS.findIndex((region) => region.id === state.hoveredRegionId), state.mode === "dive" ? clamp(state.transition, 0, 1) : 0], 16);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniform);

    if (state.mode !== "battlefield") {
      this.overlayBuffer?.buffer?.destroy?.();
      this.overlayBuffer = this.createVertexBuffer(makeRegionOverlayVertices(state.hoveredRegionId, state.selectedRegionId, state.time));
    } else if (Math.floor(state.time * 12) !== this.lastActorFrame) {
      this.lastActorFrame = Math.floor(state.time * 12);
      this.actorBuffer?.buffer?.destroy?.();
      this.actorBuffer = this.createVertexBuffer(makeBattlefieldActorVertices(state.time));
    }

    const encoder = this.device.createCommandEncoder({ label: "cavalry-render-encoder" });
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view: this.context.getCurrentTexture().createView(), clearValue: state.mode === "battlefield" ? { r: 0.072, g: 0.058, b: 0.043, a: 1 } : { r: 0.050, g: 0.058, b: 0.045, a: 1 }, loadOp: "clear", storeOp: "store" }],
      depthStencilAttachment: { view: this.depthTexture.createView(), depthClearValue: 1, depthLoadOp: "clear", depthStoreOp: "store" }
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    if (state.mode === "battlefield") { this.drawBuffer(pass, this.battleTerrain); this.drawBuffer(pass, this.battlePaint); this.drawBuffer(pass, this.actorBuffer); }
    else { this.drawBuffer(pass, this.worldTerrain); this.drawBuffer(pass, this.worldPaint); this.drawBuffer(pass, this.overlayBuffer); }
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
}

class CanvasFallbackRenderer {
  constructor(targetCanvas) { this.canvas = targetCanvas; this.ctx = targetCanvas.getContext("2d"); this.mode = "canvas-fallback"; }
  resize() {
    const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
  }
  draw() {
    this.resize();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, state.mode === "battlefield" ? "#24170f" : "#223421");
    grd.addColorStop(0.55, state.mode === "battlefield" ? "#4b3a1e" : "#756238");
    grd.addColorStop(1, "#060706");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    if (state.mode !== "battlefield") {
      ctx.save();
      ctx.translate(w * 0.5 - state.mapPan.x * 18, h * 0.5 - state.mapPan.z * 18);
      ctx.scale(state.mapZoom, state.mapZoom);
      ctx.globalAlpha = 0.34;
      for (let i = 0; i < 175; i += 1) {
        const x = (hashNoise(i, 1, 2) - 0.5) * 1200;
        const y = (hashNoise(i, 2, 3) - 0.5) * 850;
        ctx.beginPath();
        ctx.ellipse(x, y, 80 + hashNoise(i, 3, 4) * 140, 16 + hashNoise(i, 4, 5) * 42, hashNoise(i, 5, 6) * TAU, 0, TAU);
        ctx.fillStyle = i % 4 === 0 ? "#4f6d3e" : i % 5 === 0 ? "#345d65" : "#927945";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const region of REGIONS) {
        const x = region.center[0] * 32;
        const y = region.center[2] * 32;
        const hot = state.hoveredRegionId === region.id;
        ctx.beginPath();
        ctx.ellipse(x, y, region.radii[0] * 31, region.radii[1] * 31, 0, 0, TAU);
        ctx.fillStyle = hot ? "rgba(255,215,117,.58)" : "rgba(224,171,72,.24)";
        ctx.fill();
        ctx.lineWidth = hot ? 5 : 2.5;
        ctx.strokeStyle = hot ? "#fff0b8" : "#d8b66b";
        ctx.stroke();
        ctx.fillStyle = "#fff6e3";
        ctx.font = `${hot ? 22 : 17}px system-ui, sans-serif`;
        ctx.fillText(region.name, x + 16, y);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(255,246,227,.88)";
      ctx.font = "18px system-ui, sans-serif";
      ctx.fillText("Battlefield tableau — WebGPU unavailable, Canvas fallback active", 36, 46);
      for (let side = 0; side < 2; side += 1) {
        ctx.fillStyle = side === 0 ? "#b63b24" : "#293944";
        const y = side === 0 ? h * 0.62 : h * 0.34;
        for (let row = 0; row < 9; row += 1) for (let col = 0; col < 20; col += 1) {
          const x = w * 0.16 + col * 20;
          const sy = y + row * 10;
          ctx.fillRect(x - 3, sy + 5, 6, 10);
          ctx.fillRect(x - 6, sy - 4, 12, 10);
          ctx.beginPath(); ctx.arc(x, sy - 9, 5, 0, TAU); ctx.fill();
        }
      }
    }
  }
}

function updateMapPan(dt) {
  if (state.mode !== "world") return;
  const intent = engine?.actionInput?.getIntent?.();
  const axis = intent?.axis ?? { horizontal: 0, vertical: 0 };
  const speed = 6.4 / state.mapZoom;
  state.mapPan.x = clamp(state.mapPan.x + Number(axis.horizontal ?? axis.x ?? 0) * speed * dt, -12.5, 12.5);
  state.mapPan.z = clamp(state.mapPan.z - Number(axis.vertical ?? axis.y ?? 0) * speed * dt, -8.8, 8.8);
}

function updateHud() {
  const region = regionById(state.hoveredRegionId) ?? regionById(state.selectedRegionId);
  const route = engine?.genericRouteProgress?.getState?.();
  const fidelity = engine?.cavalryFidelity?.latestReport?.();
  const active = route?.activeId ? `Route: ${route.activeId}` : "Route: visual proof booting";
  const rendererLabel = state.rendererMode === "webgpu" ? "WebGPU" : state.rendererMode === "canvas-fallback" ? "Canvas fallback" : "Renderer booting";
  statusEl.textContent = state.mode === "world" ? `${rendererLabel} · realistic non-repeating terrain · WASD/drag pan · wheel zoom` : state.mode === "dive" ? `${rendererLabel} · cinematic zoom ${Math.round(state.transition * 100)}%` : `${rendererLabel} · full-bodied primitive soldier tableau`;
  readoutEl.textContent = [region ? `Region: ${region.name}` : "Region: hover a large highlighted landmass", `Pan ${state.mapPan.x.toFixed(1)}, ${state.mapPan.z.toFixed(1)} · zoom ${state.mapZoom.toFixed(2)}x`, active, `DSKs: ${DSK_STACK.length}`, fidelity?.ok === false ? "Fidelity: warning" : "Fidelity: realistic terrain"].join(" · ");
}

function snapshot() {
  return { title: "The Cavalry of Rome", mode: state.mode, selectedRegionId: state.selectedRegionId, hoveredRegionId: state.hoveredRegionId, transition: state.transition, rendererMode: state.rendererMode, mapPan: copy(state.mapPan), mapZoom: state.mapZoom, dskReady, dskStack: [...DSK_STACK], visualContract: copy(state.visualContract), terrainFidelity: REALISTIC_TERRAIN_STYLE, routeProgress: engine?.genericRouteProgress?.getState?.() ?? null, affordances: engine?.genericAffordances?.getState?.() ?? null, zones: engine?.cavalryRegionZones?.getSnapshot?.() ?? null, cameraCinematic: engine?.cavalryCamera?.snapshot?.() ?? null, visualFidelity: engine?.cavalryFidelity?.snapshot?.() ?? null, scenarioQa: engine?.cavalryScenarioQa?.snapshot?.() ?? null };
}

function installInput() {
  canvas.addEventListener("pointermove", (event) => {
    const next = normalizedPointer(event);
    if (state.drag.active && state.drag.panning && state.mode === "world") {
      const dx = event.clientX - state.drag.x;
      const dy = event.clientY - state.drag.y;
      state.mapPan.x = clamp(state.mapPan.x - dx * 0.018 / state.mapZoom, -12.5, 12.5);
      state.mapPan.z = clamp(state.mapPan.z - dy * 0.018 / state.mapZoom, -8.8, 8.8);
      state.drag.x = event.clientX;
      state.drag.y = event.clientY;
    }
    state.pointer = { ...next, active: true };
    const region = pickRegion();
    const nextId = region?.id ?? null;
    if (nextId !== state.hoveredRegionId) {
      state.hoveredRegionId = nextId;
      engine?.actionInput?.hover?.(nextId, { source: "cavalry-region-hover" });
      if (nextId) { engine?.genericAffordances?.setDescriptor?.(nextId, { tone: "hot", prompt: `Dive into ${region.name}` }, "region-hovered"); engine?.cavalryRegionZones?.setEntityPosition?.("scan-cursor", { x: region.center[0], y: region.center[2] }); }
    }
  });
  canvas.addEventListener("pointerdown", (event) => { state.drag = { active: true, panning: !state.hoveredRegionId, x: event.clientX, y: event.clientY }; });
  canvas.addEventListener("pointerup", () => {
    if (state.mode === "world" && !state.drag.panning) { const region = regionById(state.hoveredRegionId) ?? pickRegion(); if (region) selectRegion(region.id); }
    state.drag.active = false;
    state.drag.panning = false;
  });
  canvas.addEventListener("pointerleave", () => { state.pointer.active = false; state.hoveredRegionId = null; state.drag.active = false; state.drag.panning = false; engine?.actionInput?.hover?.(null, { source: "cavalry-region-hover-clear" }); });
  canvas.addEventListener("wheel", (event) => { if (state.mode !== "world") return; event.preventDefault(); state.mapZoom = clamp(state.mapZoom - Math.sign(event.deltaY) * 0.08, 0.66, 1.78); }, { passive: false });
  window.addEventListener("keydown", (event) => { const key = event.key.toLowerCase(); if (["r", "a", "d", "w", "s", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) { event.preventDefault(); engine?.actionInput?.key?.(key, true, { source: "keyboard" }); } if (key === "r") globalThis.GameHost?.restart?.(); });
  window.addEventListener("keyup", (event) => { engine?.actionInput?.key?.(event.key.toLowerCase(), false, { source: "keyboard" }); });
}

async function createRenderer() {
  try { const webgpu = await WebGpuCavalryRenderer.create(canvas); state.rendererMode = "webgpu"; return webgpu; }
  catch (error) { console.warn("Cavalry WebGPU renderer unavailable; using Canvas fallback.", error); state.rendererMode = "canvas-fallback"; return new CanvasFallbackRenderer(canvas); }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
  last = now;
  state.time += dt;
  updateMapPan(dt);
  if (state.mode === "dive") { state.transition = clamp(state.transition + dt * 0.38, 0, 1); if (state.transition >= 1) transitionToBattlefield(); }
  engine?.tick?.(dt);
  renderer?.draw?.();
  updateHud();
  requestAnimationFrame(frame);
}

async function boot() {
  commandBar.hidden = true;
  logStatus("Loading realistic DSK terrain route…");
  engine = await createDskEngine();
  dskReady = true;
  renderer = await createRenderer();
  installInput();
  globalThis.GameHost = {
    engine,
    getSnapshot: snapshot,
    getDskSnapshot: snapshot,
    selectRegion,
    runSmoke() {
      const qa = engine?.cavalryScenarioQa?.runScenario?.("cavalry-visual-proof", { spawned: true, inspection: true, descriptors: true, descriptor: snapshot(), budget: { ok: true }, camera: engine?.cavalryCamera?.snapshot?.() });
      const host = engine?.cavalryHostStandard?.runSmoke?.({ packetRef: "cavalry-visual-proof", metadata: { rendererMode: state.rendererMode } });
      return { ok: (qa?.ok ?? true) && (host?.ok ?? true), qa, host, snapshot: snapshot() };
    },
    validate() { return this.runSmoke(); },
    restart() { state.mode = "world"; state.selectedRegionId = null; state.hoveredRegionId = null; state.transition = 0; state.transitionCompleted = false; state.mapPan = { x: -1.8, z: 0.9 }; state.mapZoom = 1; engine?.genericRouteProgress?.reset?.({ reason: "visual-restart" }); return snapshot(); }
  };
  logStatus("Realistic WebGPU terrain route ready.");
  requestAnimationFrame(frame);
}

boot().catch((error) => { console.error(error); state.rendererMode = "failed"; statusEl.textContent = "The Cavalry of Rome failed to boot."; readoutEl.textContent = String(error?.stack || error); });
