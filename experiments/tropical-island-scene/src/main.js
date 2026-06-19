import { createIslandKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/island-kit/index.js?v=tropical-island-scene-20260619";
import { createPalmTreeKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/palm-tree-kit/index.js?v=tropical-island-scene-20260619";
import { createCoconutPropKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/coconut-prop-kit/index.js?v=tropical-island-scene-20260619";
import { createTimerKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/timer-kit/index.js?v=tropical-island-scene-20260619";
import { createFallMotionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fall-motion-kit/index.js?v=tropical-island-scene-20260619";
import { createFishSchoolKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fish-school-kit/index.js?v=tropical-island-scene-20260619";
import { createFishMotionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fish-motion-kit/index.js?v=tropical-island-scene-20260619";
import { createFloatPropKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/float-prop-kit/index.js?v=tropical-island-scene-20260619";
import { createFloatMotionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/float-motion-kit/index.js?v=tropical-island-scene-20260619";
import { createOrbitCameraKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/orbit-camera-kit/index.js?v=tropical-island-scene-20260619";
import { createCelShadingKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/cel-shading-kit/index.js?v=tropical-island-scene-20260619";
import { createOutlineSobelKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/outline-sobel-kit/index.js?v=tropical-island-scene-20260619";
import { createNormalStyleKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/normal-style-kit/index.js?v=tropical-island-scene-20260619";
import { createReflectProbeKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/reflect-probe-kit/index.js?v=tropical-island-scene-20260619";
import { createFluidFieldKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-field-kit/index.js?v=tropical-island-scene-20260619";
import { createFluidMotionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-motion-kit/index.js?v=tropical-island-scene-20260619";
import { createFluidShadingKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-shading-kit/index.js?v=tropical-island-scene-20260619";
import { createFluidEffectsKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-effects-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterModeKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-mode-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterDataKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-data-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterStreamKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-stream-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterSurfaceKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-surface-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterMeshKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-mesh-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterShadingKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-shading-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterPhysicsKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-physics-kit/index.js?v=tropical-island-scene-20260619";
import { createWaterEffectsKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-effects-kit/index.js?v=tropical-island-scene-20260619";

const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const errorPanel = document.querySelector("#errorPanel");
const gl = canvas.getContext("webgl2", { antialias: true, alpha: false, powerPreference: "high-performance" });

const REQUIRED_KITS = [
  "island-kit",
  "palm-tree-kit",
  "coconut-prop-kit",
  "timer-kit",
  "fall-motion-kit",
  "fish-school-kit",
  "fish-motion-kit",
  "float-prop-kit",
  "float-motion-kit",
  "orbit-camera-kit",
  "cel-shading-kit",
  "outline-sobel-kit",
  "normal-style-kit",
  "reflect-probe-kit",
  "fluid-field-kit",
  "fluid-motion-kit",
  "fluid-shading-kit",
  "fluid-effects-kit",
  "water-mode-kit",
  "water-data-kit",
  "water-stream-kit",
  "water-surface-kit",
  "water-mesh-kit",
  "water-shading-kit",
  "water-physics-kit",
  "water-effects-kit"
];

const VERTEX_SHADER = `#version 300 es
in vec2 position;
out vec2 vUv;
void main(){
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uOrbit;
uniform vec4 uCoconuts[3];
uniform vec4 uFish[12];
uniform vec4 uFloats[6];

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float band(float v){ return v < 0.34 ? 0.24 : v < 0.66 ? 0.62 : 1.0; }
float ellipse(vec2 p, vec2 c, vec2 r){ vec2 d = (p - c) / r; return length(d) - 1.0; }
float circle(vec2 p, vec2 c, float r){ return length(p - c) - r; }
float lineSegment(vec2 p, vec2 a, vec2 b, float w){ vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - w; }
vec3 cel(vec3 shadow, vec3 mid, vec3 light, float n){ float b = band(n); return mix(shadow, mix(mid, light, step(0.9, b)), step(0.45, b)); }

void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.0;
  float horizon = 0.16 + 0.025 * sin(uOrbit);
  vec3 skyTop = vec3(0.17, 0.62, 0.92);
  vec3 skyLow = vec3(0.74, 0.94, 0.94);
  vec3 color = mix(skyLow, skyTop, smoothstep(0.0, 1.0, uv.y));

  float waterMask = smoothstep(horizon, horizon - 0.02, p.y);
  float perspective = 1.0 / max(0.12, 1.15 + p.y);
  float wave = sin((p.x * 18.0 + uTime * 1.8) * perspective + sin(p.y * 7.0)) * 0.035;
  wave += sin((p.x * 4.5 - uTime * 0.7) + p.y * 18.0) * 0.018;
  vec3 water = cel(vec3(0.02, 0.18, 0.32), vec3(0.05, 0.48, 0.68), vec3(0.62, 0.96, 1.0), 0.55 + wave * 4.5 + uv.y * 0.3);
  float sparkle = smoothstep(0.985, 1.0, sin((p.x + p.y * 1.7 + uTime * 0.45) * 95.0)) * smoothstep(0.24, -0.15, p.y);
  color = mix(color, water + sparkle * vec3(0.55, 0.72, 0.62), waterMask);

  vec2 islandCenter = vec2(0.0, -0.16);
  float island = ellipse(p, islandCenter, vec2(0.54, 0.19));
  float inner = ellipse(p, islandCenter + vec2(-0.02, 0.02), vec2(0.38, 0.13));
  float wet = smoothstep(0.03, -0.01, island) - smoothstep(-0.08, -0.13, island);
  float land = smoothstep(0.012, -0.018, island);
  float grass = smoothstep(0.02, -0.02, inner);
  vec3 sandColor = cel(vec3(0.46, 0.32, 0.16), vec3(0.86, 0.64, 0.31), vec3(1.0, 0.9, 0.63), 0.64 + p.y * 0.25 + hash(floor(p * 90.0)) * 0.12);
  vec3 grassColor = cel(vec3(0.09, 0.31, 0.13), vec3(0.29, 0.62, 0.23), vec3(0.71, 0.92, 0.48), 0.58 + p.x * 0.12);
  color = mix(color, sandColor, land);
  color = mix(color, grassColor, grass * land);
  color = mix(color, vec3(0.78, 0.62, 0.38), wet * 0.35);

  float shoreFoam = smoothstep(0.035, 0.0, abs(island)) * waterMask;
  color = mix(color, vec3(0.85, 1.0, 0.96), shoreFoam * (0.45 + 0.2 * sin(uTime * 2.0 + p.x * 15.0)));

  vec2 trunkBase = islandCenter + vec2(-0.11, 0.035);
  vec2 trunkTop = trunkBase + vec2(-0.055 + sin(uTime * 0.8) * 0.008, 0.43);
  float trunk = lineSegment(p, trunkBase, trunkTop, 0.026);
  float trunkLight = dot(normalize(vec2(-0.3, 1.0)), normalize(p - trunkBase + vec2(0.001))) * 0.5 + 0.5;
  color = mix(color, cel(vec3(0.18,0.09,0.04), vec3(0.50,0.28,0.11), vec3(0.85,0.55,0.25), trunkLight), smoothstep(0.018, -0.004, trunk));
  float trunkEdge = smoothstep(0.006, 0.0, abs(trunk));

  float frondMask = 0.0;
  vec3 frondColor = vec3(0.18, 0.62, 0.24);
  for(int i=0;i<10;i++){
    float a = float(i) / 10.0 * 6.28318 + uOrbit * 0.2;
    vec2 tip = trunkTop + vec2(cos(a) * 0.23, sin(a) * 0.085 - 0.03);
    float f = lineSegment(p, trunkTop, tip, 0.021 - 0.006 * sin(float(i)));
    frondMask = max(frondMask, smoothstep(0.02, -0.004, f));
  }
  color = mix(color, cel(vec3(0.06,0.25,0.08), vec3(0.18,0.62,0.24), vec3(0.68,0.92,0.38), 0.7 + p.y * 0.2), frondMask);

  float coconutMask = 0.0;
  for(int i=0;i<3;i++){
    vec2 c = uCoconuts[i].xy;
    float active = uCoconuts[i].w;
    coconutMask = max(coconutMask, smoothstep(0.032, -0.003, circle(p, c, 0.032)) * active);
  }
  color = mix(color, cel(vec3(0.18,0.10,0.04), vec3(0.45,0.25,0.09), vec3(0.78,0.48,0.19), 0.72), coconutMask);

  for(int i=0;i<12;i++){
    vec2 fp = uFish[i].xy;
    float fish = ellipse(p, fp, vec2(0.026, 0.009));
    float vis = smoothstep(0.012, -0.006, fish) * smoothstep(-0.05, -0.5, p.y);
    color = mix(color, vec3(1.0, 0.68, 0.22), vis * 0.8);
  }

  for(int i=0;i<6;i++){
    vec2 op = uFloats[i].xy;
    float objectShape = ellipse(p, op, vec2(0.045, 0.016));
    float om = smoothstep(0.013, -0.006, objectShape);
    color = mix(color, vec3(0.40, 0.22, 0.11), om);
    vec2 reflected = vec2(op.x, horizon - (op.y - horizon) * 0.42);
    float refl = ellipse(p, reflected, vec2(0.055, 0.010));
    color = mix(color, vec3(0.70, 0.96, 1.0), smoothstep(0.014, -0.004, refl) * 0.18);
  }

  float edge = 0.0;
  edge = max(edge, smoothstep(0.01, 0.0, abs(island)));
  edge = max(edge, trunkEdge);
  edge = max(edge, smoothstep(0.016, 0.0, abs(inner)) * 0.35);
  float sobel = edge;
  color = mix(color, vec3(0.015, 0.025, 0.027), sobel * 0.75);
  outColor = vec4(color, 1.0);
}`;

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
  console.error(error);
}

function createMiniNexus() {
  return {
    defineResource: (id) => ({ id }),
    defineEvent: (id) => ({ id }),
    defineRuntimeKit: (kit) => kit
  };
}

function createMiniRuntime(kits) {
  const resources = new Map();
  let pendingEvents = new Map();
  const world = {
    __nexusClock: { frame: 0, delta: 0, elapsed: 0 },
    getResource(resource) { return resources.get(resource.id ?? resource); },
    setResource(resource, value) { resources.set(resource.id ?? resource, value); },
    emit(event, payload = {}) {
      const id = event.id ?? event;
      const list = pendingEvents.get(id) ?? [];
      list.push(payload);
      pendingEvents.set(id, list);
    },
    readEvents(event) { return pendingEvents.get(event.id ?? event) ?? []; }
  };
  const engine = {};
  for (const kit of kits) kit.initWorld?.({ world, engine });
  for (const kit of kits) kit.install?.({ world, engine });
  return {
    engine,
    tick(delta = 1 / 60) {
      world.__nexusClock = { frame: world.__nexusClock.frame + 1, delta, elapsed: world.__nexusClock.elapsed + delta };
      for (const kit of kits) for (const entry of kit.systems ?? []) entry.system(world);
      pendingEvents = new Map();
    },
    getState() {
      return { water: engine.waterSurface?.getState?.(), stream: engine.waterStream?.getState?.(), mode: engine.waterMode?.getState?.() };
    }
  };
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function createProgram() {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

function createComposition() {
  const islandKit = createIslandKit({ radius: 18, beachWidth: 4.5, moundHeight: 3.8 });
  const palmKit = createPalmTreeKit({ height: 8.5, frondCount: 10 });
  const coconutKit = createCoconutPropKit({ count: 3 });
  const timerKit = createTimerKit();
  const fallKit = createFallMotionKit();
  const fishSchoolKit = createFishSchoolKit({ count: 24, radius: 28 });
  const fishMotionKit = createFishMotionKit({ orbitRadius: 26 });
  const floatPropKit = createFloatPropKit({ count: 6 });
  const floatMotionKit = createFloatMotionKit();
  const orbitKit = createOrbitCameraKit({ angle: 0.38, pitch: 0.54, distance: 42 });
  const celKit = createCelShadingKit();
  const outlineKit = createOutlineSobelKit({ thickness: 1.25 });
  const normalKit = createNormalStyleKit();
  const reflectKit = createReflectProbeKit({ strength: 0.45 });

  const NexusRealtime = createMiniNexus();
  const waterKits = [
    createFluidFieldKit(NexusRealtime),
    createFluidMotionKit(NexusRealtime),
    createFluidShadingKit(NexusRealtime),
    createFluidEffectsKit(NexusRealtime),
    createWaterDataKit(NexusRealtime, { bodies: [{ id: "island-ocean", kind: "ocean", depth: 24, meshPolicy: "projected-grid" }] }),
    createWaterStreamKit(NexusRealtime, { radius: 4, tileSize: 36 }),
    createWaterSurfaceKit(NexusRealtime, { amplitude: 0.18, frequency: 0.06, foamBias: 0.36 }),
    createWaterMeshKit(NexusRealtime, { meshes: [{ id: "near-ocean-grid", bodyId: "island-ocean", policy: "projected-grid", density: 64 }] }),
    createWaterShadingKit(NexusRealtime, { materials: [{ id: "clear-water", reflection: 0.55, refraction: 0.32, fresnel: 0.72 }] }),
    createWaterPhysicsKit(NexusRealtime),
    createWaterEffectsKit(NexusRealtime),
    createWaterModeKit(NexusRealtime, { stack: ["fluid-field-kit", "fluid-motion-kit", "fluid-shading-kit", "fluid-effects-kit", "water-data-kit", "water-stream-kit", "water-surface-kit", "water-mesh-kit", "water-shading-kit", "water-physics-kit", "water-effects-kit", "water-mode-kit"] })
  ];
  const waterRuntime = createMiniRuntime(waterKits);

  const island = islandKit.createScene();
  const palm = palmKit.createTree(island.anchors.palm);
  let coconuts = coconutKit.createCoconuts(palm.sockets, { anchors: island.anchors.coconuts });
  let fish = fishSchoolKit.createSchool();
  let floatProps = floatPropKit.createProps(31);
  timerKit.schedule("drop-coconut-1", 3.0, { index: 0 });
  timerKit.schedule("drop-coconut-2", 6.5, { index: 1 });
  timerKit.schedule("drop-coconut-3", 10.0, { index: 2 });

  const kits = [islandKit, palmKit, coconutKit, timerKit, fallKit, fishSchoolKit, fishMotionKit, floatPropKit, floatMotionKit, orbitKit, celKit, outlineKit, normalKit, reflectKit, ...waterKits];
  const renderer = { api: "webgl2", style: "high-fidelity-cel", outline: "sobel", reflectiveWater: true, horizonWater: true };
  const review = () => reviewComposition({ kits, island, palm, coconuts, fish, floatProps, renderer, waterRuntime });

  return {
    kits,
    islandKit,
    palm,
    coconuts,
    fish,
    floatProps,
    timerKit,
    fallKit,
    fishMotionKit,
    floatMotionKit,
    orbitKit,
    celKit,
    outlineKit,
    normalKit,
    reflectKit,
    waterRuntime,
    renderer,
    review,
    tick(delta, time) {
      const events = timerKit.tick(delta);
      for (const event of events) {
        if (event.id.startsWith("drop-coconut")) {
          const index = event.payload.index;
          coconuts[index] = fallKit.release(coconuts[index], { x: 0.2 - index * 0.12, y: 0, z: 0.05 });
        }
      }
      coconuts = fallKit.tick(coconuts, delta, islandKit.sampleHeight);
      fish = fishMotionKit.tick(fish, time, delta);
      floatProps = floatMotionKit.tick(floatProps, time, delta);
      waterRuntime.tick(delta);
      this.coconuts = coconuts;
      this.fish = fish;
      this.floatProps = floatProps;
      return this.getState();
    },
    getState() {
      return { coconuts, fish, floatProps, camera: orbitKit.getState(), reflection: reflectKit.createDescriptor({ floatProps, coconuts }), review: review() };
    }
  };
}

export function reviewComposition(composition) {
  const kitIds = new Set(composition.kits.map((kit) => kit.id));
  const missing = REQUIRED_KITS.filter((id) => !kitIds.has(id));
  const problems = [];
  if (missing.length) problems.push(`missing kits: ${missing.join(", ")}`);
  if (composition.coconuts.length !== 3) problems.push(`expected 3 coconuts, got ${composition.coconuts.length}`);
  if (!composition.palm?.fronds?.length) problems.push("palm tree has no fronds");
  if (composition.fish.length < 12) problems.push(`expected fish school, got ${composition.fish.length}`);
  if (composition.floatProps.length < 3) problems.push(`expected reflective ocean objects, got ${composition.floatProps.length}`);
  if (composition.renderer.api !== "webgl2") problems.push("renderer must use WebGL2");
  if (composition.renderer.outline !== "sobel") problems.push("renderer must use Sobel outlines");
  if (!composition.renderer.reflectiveWater || !composition.renderer.horizonWater) problems.push("water must be reflective and horizon-capable");
  return { ok: problems.length === 0, problems, kitIds: [...kitIds] };
}

function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * ratio);
  canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function screenProject(position, cameraAngle, scale = 1) {
  const c = Math.cos(cameraAngle);
  const s = Math.sin(cameraAngle);
  const x = position.x * c - position.z * s;
  const z = position.x * s + position.z * c;
  const y = position.y ?? 0;
  return [x / 36 * scale, (-0.18 + y / 18 - z / 90) * scale, z];
}

function boot() {
  if (!gl) throw new Error("Tropical Island Scene requires WebGL2.");
  resize();
  const program = createProgram();
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, "position");
  const uniforms = {
    uResolution: gl.getUniformLocation(program, "uResolution"),
    uTime: gl.getUniformLocation(program, "uTime"),
    uOrbit: gl.getUniformLocation(program, "uOrbit"),
    uCoconuts: gl.getUniformLocation(program, "uCoconuts[0]"),
    uFish: gl.getUniformLocation(program, "uFish[0]"),
    uFloats: gl.getUniformLocation(program, "uFloats[0]")
  };
  const composition = createComposition();
  let last = performance.now();
  let dragging = false;
  let lastPointer = null;

  canvas.addEventListener("pointerdown", (event) => { dragging = true; lastPointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointerup", () => { dragging = false; lastPointer = null; });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !lastPointer) return;
    composition.orbitKit.setInput({ dragX: event.clientX - lastPointer.x, dragY: event.clientY - lastPointer.y });
    lastPointer = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("wheel", (event) => { event.preventDefault(); composition.orbitKit.setInput({ zoom: Math.sign(event.deltaY) * 1.5 }); }, { passive: false });
  window.addEventListener("resize", resize);

  function frame(now) {
    const delta = Math.min(1 / 30, Math.max(0, (now - last) / 1000 || 1 / 60));
    last = now;
    composition.orbitKit.tick(delta);
    composition.tick(delta, now / 1000);
    const orbit = composition.orbitKit.getState().angle;
    const coconutUniforms = new Float32Array(12);
    composition.coconuts.forEach((entry, index) => {
      const projected = screenProject(entry.position, orbit, 1);
      coconutUniforms[index * 4 + 0] = projected[0];
      coconutUniforms[index * 4 + 1] = projected[1] + 0.22;
      coconutUniforms[index * 4 + 2] = projected[2];
      coconutUniforms[index * 4 + 3] = 1;
    });
    const fishUniforms = new Float32Array(48);
    composition.fish.slice(0, 12).forEach((entry, index) => {
      const projected = screenProject(entry.position, orbit, 1);
      fishUniforms[index * 4 + 0] = projected[0];
      fishUniforms[index * 4 + 1] = projected[1] - 0.02;
      fishUniforms[index * 4 + 2] = projected[2];
      fishUniforms[index * 4 + 3] = entry.scale;
    });
    const floatUniforms = new Float32Array(24);
    composition.floatProps.slice(0, 6).forEach((entry, index) => {
      const projected = screenProject(entry.position, orbit, 1);
      floatUniforms[index * 4 + 0] = projected[0];
      floatUniforms[index * 4 + 1] = projected[1] - 0.03;
      floatUniforms[index * 4 + 2] = projected[2];
      floatUniforms[index * 4 + 3] = entry.scale;
    });

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.uTime, now / 1000);
    gl.uniform1f(uniforms.uOrbit, orbit);
    gl.uniform4fv(uniforms.uCoconuts, coconutUniforms);
    gl.uniform4fv(uniforms.uFish, fishUniforms);
    gl.uniform4fv(uniforms.uFloats, floatUniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const review = composition.review();
    statusEl.textContent = review.ok ? `review ok · ${REQUIRED_KITS.length} kits composed · 3 coconuts · ${composition.fish.length} fish · reflective horizon water · drag to orbit` : `review failed · ${review.problems.join(" · ")}`;
    requestAnimationFrame(frame);
  }

  window.GameHost = { composition, reviewComposition: composition.review, getState: () => composition.getState(), renderer: { api: "webgl2", cel: true, sobel: true } };
  requestAnimationFrame(frame);
}

boot();
