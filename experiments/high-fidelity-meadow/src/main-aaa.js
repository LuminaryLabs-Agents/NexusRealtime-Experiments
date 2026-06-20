import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { animateSheep, createCottage, createGrass, createPollen, createSheep, createSky, createUniformRegistry, installControls } from "./procedural-renderers.js?v=0.0.2-cutover-1";
import { createAaaTerrain } from "./aaa-terrain.js?v=0.0.2-cutover-1";
import { createAaaDressing } from "./aaa-dressing.js?v=aaa-1";
import { animateHighCloudDeck, createHighCloudDeck } from "./aaa-clouds.js?v=aaa-1";
import { createMeadowPostprocess } from "./aaa-postprocess.js?v=aaa-1";
import { createAudioEngine } from "./aaa-audio.js?v=aaa-1";
import { createExperimentMeadowKit, createMeadowShaderVfxKit, MEADOW_EXPERIMENT_SCENE_VERSION } from "./meadow-experiment-scene.js?v=0.0.2-cutover-1";

const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const errorPanel = document.querySelector("#errorPanel");
const clock = new THREE.Clock();
const BUILD_ID = `0.0.2-meadow-experiment-cutover-${MEADOW_EXPERIMENT_SCENE_VERSION}`;
const PROTO_SEED = "high-fidelity-countryside-v0.0.2";
const GOLDEN_HOUR_OFFSET_SECONDS = 420;

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
      mesh: {
        positions: [-0.018, 0, 0, 0.018, 0, 0, -0.012, 0.52, 0.08, 0.012, 0.52, 0.08, 0, 1, 0.24],
        uvs: [0, 0, 1, 0, 0.1, 0.55, 0.9, 0.55, 0.5, 1],
        indices: [0, 1, 2, 1, 3, 2, 2, 3, 4]
      },
      bladeInstances: desc.grass.blades.map((blade) => ({
        position: { x: blade.x, y: blade.y, z: blade.z },
        height: blade.height,
        yaw: blade.yaw,
        phase: blade.phase,
        bend: blade.bend,
        color: blade.color
      })),
      bladeCount: desc.grass.bladeCount,
      domainBatch: desc.grass.domainBatch,
      memoryBytes: desc.grass.memoryBytes
    },
    sheep: {
      count: desc.sheep.count,
      flock: desc.sheep.sheep.map((sheep) => ({
        ...sheep,
        parts: sheep.parts.map((part) => ({
          ...part,
          material: part.kind === "leg" ? "leg" : part.wool ? "wool" : "face"
        }))
      }))
    },
    vfx: {
      particles: (desc.vfx.fireflies ?? desc.vfx.particles).map((particle) => ({
        ...particle,
        seed: particle.seed ?? 0.5
      }))
    }
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
  const meadowKit = createExperimentMeadowKit(null, { seed: PROTO_SEED });
  const visualTargetKit = meadowKit.visualTargetKit;
  const visualTarget = visualTargetKit.createTargetDescriptor();
  const raw = meadowKit.createSceneDescriptor({
    width: 196,
    depth: 196,
    segments: 204,
    grass: { bladeCount: 34000, radius: 98 },
    flowers: { count: 1800, radius: 96 },
    vfx: { count: 2200, radius: 94 }
  });
  const visualTargetValidation = visualTargetKit.validateSceneDescriptor(raw);
  const desc = adapt(raw, createMeadowShaderVfxKit(null, { seed: PROTO_SEED }).listShaders());
  const uniforms = createUniformRegistry();
  const renderer = createRenderer();
  const world = new THREE.Scene();
  world.background = new THREE.Color(0x84aeda);
  world.fog = new THREE.FogExp2(0x9fbfb2, 0.012);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 560);
  const target = new THREE.Vector3();
  const controls = installControls(canvas, camera, target, {
    distance: 34,
    theta: Math.PI * 0.96,
    phi: 1.34,
    targets: [visualTarget.camera.target, visualTarget.focus.playerSilhouette, { x: 4, y: 1.4, z: 18 }]
  });
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
  world.add(
    sky,
    clouds,
    createAaaTerrain(desc, shaderSource(desc), uniforms.uniforms),
    createGrass(desc, uniforms.uniforms),
    createCottage(desc, uniforms.uniforms),
    createAaaDressing(raw)
  );
  const flock = createSheep(desc, uniforms.uniforms);
  world.add(flock, createPollen(desc, uniforms.uniforms));
  const post = createMeadowPostprocess(renderer, world, camera);
  const audio = createAudioEngine(raw.audio);
  const unlockAudio = () => audio.start();
  addEventListener("pointerdown", unlockAudio, { once: true });
  addEventListener("keydown", unlockAudio, { once: true });
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    post.resize(innerWidth, innerHeight);
  });
  window.GameHost = {
    renderer,
    scene: world,
    camera,
    meadowKit,
    visualTargetKit,
    sceneDescriptor: raw,
    audio,
    build: BUILD_ID,
    getState: () => ({
      build: BUILD_ID,
      ownership: raw.ownership,
      grass: raw.grass.bladeCount,
      flowers: raw.flowers.flowers.length,
      sheep: raw.sheep.count,
      clouds: clouds.children.length,
      visualTarget: {
        id: visualTarget.id,
        validation: visualTargetValidation,
        focalFeatures: visualTarget.focus.focalFeatures
      },
      cycle: meadowKit.sampleCycle(clock.getElapsedTime() + GOLDEN_HOUR_OFFSET_SECONDS),
      audio: audio.getState()
    })
  };
  function frame() {
    const time = clock.getElapsedTime();
    const cycle = meadowKit.sampleCycle(time + GOLDEN_HOUR_OFFSET_SECONDS);
    uniforms.update(time, controls.control.windSeed);
    applyCycle(cycle, world, renderer, { sun, moon, hemi }, sky, post, time);
    controls.update();
    animateSheep(flock, time);
    animateHighCloudDeck(clouds, time);
    post.render();
    const audioState = audio.getState();
    statusEl.textContent = `${raw.grass.bladeCount.toLocaleString()} grass · ${raw.flowers.flowers.length.toLocaleString()} flowers · ${raw.sheep.count} sheep · ${clouds.children.length} high clouds · target ${visualTargetValidation.score}/6 · ${cycle.time.phase} · ${audioState.enabled ? `audio ${audioState.section}` : "tap for 20m procedural audio"} · cutover ${MEADOW_EXPERIMENT_SCENE_VERSION}`;
    requestAnimationFrame(frame);
  }
  frame();
}

boot().catch(showFatal);
