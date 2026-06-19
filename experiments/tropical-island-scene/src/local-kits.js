const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function simpleRuntimeKit(NexusRealtime, spec) {
  const State = NexusRealtime.defineResource(`${spec.key}.state`);
  return NexusRealtime.defineRuntimeKit({
    id: spec.id,
    provides: spec.provides ?? [],
    resources: { State },
    events: {},
    systems: spec.tick ? [{ phase: "simulate", name: `${spec.key}System`, system(world) { const current = world.getResource(State) ?? spec.initial(); world.setResource(State, spec.tick(current, world)); } }] : [],
    initWorld({ world }) { world.setResource(State, spec.initial()); },
    install({ engine, world }) { engine[spec.key] = { getState: () => clone(world.getResource(State)), reset: () => world.setResource(State, spec.initial()) }; }
  });
}

function sampleHeightAt(x, z, config = {}) {
  const radius = n(config.radius, 18);
  const distance = Math.hypot(x, z);
  const normalized = Math.max(0, Math.min(1, distance / radius));
  return Math.pow(Math.max(0, 1 - normalized), 1.8) * n(config.moundHeight, 3.8) + Math.sin(x * 0.38 + z * 0.17) * 0.12 * (1 - normalized);
}

export function createIslandKit(config = {}) {
  const radius = n(config.radius, 18);
  return {
    id: "island-kit",
    version: "0.1.0",
    provides: ["island:terrain", "island:anchors", "island:shoreline"],
    sampleHeight: (x = 0, z = 0) => sampleHeightAt(x, z, { ...config, radius }),
    createScene() {
      const palmAnchor = { id: "palm-anchor-01", x: -2.4, y: sampleHeightAt(-2.4, 1.5, config), z: 1.5, yaw: -0.22 };
      return { radius, beachWidth: n(config.beachWidth, 4.5), anchors: { palm: palmAnchor }, shoreline: [] };
    }
  };
}

export function createPalmTreeKit(config = {}) {
  return {
    id: "palm-tree-kit",
    version: "0.1.0",
    provides: ["palm:mesh", "palm:fronds", "palm:sockets"],
    createTree(anchor = {}) {
      const height = n(config.height, 8.4);
      const base = { x: n(anchor.x, 0), y: n(anchor.y, 0), z: n(anchor.z, 0), yaw: n(anchor.yaw, 0) };
      const crown = { x: base.x - 0.35, y: base.y + height, z: base.z + 0.15 };
      return { id: anchor.id ?? "palm-tree-01", base, crown, fronds: Array.from({ length: 10 }, (_, i) => ({ id: `frond-${i}` })), sockets: [0, 1, 2].map((i) => ({ id: `coconut-socket-${i + 1}`, x: crown.x + Math.cos(i * 2.1) * 0.55, y: crown.y - 0.45, z: crown.z + Math.sin(i * 2.1) * 0.55 })) };
    }
  };
}

export function createCoconutPropKit(config = {}) {
  return {
    id: "coconut-prop-kit",
    version: "0.1.0",
    provides: ["coconut:props", "coconut:mesh"],
    createCoconuts(sockets = []) {
      return Array.from({ length: n(config.count, 3) }, (_, i) => ({ id: `coconut-${i + 1}`, state: i < 2 ? "attached" : "resting", position: clone(sockets[i] ?? { x: i * 0.5, y: 0.5, z: 0 }), radius: 0.28, material: "cel-coconut-husk" }));
    }
  };
}

export function createTimerKit(config = {}) {
  const timers = new Map((config.timers ?? []).map((timer) => [timer.id, { ...timer, elapsed: 0, fired: false }]));
  return { id: "timer-kit", version: "0.1.0", provides: ["timer:events"], schedule(id, delay, payload = {}) { timers.set(String(id), { id: String(id), delay: n(delay, 1), elapsed: 0, fired: false, payload }); }, tick(delta = 1 / 60) { const events = []; for (const timer of timers.values()) { if (timer.fired) continue; timer.elapsed += delta; if (timer.elapsed >= timer.delay) { timer.fired = true; events.push({ type: "timer.fired", id: timer.id, payload: timer.payload }); } } return events; } };
}

export function createFallMotionKit(config = {}) {
  const gravity = n(config.gravity, 9.8);
  return { id: "fall-motion-kit", version: "0.1.0", provides: ["fall:motion"], release(object = {}, velocity = {}) { return { ...clone(object), state: "falling", velocity: { x: n(velocity.x, 0), y: n(velocity.y, 0), z: n(velocity.z, 0) } }; }, tick(objects = [], delta = 1 / 60, groundHeight = () => 0) { return objects.map((object) => { if (object.state !== "falling") return object; const velocity = { ...object.velocity, y: n(object.velocity?.y, 0) - gravity * delta }; const position = { x: n(object.position?.x, 0) + n(velocity.x, 0) * delta, y: n(object.position?.y, 0) + velocity.y * delta, z: n(object.position?.z, 0) + n(velocity.z, 0) * delta }; const ground = groundHeight(position.x, position.z) + n(object.radius, 0.25); return position.y <= ground ? { ...object, state: "landed", position: { ...position, y: ground }, velocity: { x: velocity.x * 0.35, y: 0, z: velocity.z * 0.35 } } : { ...object, position, velocity }; }); } };
}

export function createFishSchoolKit(config = {}) {
  return { id: "fish-school-kit", version: "0.1.0", provides: ["fish:school"], createSchool() { const count = Math.max(12, n(config.count, 24)); const radius = n(config.radius, 28); return Array.from({ length: count }, (_, i) => { const a = i / count * Math.PI * 2; return { id: `fish-${i + 1}`, position: { x: Math.cos(a) * radius * 0.7, y: -0.45 - (i % 4) * 0.16, z: Math.sin(a) * radius * 0.7 }, heading: a, speed: 0.9 + (i % 7) * 0.07, scale: 0.22 + (i % 3) * 0.04 }; }); } };
}

export function createFishMotionKit(config = {}) {
  return { id: "fish-motion-kit", version: "0.1.0", provides: ["fish:motion"], tick(fish = [], time = 0, delta = 1 / 60) { const radius = n(config.orbitRadius, 26); return fish.map((entry, i) => { const heading = n(entry.heading, 0) + n(entry.speed, 1) * delta * 0.18; return { ...entry, heading, position: { x: Math.cos(heading) * radius * (0.58 + (i % 6) * 0.055), y: n(entry.position?.y, -0.5), z: Math.sin(heading) * radius * (0.58 + (i % 6) * 0.055) } }; }); } };
}

export function createFloatPropKit(config = {}) {
  return { id: "float-prop-kit", version: "0.1.0", provides: ["float:props"], createProps(radius = 32) { return Array.from({ length: Math.max(3, n(config.count, 6)) }, (_, i) => { const a = i / Math.max(3, n(config.count, 6)) * Math.PI * 2 + 0.4; return { id: `float-prop-${i + 1}`, type: "wood", position: { x: Math.cos(a) * radius, y: 0.05, z: Math.sin(a) * radius }, rotation: a, scale: 1.1, reflective: true, bobPhase: i * 0.77 }; }); } };
}

export function createFloatMotionKit(config = {}) {
  const drift = config.drift ?? { x: 0.02, z: -0.015 };
  return { id: "float-motion-kit", version: "0.1.0", provides: ["float:motion"], tick(props = [], time = 0, delta = 1 / 60) { return props.map((prop, i) => ({ ...prop, position: { x: n(prop.position?.x, 0) + n(drift.x, 0) * delta, y: 0.05 + Math.sin((prop.bobPhase ?? i) + time * 1.7) * 0.12, z: n(prop.position?.z, 0) + n(drift.z, 0) * delta } })); } };
}

export function createOrbitCameraKit(config = {}) {
  let state = { angle: n(config.angle, 0.35), pitch: n(config.pitch, 0.55), distance: n(config.distance, 42), target: config.target ?? { x: 0, y: 2, z: 0 }, autoRotate: config.autoRotate ?? true };
  return { id: "orbit-camera-kit", version: "0.1.0", provides: ["camera:orbit"], setInput(input = {}) { state.angle += n(input.dragX, 0) * 0.006; state.pitch = Math.max(0.18, Math.min(1.08, state.pitch + n(input.dragY, 0) * 0.004)); state.distance = Math.max(18, Math.min(80, state.distance + n(input.zoom, 0))); }, tick(delta = 1 / 60) { if (state.autoRotate) state.angle += delta * 0.045; return this.getState(); }, getState() { return { ...state, position: { x: Math.cos(state.angle) * state.distance, y: Math.sin(state.pitch) * state.distance * 0.45 + state.target.y, z: Math.sin(state.angle) * state.distance } }; } };
}

export function createCelShadingKit(config = {}) { return { id: "cel-shading-kit", version: "0.1.0", provides: ["cel:ramps"], thresholds: config.thresholds ?? [0.35, 0.68, 0.92] }; }
export function createOutlineSobelKit(config = {}) { return { id: "outline-sobel-kit", version: "0.1.0", provides: ["outline:sobel"], createPass() { return { id: "sobel-outline-pass", uniforms: { thickness: config.thickness ?? 1.25 } }; } }; }
export function createNormalStyleKit(config = {}) { return { id: "normal-style-kit", version: "0.1.0", provides: ["normal:policy"], getPolicy(domain = "island") { return (config.policies ?? {})[domain] ?? { mode: "smooth-heightfield", strength: 0.78 }; } }; }
export function createReflectProbeKit(config = {}) { return { id: "reflect-probe-kit", version: "0.1.0", provides: ["reflect:water"], createDescriptor(scene = {}) { return { id: "water-reflect-descriptor", strength: config.strength ?? 0.45, objectCount: (scene.floatProps?.length ?? 0) + (scene.coconuts?.length ?? 0) }; } }; }

export function createFluidFieldKit(NexusRealtime) { return simpleRuntimeKit(NexusRealtime, { id: "fluid-field-kit", key: "fluidField", initial: () => ({ id: "fluid-field", ready: true }) }); }
export function createFluidMotionKit(NexusRealtime) { return simpleRuntimeKit(NexusRealtime, { id: "fluid-motion-kit", key: "fluidMotion", initial: () => ({ id: "fluid-motion", ready: true }) }); }
export function createFluidShadingKit(NexusRealtime) { return simpleRuntimeKit(NexusRealtime, { id: "fluid-shading-kit", key: "fluidShading", initial: () => ({ id: "fluid-shading", ready: true }) }); }
export function createFluidEffectsKit(NexusRealtime) { return simpleRuntimeKit(NexusRealtime, { id: "fluid-effects-kit", key: "fluidEffects", initial: () => ({ id: "fluid-effects", effects: [] }) }); }
export function createWaterModeKit(NexusRealtime, config = {}) { return simpleRuntimeKit(NexusRealtime, { id: "water-mode-kit", key: "waterMode", initial: () => ({ id: "water-mode", stack: config.stack ?? [] }) }); }
export function createWaterDataKit(NexusRealtime, config = {}) { return simpleRuntimeKit(NexusRealtime, { id: "water-data-kit", key: "waterData", initial: () => ({ id: "water-data", bodies: config.bodies ?? [] }) }); }
export function createWaterStreamKit(NexusRealtime, config = {}) { return simpleRuntimeKit(NexusRealtime, { id: "water-stream-kit", key: "waterStream", initial: () => ({ id: "water-stream", tiles: [], config }) }); }
export function createWaterSurfaceKit(NexusRealtime, config = {}) { return simpleRuntimeKit(NexusRealtime, { id: "water-surface-kit", key: "waterSurface", initial: () => ({ id: "water-surface", amplitude: config.amplitude ?? 0.18, frequency: config.frequency ?? 0.06 }) }); }
export function createWaterMeshKit(NexusRealtime, config = {}) { return simpleRuntimeKit(NexusRealtime, { id: "water-mesh-kit", key: "waterMesh", initial: () => ({ id: "water-mesh", meshes: config.meshes ?? [] }) }); }
export function createWaterShadingKit(NexusRealtime, config = {}) { return simpleRuntimeKit(NexusRealtime, { id: "water-shading-kit", key: "waterShading", initial: () => ({ id: "water-shading", materials: config.materials ?? [] }) }); }
export function createWaterPhysicsKit(NexusRealtime) { return simpleRuntimeKit(NexusRealtime, { id: "water-physics-kit", key: "waterPhysics", initial: () => ({ id: "water-physics", ready: true }) }); }
export function createWaterEffectsKit(NexusRealtime) { return simpleRuntimeKit(NexusRealtime, { id: "water-effects-kit", key: "waterEffects", initial: () => ({ id: "water-effects", effects: [] }) }); }
