import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createMeadowShaderVfxKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@76c4a3819248b40ff0003103fbd43b8d6adfd434/protokits/rendering-stack-kits/high-fidelity-meadow.js";
import { createHighFidelityMeadowAaaKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@76c4a3819248b40ff0003103fbd43b8d6adfd434/protokits/rendering-stack-kits/aaa-countryside-dsks.js";
import { animateSheep, createCottage, createGrass, createPollen, createSheep, createSky, createUniformRegistry, installControls } from "./procedural-renderers.js?v=sheep-fix-1";
import { createAaaTerrain } from "./aaa-terrain.js?v=aaa-1";
import { createAaaDressing } from "./aaa-dressing.js?v=aaa-1";
import { animateHighCloudDeck, createHighCloudDeck } from "./aaa-clouds.js?v=aaa-1";
import { createMeadowPostprocess } from "./aaa-postprocess.js?v=aaa-1";
import { createAudioEngine } from "./aaa-audio.js?v=aaa-1";

const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const errorPanel = document.querySelector("#errorPanel");
const clock = new THREE.Clock();
const BUILD_ID = "0.0.2-aaa-clouds-post-audio-1";
const PROTO_SEED = "high-fidelity-countryside-v0.0.2";

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
  statusEl.textContent = "startup failed — see error panel";
}

function adapt(desc, shaders) {
  return {
    ...desc,
    shaders,
    grass: {
      mesh: { positions: [-0.018,0,0,0.018,0,0,-0.012,0.52,0.08,0.012,0.52,0.08,0,1,0.24], uvs: [0,0,1,0,0.1,0.55,0.9,0.55,0.5,1], indices: [0,1,2,1,3,2,2,3,4] },
      bladeInstances: desc.grass.blades.map((b) => ({ position: { x: b.x, y: b.y, z: b.z }, height: b.height, yaw: b.yaw, phase: b.phase, bend: b.bend, color: b.color })),
      bladeCount: desc.grass.bladeCount
    },
    sheep: { count: desc.sheep.count, flock: desc.sheep.sheep.map((s) => ({ ...s, parts: s.parts.map((p) => ({ ...p, material: p.kind === "leg" ? "leg" : p.wool ? "wool" : "face" })) })) },
    vfx: { particles: (desc.vfx.fireflies ?? desc.vfx.particles).map((p) => ({ ...p, seed: p.seed ?? 0.5 })) }
  };
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

function shaderSource(desc) {
  return (id) => {
    const shader = desc.shaders.find((entry) => entry.id === id);
    if (!shader) throw new Error(`Missing shader: ${id}`);
    return shader.source;
  };
}

function applyCycle(cycle, world, renderer, lights, sky, post, time) {
  const dir = new THREE.Vector3(cycle.light.sunDirection.x, cycle.light.sunDirection.y, cycle.light.sunDirection.z).normalize();
  lights.sun.position.copy(dir).multiplyScalar(76);
  lights.sun.intensity = cycle.light.sunIntensity;
  lights.moon.position.set(-dir.x * 54, Math.max(8, -dir.y * 54), -dir.z * 54);
  lights.moon.intensity = cycle.light.moonIntensity;
  lights.hemi.intensity = 0.42 + cycle.light.dayAmount * 2 + cycle.light.warmRim * 0.35;
  world.fog.color.setRGB(...cycle.fog.color);
  world.fog.density = cycle.fog.density;
  renderer.toneMappingExposure = cycle.sky.exposure;
  sky.material.uniforms.uZenith.value.setRGB(...cycle.sky.zenith);
  sky.material.uniforms.uHorizon.value.setRGB(...cycle.sky.horizon);
  post.update(cycle.postprocess, time);
}

async function boot() {
  const meadowKit = createHighFidelityMeadowAaaKit(null, { seed: PROTO_SEED });
  const raw = meadowKit.createSceneDescriptor({ width: 196, depth: 196, segments: 204, grass: { bladeCount: 34000, radius: 98 }, flowers: { count: 1800, radius: 96 }, vfx: { count: 2200, radius: 94 } });
  const desc = adapt(raw, createMeadowShaderVfxKit(null, { seed: PROTO_SEED }).listShaders());
  const uniforms = createUniformRegistry();
  const renderer = createRenderer();
  const world = new THREE.Scene();
  world.background = new THREE.Color(0x84aeda);
  world.fog = new THREE.FogExp2(0x9fbfb2, 0.012);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 560);
  const target = new THREE.Vector3();
  const controls = installControls(canvas, camera, target);
  const sun = new THREE.DirectionalLight(0xffdda0, 4.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -76;
  sun.shadow.camera.right = 76;
  sun.shadow.camera.top = 76;
  sun.shadow.camera.bottom = -76;
  const moon = new THREE.DirectionalLight(0x9fb8ff, 0.3);
  const hemi = new THREE.HemisphereLight(0x9ec8ff, 0x233018, 2);
  world.add(sun, moon, hemi);
  const sky = createSky(uniforms.uniforms);
  const clouds = createHighCloudDeck({ y: 86, radius: 248, count: 22 });
  world.add(sky, clouds, createAaaTerrain(desc, shaderSource(desc), uniforms.uniforms), createGrass(desc, uniforms.uniforms), createCottage(desc, uniforms.uniforms), createAaaDressing(raw));
  const flock = createSheep(desc, uniforms.uniforms);
  world.add(flock, createPollen(desc, uniforms.uniforms));
  const post = createMeadowPostprocess(renderer, world, camera);
  const audio = createAudioEngine(raw.audio);
  const unlockAudio = () => audio.start();
  addEventListener("pointerdown", unlockAudio, { once: true });
  addEventListener("keydown", unlockAudio, { once: true });
  addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); post.resize(innerWidth, innerHeight); });
  window.GameHost = { renderer, scene: world, camera, meadowKit, sceneDescriptor: raw, audio, build: BUILD_ID, getState: () => ({ build: BUILD_ID, grass: raw.grass.bladeCount, flowers: raw.flowers.flowers.length, sheep: raw.sheep.count, clouds: clouds.children.length, cycle: meadowKit.sampleCycle(clock.getElapsedTime()), audio: audio.getState() }) };
  function frame() {
    const time = clock.getElapsedTime();
    const cycle = meadowKit.sampleCycle(time);
    uniforms.update(time, controls.control.windSeed);
    applyCycle(cycle, world, renderer, { sun, moon, hemi }, sky, post, time);
    controls.update();
    animateSheep(flock, time);
    animateHighCloudDeck(clouds, time);
    post.render();
    const audioState = audio.getState();
    statusEl.textContent = `${raw.grass.bladeCount.toLocaleString()} grass · ${raw.flowers.flowers.length.toLocaleString()} flowers · ${raw.sheep.count} sheep · ${clouds.children.length} high clouds · ${cycle.time.phase} · ${audioState.enabled ? `audio ${audioState.section}` : "tap for 20m procedural audio"} · ${BUILD_ID}`;
    requestAnimationFrame(frame);
  }
  frame();
}

boot().catch(showFatal);
