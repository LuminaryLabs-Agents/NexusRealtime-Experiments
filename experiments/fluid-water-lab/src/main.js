import { createFluidFieldKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-field-kit/index.js?v=fluid-water-kits-20260619";
import { createFluidMotionKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-motion-kit/index.js?v=fluid-water-kits-20260619";
import { createFluidShadingKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-shading-kit/index.js?v=fluid-water-kits-20260619";
import { createFluidEffectsKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/fluid-effects-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterDataKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-data-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterStreamKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-stream-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterSurfaceKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-surface-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterMeshKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-mesh-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterShadingKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-shading-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterPhysicsKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-physics-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterBehaviorKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-behavior-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterEffectsKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-effects-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterAudioKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-audio-kit/index.js?v=fluid-water-kits-20260619";
import { createWaterModeKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/water-mode-kit/index.js?v=fluid-water-kits-20260619";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const errorPanel = document.querySelector("#errorPanel");

const input = { x: 0, y: 0, down: false, keys: new Set(), lastSplashAt: 0 };
const camera = { x: 0, z: 0, zoom: 1 };
let running = true;
let last = performance.now();
let runtime = null;

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
    world,
    tick(delta = 1 / 60) {
      world.__nexusClock = { frame: world.__nexusClock.frame + 1, delta, elapsed: world.__nexusClock.elapsed + delta };
      for (const kit of kits) for (const entry of kit.systems ?? []) entry.system(world);
      pendingEvents = new Map();
    },
    getState() {
      return {
        mode: engine.waterMode.getState(),
        stream: engine.waterStream.getState(),
        surface: engine.waterSurface.getState(),
        physics: engine.waterPhysics.getState(),
        behavior: engine.waterBehavior.getState(),
        effects: engine.waterEffects.getState(),
        audio: engine.waterAudio.getState(),
        mesh: engine.waterMesh.getState(),
        shading: engine.waterShading.getState(),
        fluid: {
          field: engine.fluidField.getState(),
          motion: engine.fluidMotion.getState(),
          shading: engine.fluidShading.getState(),
          effects: engine.fluidEffects.getState()
        }
      };
    }
  };
}

function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * ratio);
  canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function screenToWorld(x, y) {
  const nx = (x / innerWidth - 0.5) * 96;
  const nz = (y / innerHeight - 0.52) * 58;
  return { x: camera.x + nx / camera.zoom, z: camera.z + nz / camera.zoom };
}

function drawBackground(now) {
  const sky = ctx.createLinearGradient(0, 0, 0, innerHeight);
  sky.addColorStop(0, "#061928");
  sky.addColorStop(0.44, "#0b3c56");
  sky.addColorStop(1, "#021015");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.globalAlpha = 0.34;
  for (let i = 0; i < 7; i += 1) {
    const x = ((now * 0.006 + i * 180) % (innerWidth + 240)) - 120;
    const y = 46 + i * 22;
    ctx.fillStyle = "#d9fbff";
    ctx.beginPath();
    ctx.ellipse(x, y, 90, 14 + i % 3 * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWater(now) {
  const engine = runtime.engine;
  const material = engine.waterShading.getMaterial("clear-water");
  const rows = 42;
  const cols = 76;
  const top = innerHeight * 0.28;
  const height = innerHeight * 0.74;
  const cellW = innerWidth / cols;
  const cellH = height / rows;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, innerWidth, innerHeight - top);
  ctx.clip();

  const gradient = ctx.createLinearGradient(0, top, 0, innerHeight);
  gradient.addColorStop(0, material.shallowColor ?? "#8ef7ff");
  gradient.addColorStop(0.45, "#15759d");
  gradient.addColorStop(1, material.deepColor ?? "#05294d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top, innerWidth, innerHeight - top);

  const effects = engine.waterEffects.getDescriptors();
  for (let row = 0; row < rows; row += 1) {
    const v = row / rows;
    for (let col = 0; col < cols; col += 1) {
      const u = col / cols;
      const world = { x: (u - 0.5) * 96 + camera.x, z: (v - 0.5) * 62 + camera.z, depth: 2 + v * 4 };
      const sample = engine.waterSurface.sample(world);
      const motion = engine.fluidMotion.sampleVelocity(world);
      const shade = Math.max(0, Math.min(1, 0.44 + sample.height * 1.25 + sample.foam * 0.55 + Math.hypot(motion.velocity.x, motion.velocity.z) * 0.25));
      ctx.fillStyle = `rgba(${Math.round(18 + shade * 92)},${Math.round(130 + shade * 90)},${Math.round(168 + shade * 70)},${0.18 + v * 0.28})`;
      const x = col * cellW + sample.height * 18;
      const y = top + row * cellH + Math.sin(now * 0.0018 + col * 0.24) * 1.8;
      ctx.fillRect(x, y, cellW + 1.5, Math.max(1, cellH * 0.42));
    }
  }

  ctx.strokeStyle = "rgba(238,255,255,.36)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 34; i += 1) {
    const y = top + 24 + i * 16;
    ctx.beginPath();
    for (let x = -20; x <= innerWidth + 20; x += 18) {
      const world = screenToWorld(x, y);
      const sample = engine.waterSurface.sample(world);
      const yy = y + sample.height * 20 + Math.sin(now * 0.002 + i + x * 0.02) * 2;
      if (x === -20) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.globalAlpha = 0.18 + i / 180;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (const effect of effects) {
    const age = effect.age / effect.ttl;
    const centerX = innerWidth * 0.5 + (effect.position.x - camera.x) * 8;
    const centerY = innerHeight * 0.56 + (effect.position.z - camera.z) * 5;
    ctx.strokeStyle = effect.type === "wake" ? "rgba(210,250,255,.28)" : "rgba(242,255,255,.62)";
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, 1 - age);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, effect.radius * 8 * (1 + age), effect.radius * 3.4 * (1 + age), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawWorldMarkers() {
  const state = runtime.getState();
  const tiles = state.stream.activeTiles.slice(0, 18);
  for (const tile of tiles) {
    const x = innerWidth * 0.5 + (tile.center.x - camera.x) * 0.4;
    const y = innerHeight * 0.84 + (tile.center.z - camera.z) * 0.22;
    ctx.fillStyle = tile.lod === "near" ? "rgba(255,231,122,.65)" : tile.lod === "mid" ? "rgba(115,217,255,.34)" : "rgba(115,217,255,.16)";
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
}

function draw(now) {
  drawBackground(now);
  drawWater(now);
  drawWorldMarkers();
}

function updateHud() {
  const state = runtime.getState();
  const actor = runtime.engine.waterBehavior.getActor("player");
  statusEl.textContent = `${state.mode.stack.length} kits · ${actor.mode} · tiles ${state.stream.activeTiles.length} · fx ${state.effects.effects.length} · foam ${state.effects.foamLevel.toFixed(2)} · click water / Space dive / R reset`;
}

function flushInput(delta, now) {
  const engine = runtime.engine;
  const world = screenToWorld(input.x, input.y);
  camera.x += ((world.x * 0.02) - camera.x) * Math.min(1, delta * 0.6);
  camera.z += ((world.z * 0.02) - camera.z) * Math.min(1, delta * 0.6);
  engine.waterStream.setFocus({ x: camera.x, z: camera.z });
  engine.waterAudio.setListener({ x: camera.x, y: 1.6, z: camera.z });

  if (input.down && now - input.lastSplashAt > 90) {
    input.lastSplashAt = now;
    engine.waterSurface.disturb(world, 4.6, 0.72);
    engine.waterBehavior.splash({ actorId: "player", position: world });
    engine.waterEffects.splash({ position: world, radius: 2.1, intensity: 1 });
    engine.fluidEffects.emitEffect({ type: "ripple", position: world, radius: 4, intensity: 0.8 });
    engine.waterAudio.play("splash", { position: world, gain: 0.45 });
  }

  if (input.keys.has(" ")) engine.waterBehavior.dive({ actorId: "player", depth: 3 });
  else if (input.keys.has("e")) engine.waterBehavior.enter({ actorId: "player", depth: 1.4 });
  else engine.waterBehavior.swim({ actorId: "player", intent: { x: world.x, z: world.z } });

  if (input.keys.has("r")) {
    for (const key of ["waterSurface", "waterBehavior", "waterEffects", "waterAudio", "fluidEffects"]) engine[key]?.reset?.();
    input.keys.delete("r");
  }
}

function frame(now) {
  if (!running) return;
  const delta = Math.min(1 / 30, Math.max(0, (now - last) / 1000 || 1 / 60));
  last = now;
  flushInput(delta, now);
  runtime.tick(delta);
  draw(now);
  updateHud();
  requestAnimationFrame(frame);
}

function installInput() {
  canvas.addEventListener("pointermove", (event) => { input.x = event.clientX; input.y = event.clientY; });
  canvas.addEventListener("pointerdown", (event) => { input.down = true; input.x = event.clientX; input.y = event.clientY; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointerup", () => { input.down = false; });
  window.addEventListener("keydown", (event) => { input.keys.add(event.key.toLowerCase()); });
  window.addEventListener("keyup", (event) => { input.keys.delete(event.key.toLowerCase()); });
  window.addEventListener("blur", () => { input.keys.clear(); input.down = false; });
  window.addEventListener("resize", resize);
}

async function boot() {
  resize();
  const NexusRealtime = createMiniNexus();
  const kits = [
    createFluidFieldKit(NexusRealtime),
    createFluidMotionKit(NexusRealtime),
    createFluidShadingKit(NexusRealtime),
    createFluidEffectsKit(NexusRealtime),
    createWaterDataKit(NexusRealtime, { bodies: [{ id: "demo-pond", kind: "pond", bounds: { x: -46, z: -28, width: 92, depth: 56 }, depth: 3.8 }] }),
    createWaterStreamKit(NexusRealtime, { radius: 2, tileSize: 28 }),
    createWaterSurfaceKit(NexusRealtime, { amplitude: 0.3, frequency: 0.086, foamBias: 0.42 }),
    createWaterMeshKit(NexusRealtime, { meshes: [{ id: "demo-pond-mesh", bodyId: "demo-pond", policy: "tile-grid", density: 52 }] }),
    createWaterShadingKit(NexusRealtime, { materials: [{ id: "clear-water", shallowColor: "#9dfaff", deepColor: "#05294d", foamColor: "#f3ffff" }] }),
    createWaterPhysicsKit(NexusRealtime),
    createWaterBehaviorKit(NexusRealtime),
    createWaterEffectsKit(NexusRealtime),
    createWaterAudioKit(NexusRealtime),
    createWaterModeKit(NexusRealtime, { quality: "high" })
  ];
  runtime = createMiniRuntime(kits);
  runtime.engine.waterBehavior.enter({ actorId: "player", depth: 1.8 });
  runtime.engine.waterEffects.wake({ position: { x: -6, z: 0 }, radius: 6, intensity: 0.6 });
  runtime.engine.waterSurface.disturb({ x: -4, z: 0 }, 5, 0.5);
  installInput();
  window.GameHost = { runtime, engine: runtime.engine, input, tick: runtime.tick, getState: () => runtime.getState(), stop: () => { running = false; }, start: () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } } };
  statusEl.textContent = "fluid/water kits ready";
  requestAnimationFrame(frame);
}

boot().catch(showFatal);
