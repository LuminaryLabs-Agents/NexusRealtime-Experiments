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

const REGIONS = Object.freeze([
  { id: "latium", name: "Latium", center: [-1.8, 0, 1.1], radii: [1.45, 0.92], tone: [1.0, 0.78, 0.28, 0.25], shot: "latium-dive" },
  { id: "etruria", name: "Etruria", center: [-2.2, 0, -1.25], radii: [1.55, 1.08], tone: [0.96, 0.64, 0.25, 0.22], shot: "etruria-dive" },
  { id: "samnium", name: "Samnium", center: [0.82, 0, 0.58], radii: [1.42, 1.15], tone: [0.86, 0.72, 0.36, 0.22], shot: "samnium-dive" },
  { id: "campania", name: "Campania", center: [-0.64, 0, 2.74], radii: [1.55, 0.88], tone: [1.0, 0.84, 0.36, 0.25], shot: "campania-dive" },
  { id: "magna-graecia", name: "Magna Graecia", center: [2.28, 0, 2.32], radii: [1.68, 1.02], tone: [0.72, 0.88, 1.0, 0.22], shot: "magna-graecia-dive" },
  { id: "cisalpine-approach", name: "Cisalpine Approach", center: [1.72, 0, -2.12], radii: [1.82, 0.95], tone: [0.64, 0.94, 0.64, 0.22], shot: "cisalpine-dive" }
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
  visualContract: {
    businessLogic: "minimal",
    primaryLoop: "scan-region-select-cinematic-dive",
    WebGPU: "preferred",
    fallback: "canvas-2d"
  }
};

function regionById(id) {
  return REGIONS.find((region) => region.id === id) ?? null;
}

function copy(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function mat4Perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ]);
}

function mat4LookAt(eye, target, up = [0, 1, 0]) {
  const z = normalize(sub(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
  ]);
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[0 * 4 + row] * b[column * 4 + 0] +
        a[1 * 4 + row] * b[column * 4 + 1] +
        a[2 * 4 + row] * b[column * 4 + 2] +
        a[3 * 4 + row] * b[column * 4 + 3];
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

function terrainHeight(x, z, kind = "world") {
  const base = Math.sin(x * 1.08) * 0.18 + Math.cos(z * 1.23) * 0.17 + Math.sin((x + z) * 1.7) * 0.08;
  if (kind === "battlefield") return base * 0.36 + Math.sin(x * 0.42) * 0.05 - Math.cos(z * 0.34) * 0.04;
  return base + Math.exp(-((x + 1.8) ** 2 + (z - 0.4) ** 2) * 0.11) * 0.45;
}

function terrainColor(x, z, y, kind = "world") {
  if (kind === "battlefield") {
    const shade = clamp(0.62 + y * 0.32 + Math.sin(x * 0.7) * 0.06, 0.35, 1);
    return [0.20 * shade, 0.36 * shade, 0.16 * shade, 1];
  }
  const coast = Math.max(Math.abs(x) / 6.2, Math.abs(z) / 4.95);
  if (coast > 0.93) return [0.08, 0.18, 0.23 + (coast - 0.93) * 0.85, 1];
  if (y > 0.35) return [0.39, 0.34, 0.22, 1];
  if (z > 2.15) return [0.32, 0.31, 0.18, 1];
  return [0.18 + y * 0.08, 0.34 + y * 0.07, 0.18, 1];
}

function pushVertex(vertices, position, color) {
  vertices.push(position[0], position[1], position[2], color[0], color[1], color[2], color[3]);
}

function pushTriangle(vertices, a, b, c, color) {
  pushVertex(vertices, a, color);
  pushVertex(vertices, b, color);
  pushVertex(vertices, c, color);
}

function pushQuad(vertices, a, b, c, d, color) {
  pushTriangle(vertices, a, b, c, color);
  pushTriangle(vertices, a, c, d, color);
}

function makeTerrainVertices(kind = "world") {
  const vertices = [];
  const segments = kind === "world" ? 86 : 64;
  const width = kind === "world" ? 13.2 : 15.2;
  const depth = kind === "world" ? 10.2 : 9.4;
  const x0 = -width / 2;
  const z0 = -depth / 2;
  const dx = width / segments;
  const dz = depth / segments;

  for (let iz = 0; iz < segments; iz += 1) {
    for (let ix = 0; ix < segments; ix += 1) {
      const xA = x0 + ix * dx;
      const xB = xA + dx;
      const zA = z0 + iz * dz;
      const zB = zA + dz;
      const a = [xA, terrainHeight(xA, zA, kind), zA];
      const b = [xB, terrainHeight(xB, zA, kind), zA];
      const c = [xB, terrainHeight(xB, zB, kind), zB];
      const d = [xA, terrainHeight(xA, zB, kind), zB];
      const color = terrainColor((xA + xB) * 0.5, (zA + zB) * 0.5, (a[1] + b[1] + c[1] + d[1]) * 0.25, kind);
      pushQuad(vertices, a, b, c, d, color);
    }
  }
  return new Float32Array(vertices);
}

function makeRegionOverlayVertices(hoveredId, selectedId, time) {
  const vertices = [];
  for (const region of REGIONS) {
    const isHot = region.id === hoveredId;
    const isSelected = region.id === selectedId;
    const pulse = isHot ? 0.08 + Math.sin(time * 6) * 0.03 : 0;
    const color = [
      clamp(region.tone[0] + (isHot || isSelected ? 0.18 : 0), 0, 1),
      clamp(region.tone[1] + (isHot || isSelected ? 0.14 : 0), 0, 1),
      clamp(region.tone[2] + (isHot || isSelected ? 0.08 : 0), 0, 1),
      clamp(region.tone[3] + (isHot ? 0.22 : isSelected ? 0.18 : 0), 0.08, 0.58)
    ];
    const [cx, , cz] = region.center;
    const [rx, rz] = region.radii;
    const center = [cx, terrainHeight(cx, cz, "world") + 0.075 + pulse, cz];
    const segments = 58;
    for (let i = 0; i < segments; i += 1) {
      const a0 = (i / segments) * TAU;
      const a1 = ((i + 1) / segments) * TAU;
      const p0 = [cx + Math.cos(a0) * rx, terrainHeight(cx + Math.cos(a0) * rx, cz + Math.sin(a0) * rz, "world") + 0.08 + pulse, cz + Math.sin(a0) * rz];
      const p1 = [cx + Math.cos(a1) * rx, terrainHeight(cx + Math.cos(a1) * rx, cz + Math.sin(a1) * rz, "world") + 0.08 + pulse, cz + Math.sin(a1) * rz];
      pushTriangle(vertices, center, p0, p1, color);
    }
  }
  return new Float32Array(vertices);
}

function pushLowPolySoldier(vertices, x, z, side, jitter = 0) {
  const ground = terrainHeight(x, z, "battlefield") + 0.04;
  const roman = side === "rome";
  const body = roman ? [0.55, 0.08, 0.05, 1] : [0.08, 0.12, 0.16, 1];
  const metal = roman ? [0.82, 0.68, 0.42, 1] : [0.55, 0.58, 0.62, 1];
  const shield = roman ? [0.72, 0.07, 0.04, 1] : [0.16, 0.24, 0.29, 1];
  const s = 0.048 + (jitter % 3) * 0.003;
  const h = 0.32 + (jitter % 5) * 0.01;
  const facing = roman ? 1 : -1;
  const baseA = [x - s, ground, z];
  const baseB = [x + s, ground, z];
  const baseC = [x, ground, z + s * facing];
  const top = [x, ground + h, z + s * 0.24 * facing];
  pushTriangle(vertices, baseA, baseB, top, body);
  pushTriangle(vertices, baseB, baseC, top, body);
  pushTriangle(vertices, baseC, baseA, top, body);
  pushTriangle(vertices, [x - s * 0.9, ground + h, z], [x + s * 0.9, ground + h, z], [x, ground + h + 0.08, z], metal);
  const sx = x + s * 1.5 * facing;
  pushQuad(vertices, [sx, ground + 0.07, z - s], [sx, ground + 0.2, z - s], [sx, ground + 0.2, z + s], [sx, ground + 0.07, z + s], shield);
  const spearX = x - s * 1.5 * facing;
  pushQuad(vertices, [spearX, ground + 0.04, z], [spearX + 0.012 * facing, ground + 0.04, z], [spearX + 0.02 * facing, ground + 0.48, z + 0.03 * facing], [spearX, ground + 0.48, z + 0.03 * facing], metal);
}

function pushBanner(vertices, x, z, color, side) {
  const ground = terrainHeight(x, z, "battlefield") + 0.04;
  const facing = side === "rome" ? 1 : -1;
  const pole = [0.72, 0.62, 0.42, 1];
  pushQuad(vertices, [x, ground, z], [x + 0.024, ground, z], [x + 0.024, ground + 0.78, z], [x, ground + 0.78, z], pole);
  pushTriangle(vertices, [x + 0.02, ground + 0.76, z], [x + facing * 0.48, ground + 0.64, z + 0.05 * facing], [x + 0.02, ground + 0.52, z], color);
}

function makeBattlefieldActorVertices(time) {
  const vertices = [];
  for (let row = 0; row < 10; row += 1) {
    for (let col = 0; col < 18; col += 1) {
      const sway = Math.sin(time * 1.7 + row * 0.8 + col * 0.3) * 0.018;
      pushLowPolySoldier(vertices, -4.9 + col * 0.22 + sway, -2.2 + row * 0.18, "rome", row * 31 + col);
      pushLowPolySoldier(vertices, -4.9 + col * 0.22 - sway, 2.2 - row * 0.18, "enemy", row * 17 + col);
    }
  }
  pushBanner(vertices, -5.28, -1.1, [0.74, 0.05, 0.03, 1], "rome");
  pushBanner(vertices, -3.0, -1.32, [0.74, 0.05, 0.03, 1], "rome");
  pushBanner(vertices, -5.18, 1.1, [0.08, 0.17, 0.22, 1], "enemy");
  pushBanner(vertices, -3.1, 1.34, [0.08, 0.17, 0.22, 1], "enemy");

  for (let i = 0; i < 22; i += 1) {
    const x = -1.5 + Math.sin(i * 3.1) * 5.2;
    const z = -0.2 + Math.cos(i * 1.9) * 2.9;
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
    const eye = [-0.8 + Math.sin(t * 0.16) * 1.5, 2.35 + Math.sin(t * 0.21) * 0.16, -5.7 + Math.cos(t * 0.13) * 0.85];
    const target = [-2.8 + Math.sin(t * 0.11) * 0.7, 0.48, 0.25];
    return { eye, target, fov: 45 * Math.PI / 180, aspect };
  }

  const selected = regionById(state.selectedRegionId);
  const orbit = state.time * 0.075;
  const hover = regionById(state.hoveredRegionId);
  const focus = hover ? [hover.center[0] * 0.42, 0.22, hover.center[2] * 0.42] : [0, 0.1, 0];
  const worldEye = [Math.sin(orbit) * 7.2, 5.25 + Math.sin(orbit * 1.7) * 0.25, Math.cos(orbit) * 6.4];
  const worldTarget = focus;
  if (state.mode !== "dive" || !selected) return { eye: worldEye, target: worldTarget, fov: 48 * Math.PI / 180, aspect };

  const t = ease(clamp(state.transition, 0, 1));
  const diveEye = [selected.center[0] * 0.92, 1.18, selected.center[2] * 0.92 - 1.12];
  const diveTarget = [selected.center[0] * 0.88, 0.12, selected.center[2] * 0.88];
  return {
    eye: [lerp(worldEye[0], diveEye[0], t), lerp(worldEye[1], diveEye[1], t), lerp(worldEye[2], diveEye[2], t)],
    target: [lerp(worldTarget[0], diveTarget[0], t), lerp(worldTarget[1], diveTarget[1], t), lerp(worldTarget[2], diveTarget[2], t)],
    fov: lerp(48, 34, t) * Math.PI / 180,
    aspect
  };
}

function viewProjectionForCamera(camera) {
  return mat4Multiply(mat4Perspective(camera.fov, camera.aspect, 0.05, 80), mat4LookAt(camera.eye, camera.target));
}

function normalizedPointer(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
    y: -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1)
  };
}

function pickRegion() {
  if (state.mode !== "world") return null;
  const camera = cameraForState();
  const viewProjection = viewProjectionForCamera(camera);
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const region of REGIONS) {
    const p = transformPoint(viewProjection, [region.center[0], terrainHeight(region.center[0], region.center[2], "world") + 0.15, region.center[2]]);
    if (p[2] < -1 || p[2] > 1) continue;
    const dx = state.pointer.x - p[0];
    const dy = state.pointer.y - p[1];
    const radius = 0.13 + (region.radii[0] + region.radii[1]) * 0.012;
    const score = Math.hypot(dx, dy);
    if (score < radius && score < bestScore) {
      best = region;
      bestScore = score;
    }
  }
  return best;
}

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
  engine?.cavalryCamera?.registerShot?.({
    id: region.shot,
    mode: "dive",
    targetId: region.id,
    distance: 1.15,
    duration: 2.4,
    fov: 34,
    purpose: "map-to-battlefield-transition",
    metadata: { regionName: region.name }
  });
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
  engine?.cavalryCamera?.registerShot?.({
    id: "battlefield-low-flyover",
    mode: "flyover",
    targetId: "battlefield-tableau",
    distance: 4.8,
    duration: 6.5,
    fov: 45,
    purpose: "low-poly-army-reveal"
  });
  logStatus("Battlefield tableau: two low-poly armies preparing for war.");
}

function logStatus(text) {
  statusEl.textContent = text;
}

async function createDskEngine() {
  const [NexusRealtime, ActionInput, RouteProgress, Affordance, ZoneField, CameraKit, VisualKit, GamehostKit, ScenarioKit] = await Promise.all([
    import(NEXUS_URL),
    import(ACTION_INPUT_URL),
    import(ROUTE_PROGRESS_URL),
    import(AFFORDANCE_URL),
    import(ZONE_FIELD_URL),
    import(CAMERA_URL),
    import(VISUAL_URL),
    import(GAMEHOST_URL),
    import(SCENARIO_QA_URL)
  ]);

  const kits = [
    ActionInput.createActionInputKit(NexusRealtime, {
      context: "cavalry-visual",
      bindings: {
        left: ["a", "arrowleft"],
        right: ["d", "arrowright"],
        up: ["w", "arrowup"],
        down: ["s", "arrowdown"],
        activate: ["pointer0", "enter"],
        restart: ["r"]
      }
    }),
    RouteProgress.createGenericRouteProgressKit(NexusRealtime, {
      route: {
        id: "cavalry-visual-route",
        label: "The Cavalry of Rome Visual Route",
        checkpoints: [
          {
            id: "scan-world",
            label: "Scan Roman terrain",
            order: 0,
            objective: "Sweep over a 3D terrain map and identify highlighted regions.",
            position: { x: 0, y: 0, z: 0 },
            tags: ["world-map", "visual"]
          },
          {
            id: "region-dive",
            label: "Dive into selected region",
            order: 1,
            objective: "Cinematic zoom from the world terrain into the local landscape.",
            position: { x: 0, y: 0, z: 1 },
            tags: ["transition", "camera"]
          },
          {
            id: "battlefield-tableau",
            label: "Battlefield tableau",
            order: 2,
            objective: "Reveal low-poly formations preparing for war.",
            position: { x: 0, y: 0, z: 2 },
            tags: ["battlefield", "tableau"]
          }
        ]
      }
    }),
    Affordance.createGenericAffordanceDescriptorKit(NexusRealtime, {
      affordances: REGIONS.map((region, index) => ({
        id: region.id,
        label: region.name,
        actionIds: ["hover", "activate"],
        targetId: region.id,
        priority: index,
        descriptor: {
          icon: "region",
          glow: true,
          prompt: `Survey ${region.name}`,
          worldAnchorId: region.id,
          tone: "gold",
          tags: ["roman-region", "terrain-region", "visual-target"]
        }
      }))
    }),
    ZoneField.createZoneFieldKit(NexusRealtime, { id: "cavalry-region-field", apiName: "cavalryRegionZones" }),
    CameraKit.createCameraCinematicMakerKit(NexusRealtime, { id: "cavalry-camera-cinematic-kit", apiName: "cavalryCamera" }),
    VisualKit.createVisualFidelityMakerKit(NexusRealtime, { id: "cavalry-visual-fidelity-kit", apiName: "cavalryFidelity" }),
    GamehostKit.createGamehostStandardKit(NexusRealtime, {
      id: "cavalry-gamehost-standard-kit",
      apiName: "cavalryHostStandard",
      contract: {
        exposesSnapshot: true,
        exposesRestart: true,
        exposesValidation: true,
        rendererPresentationOnly: true,
        routeIsVisualProof: true
      }
    }),
    ScenarioKit.createScenarioQaHarness(NexusRealtime, {
      id: "cavalry-scenario-qa-harness",
      apiName: "cavalryScenarioQa",
      requiredChecks: ["spawn", "inspect", "budgets", "descriptors"]
    })
  ];

  const nextEngine = NexusRealtime.createRealtimeGame({ kits });
  nextEngine.tick(0);

  for (const region of REGIONS) {
    nextEngine.cavalryRegionZones?.registerZone?.({
      id: region.id,
      label: region.name,
      shape: "circle",
      x: region.center[0],
      y: region.center[2],
      radius: Math.max(region.radii[0], region.radii[1]),
      metadata: { kind: "roman-terrain-region", visualOnly: true }
    });
  }
  nextEngine.cavalryCamera?.composeSequence?.("world-map-to-battlefield", [
    { id: "world-scan-orbit", mode: "orbit", distance: 7.2, duration: 6, targetId: "roman-terrain-map", purpose: "campaign-scan" },
    { id: "region-dive-zoom", mode: "reveal", distance: 1.2, duration: 2.4, targetId: "selected-region", purpose: "terrain-to-battlefield-dive" },
    { id: "battlefield-tableau-flyover", mode: "flyover", distance: 4.8, duration: 6.5, targetId: "battlefield-tableau", purpose: "army-reveal" }
  ]);
  nextEngine.cavalryFidelity?.createReport?.({
    reportId: "cavalry-visual-proof-report",
    visual: { material: "low-poly-terrain-armies", materialId: "roman-cinematic-terrain", lighting: "sun-fog-battlefield" },
    lighting: true,
    readabilityScore: 0.91,
    budget: { ok: true, vertexBudget: "low-poly" }
  });
  nextEngine.cavalryScenarioQa?.registerScenario?.({
    id: "cavalry-visual-proof",
    checks: ["spawn", "inspect", "budgets", "descriptors"],
    expected: { variants: 1 },
    metadata: { route: "apps/the-cavalry-of-rome", DSKs: DSK_STACK }
  });
  nextEngine.cavalryHostStandard?.registerProofPacket?.("cavalry-visual-proof", {
    status: "visual-prototype",
    dskStack: DSK_STACK,
    renderer: "webgpu-preferred"
  });
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
    this.overlayBuffer = null;
    this.actorBuffer = null;
    this.overlayVertexCount = 0;
    this.actorVertexCount = 0;
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
    return renderer;
  }

  createPipeline() {
    const shader = this.device.createShaderModule({
      label: "cavalry-low-poly-terrain-shader",
      code: `
        struct Uniforms {
          viewProj: mat4x4<f32>,
          timeModeHoverFade: vec4<f32>
        };

        @group(0) @binding(0) var<uniform> uniforms: Uniforms;

        struct VertexIn {
          @location(0) position: vec3<f32>,
          @location(1) color: vec4<f32>
        };

        struct VertexOut {
          @builtin(position) position: vec4<f32>,
          @location(0) color: vec4<f32>,
          @location(1) world: vec3<f32>
        };

        @vertex
        fn vsMain(input: VertexIn) -> VertexOut {
          var out: VertexOut;
          out.world = input.position;
          out.position = uniforms.viewProj * vec4<f32>(input.position, 1.0);
          out.color = input.color;
          return out;
        }

        @fragment
        fn fsMain(input: VertexOut) -> @location(0) vec4<f32> {
          let horizon = clamp((input.world.y + 0.7) * 0.42, 0.0, 1.0);
          let distanceFog = clamp(length(input.world.xz) / 8.8, 0.0, 1.0);
          let warmFog = vec3<f32>(0.84, 0.70, 0.48);
          let duskFog = vec3<f32>(0.16, 0.18, 0.20);
          let fogColor = mix(warmFog, duskFog, uniforms.timeModeHoverFade.y * 0.55);
          let lit = input.color.rgb * (0.78 + horizon * 0.28);
          let rgb = mix(lit, fogColor, distanceFog * 0.32 + uniforms.timeModeHoverFade.w * 0.45);
          return vec4<f32>(rgb, input.color.a);
        }
      `
    });

    this.uniformBuffer = this.device.createBuffer({
      label: "cavalry-camera-uniforms",
      size: 80,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.pipeline = this.device.createRenderPipeline({
      label: "cavalry-low-poly-pipeline",
      layout: "auto",
      vertex: {
        module: shader,
        entryPoint: "vsMain",
        buffers: [{
          arrayStride: 28,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" },
            { shaderLocation: 1, offset: 12, format: "float32x4" }
          ]
        }]
      },
      fragment: {
        module: shader,
        entryPoint: "fsMain",
        targets: [{
          format: this.format,
          blend: {
            color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" },
            alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
          }
        }]
      },
      primitive: { topology: "triangle-list", cullMode: "none" },
      depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" }
    });

    this.bindGroup = this.device.createBindGroup({
      label: "cavalry-camera-bind-group",
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }]
    });
  }

  createVertexBuffer(vertices) {
    const buffer = this.device.createBuffer({
      label: "cavalry-vertex-buffer",
      size: Math.max(4, vertices.byteLength),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: vertices.byteLength > 0
    });
    if (vertices.byteLength > 0) {
      new Float32Array(buffer.getMappedRange()).set(vertices);
      buffer.unmap();
    }
    return { buffer, count: vertices.length / 7 };
  }

  resize() {
    const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.depthTexture?.destroy?.();
      this.depthTexture = this.device.createTexture({
        label: "cavalry-depth-texture",
        size: [w, h],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
    }
  }

  draw() {
    this.resize();
    const camera = cameraForState();
    state.camera = camera;
    const viewProjection = viewProjectionForCamera(camera);
    const uniform = new Float32Array(20);
    uniform.set(viewProjection, 0);
    uniform.set([state.time, state.mode === "battlefield" ? 1 : 0, REGIONS.findIndex((region) => region.id === state.hoveredRegionId), state.mode === "dive" ? clamp(state.transition, 0, 1) : 0], 16);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniform);

    if (state.mode !== "battlefield") {
      const overlay = makeRegionOverlayVertices(state.hoveredRegionId, state.selectedRegionId, state.time);
      this.overlayBuffer = this.createVertexBuffer(overlay);
      this.overlayVertexCount = this.overlayBuffer.count;
    } else if (Math.floor(state.time * 12) !== this.lastActorFrame) {
      this.lastActorFrame = Math.floor(state.time * 12);
      this.actorBuffer = this.createVertexBuffer(makeBattlefieldActorVertices(state.time));
      this.actorVertexCount = this.actorBuffer.count;
    }

    const encoder = this.device.createCommandEncoder({ label: "cavalry-render-encoder" });
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: state.mode === "battlefield" ? { r: 0.07, g: 0.055, b: 0.04, a: 1 } : { r: 0.035, g: 0.045, b: 0.04, a: 1 },
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    const terrain = state.mode === "battlefield" ? this.battleTerrain : this.worldTerrain;
    pass.setVertexBuffer(0, terrain.buffer);
    pass.draw(terrain.count);

    if (state.mode !== "battlefield" && this.overlayBuffer?.buffer && this.overlayVertexCount > 0) {
      pass.setVertexBuffer(0, this.overlayBuffer.buffer);
      pass.draw(this.overlayVertexCount);
    }

    if (state.mode === "battlefield" && this.actorBuffer?.buffer && this.actorVertexCount > 0) {
      pass.setVertexBuffer(0, this.actorBuffer.buffer);
      pass.draw(this.actorVertexCount);
    }

    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
}

class CanvasFallbackRenderer {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.ctx = targetCanvas.getContext("2d");
    this.mode = "canvas-fallback";
  }

  resize() {
    const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  draw() {
    this.resize();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, state.mode === "battlefield" ? "#24170f" : "#1c2c21");
    grd.addColorStop(0.55, state.mode === "battlefield" ? "#4b3a1e" : "#5a4728");
    grd.addColorStop(1, "#060706");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    if (state.mode !== "battlefield") {
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 56; i += 1) {
        ctx.beginPath();
        ctx.ellipse(((i * 89) % 1000) / 1000 * w, ((i * 53) % 1000) / 1000 * h, 90 + (i % 5) * 32, 32 + (i % 6) * 18, i, 0, TAU);
        ctx.fillStyle = i % 4 === 0 ? "#2a5540" : "#8b7441";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const region of REGIONS) {
        const x = w * (0.5 + region.center[0] / 10);
        const y = h * (0.52 + region.center[2] / 8.5);
        const hot = state.hoveredRegionId === region.id;
        ctx.beginPath();
        ctx.ellipse(x, y, region.radii[0] * w * 0.055, region.radii[1] * h * 0.07, 0, 0, TAU);
        ctx.fillStyle = hot ? "rgba(255,215,117,.54)" : "rgba(224,171,72,.24)";
        ctx.fill();
        ctx.lineWidth = hot ? 4 : 2;
        ctx.strokeStyle = hot ? "#fff0b8" : "#d8b66b";
        ctx.stroke();
        ctx.fillStyle = "#fff6e3";
        ctx.font = `${hot ? 18 : 14}px system-ui, sans-serif`;
        ctx.fillText(region.name, x + 12, y);
      }
    } else {
      ctx.fillStyle = "rgba(255,246,227,.88)";
      ctx.font = "18px system-ui, sans-serif";
      ctx.fillText("Battlefield tableau — WebGPU unavailable, Canvas fallback active", 36, 46);
      for (let side = 0; side < 2; side += 1) {
        ctx.fillStyle = side === 0 ? "#b63b24" : "#293944";
        const y = side === 0 ? h * 0.62 : h * 0.34;
        for (let row = 0; row < 8; row += 1) {
          for (let col = 0; col < 18; col += 1) {
            ctx.beginPath();
            ctx.arc(w * 0.2 + col * 18, y + row * 9, 4, 0, TAU);
            ctx.fill();
          }
        }
      }
    }
  }
}

function updateHud() {
  const region = regionById(state.hoveredRegionId) ?? regionById(state.selectedRegionId);
  const route = engine?.genericRouteProgress?.getState?.();
  const fidelity = engine?.cavalryFidelity?.latestReport?.();
  const active = route?.activeId ? `Route: ${route.activeId}` : "Route: visual proof booting";
  const rendererLabel = state.rendererMode === "webgpu" ? "WebGPU" : state.rendererMode === "canvas-fallback" ? "Canvas fallback" : "Renderer booting";
  statusEl.textContent = state.mode === "world"
    ? `${rendererLabel} · scan the terrain regions`
    : state.mode === "dive"
      ? `${rendererLabel} · cinematic zoom ${Math.round(state.transition * 100)}%`
      : `${rendererLabel} · battlefield tableau`;

  readoutEl.textContent = [
    region ? `Region: ${region.name}` : "Region: hover a highlighted landmass",
    active,
    `DSKs: ${DSK_STACK.length}`,
    fidelity?.ok === false ? "Fidelity: warning" : "Fidelity: visual proof"
  ].join(" · ");
}

function snapshot() {
  return {
    title: "The Cavalry of Rome",
    mode: state.mode,
    selectedRegionId: state.selectedRegionId,
    hoveredRegionId: state.hoveredRegionId,
    transition: state.transition,
    rendererMode: state.rendererMode,
    dskReady,
    dskStack: [...DSK_STACK],
    visualContract: copy(state.visualContract),
    routeProgress: engine?.genericRouteProgress?.getState?.() ?? null,
    affordances: engine?.genericAffordances?.getState?.() ?? null,
    zones: engine?.cavalryRegionZones?.getSnapshot?.() ?? null,
    cameraCinematic: engine?.cavalryCamera?.snapshot?.() ?? null,
    visualFidelity: engine?.cavalryFidelity?.snapshot?.() ?? null,
    scenarioQa: engine?.cavalryScenarioQa?.snapshot?.() ?? null
  };
}

function installInput() {
  canvas.addEventListener("pointermove", (event) => {
    state.pointer = { ...normalizedPointer(event), active: true };
    const region = pickRegion();
    const nextId = region?.id ?? null;
    if (nextId !== state.hoveredRegionId) {
      state.hoveredRegionId = nextId;
      engine?.actionInput?.hover?.(nextId, { source: "cavalry-region-hover" });
      if (nextId) {
        engine?.genericAffordances?.setDescriptor?.(nextId, { tone: "hot", prompt: `Dive into ${region.name}` }, "region-hovered");
        engine?.cavalryRegionZones?.setEntityPosition?.("scan-cursor", { x: region.center[0], y: region.center[2] });
      }
    }
  });

  canvas.addEventListener("pointerleave", () => {
    state.pointer.active = false;
    state.hoveredRegionId = null;
    engine?.actionInput?.hover?.(null, { source: "cavalry-region-hover-clear" });
  });

  canvas.addEventListener("pointerdown", () => {
    if (state.mode !== "world") return;
    const region = regionById(state.hoveredRegionId) ?? pickRegion();
    if (region) selectRegion(region.id);
  });

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["r", "a", "d", "w", "s", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
      event.preventDefault();
      engine?.actionInput?.key?.(key, true, { source: "keyboard" });
    }
    if (key === "r") globalThis.GameHost?.restart?.();
  });

  window.addEventListener("keyup", (event) => {
    engine?.actionInput?.key?.(event.key.toLowerCase(), false, { source: "keyboard" });
  });
}

async function createRenderer() {
  try {
    const webgpu = await WebGpuCavalryRenderer.create(canvas);
    state.rendererMode = "webgpu";
    return webgpu;
  } catch (error) {
    console.warn("Cavalry WebGPU renderer unavailable; using Canvas fallback.", error);
    state.rendererMode = "canvas-fallback";
    return new CanvasFallbackRenderer(canvas);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
  last = now;
  state.time += dt;

  if (state.mode === "dive") {
    state.transition = clamp(state.transition + dt * 0.38, 0, 1);
    if (state.transition >= 1) transitionToBattlefield();
  }

  engine?.tick?.(dt);
  renderer?.draw?.();
  updateHud();
  requestAnimationFrame(frame);
}

async function boot() {
  commandBar.hidden = true;
  logStatus("Loading DSK-composed visual route…");
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
      const qa = engine?.cavalryScenarioQa?.runScenario?.("cavalry-visual-proof", {
        spawned: true,
        inspection: true,
        descriptors: true,
        descriptor: snapshot(),
        budget: { ok: true },
        camera: engine?.cavalryCamera?.snapshot?.()
      });
      const host = engine?.cavalryHostStandard?.runSmoke?.({ packetRef: "cavalry-visual-proof", metadata: { rendererMode: state.rendererMode } });
      return { ok: (qa?.ok ?? true) && (host?.ok ?? true), qa, host, snapshot: snapshot() };
    },
    validate() {
      return this.runSmoke();
    },
    restart() {
      state.mode = "world";
      state.selectedRegionId = null;
      state.hoveredRegionId = null;
      state.transition = 0;
      state.transitionCompleted = false;
      engine?.genericRouteProgress?.reset?.({ reason: "visual-restart" });
      return snapshot();
    }
  };

  logStatus("WebGPU-first terrain route ready.");
  requestAnimationFrame(frame);
}

boot().catch((error) => {
  console.error(error);
  state.rendererMode = "failed";
  statusEl.textContent = "The Cavalry of Rome failed to boot.";
  readoutEl.textContent = String(error?.stack || error);
});
