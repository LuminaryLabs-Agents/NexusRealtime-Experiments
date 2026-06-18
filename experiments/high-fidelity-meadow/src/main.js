import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createHighFidelityMeadowSceneKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/rendering-stack-kits/high-fidelity-meadow.js";
import {
  animateSheep,
  createCottage,
  createGrass,
  createPollen,
  createSky,
  createTerrain,
  createUniformRegistry,
  installControls,
  terrainHeight
} from "./procedural-renderers.js";

const canvas = document.querySelector("#game");
const statusEl = document.querySelector("#status");
const errorPanel = document.querySelector("#errorPanel");
const clock = new THREE.Clock();

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
  statusEl.textContent = "startup failed — see error panel";
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

async function boot() {
  const meadowKit = createHighFidelityMeadowSceneKit(null, {
    seed: "high-fidelity-meadow-v0.0.2",
    width: 186,
    depth: 186,
    segments: 176,
    grass: { bladeCount: 18000, radius: 92 },
    sheep: { count: 17, radius: 32 },
    vfx: { count: 1400, radius: 86 }
  });
  const sceneDescriptor = meadowKit.createSceneDescriptor({
    grass: { bladeCount: 18000, radius: 92 },
    sheep: { count: 17, radius: 32 },
    vfx: { count: 1400, radius: 86 }
  });

  const uniformRegistry = createUniformRegistry();
  const renderer = createRenderer();
  const world = new THREE.Scene();
  world.background = new THREE.Color(0x84aeda);
  world.fog = new THREE.FogExp2(0x9fbfb2, 0.012);

  const camera = new THREE.PerspectiveCamera(sceneDescriptor.camera.fov, window.innerWidth / window.innerHeight, 0.1, 520);
  const target = new THREE.Vector3();
  const controls = installControls(canvas, camera, target);

  const sun = new THREE.DirectionalLight(0xffdda0, 4.2);
  sun.position.set(38, 70, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -64;
  sun.shadow.camera.right = 64;
  sun.shadow.camera.top = 64;
  sun.shadow.camera.bottom = -64;

  world.add(sun);
  world.add(new THREE.HemisphereLight(0x9ec8ff, 0x28351f, 2.2));
  world.add(createSky(uniformRegistry.uniforms));
  world.add(createTerrain(sceneDescriptor, uniformRegistry.uniforms));
  world.add(createGrass(sceneDescriptor, uniformRegistry.uniforms));
  world.add(createCottage(sceneDescriptor, uniformRegistry.uniforms));
  const flock = createSheep(sceneDescriptor, uniformRegistry.uniforms);
  world.add(flock);
  world.add(createPollen(sceneDescriptor, uniformRegistry.uniforms));

  const pathGlow = new THREE.Mesh(
    new THREE.RingGeometry(3.2, 3.55, 96),
    new THREE.MeshBasicMaterial({ color: 0xffe6a3, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
  );
  pathGlow.rotation.x = -Math.PI / 2;
  pathGlow.position.set(-2.2, terrainHeight(-2.2, -7.7) + 0.035, -7.7);
  world.add(pathGlow);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });

  window.GameHost = {
    renderer,
    scene: world,
    camera,
    meadowKit,
    sceneDescriptor,
    getState: () => ({
      assetPolicy: sceneDescriptor.assetPolicy,
      grassBlades: sceneDescriptor.grass.bladeCount,
      sheep: sceneDescriptor.sheep.count,
      shaders: sceneDescriptor.shaders.length,
      vfxParticles: sceneDescriptor.vfx.particles.length
    })
  };

  function frame() {
    const time = clock.getElapsedTime();
    uniformRegistry.update(time, controls.control.windSeed);
    controls.update();
    animateSheep(flock, time);
    pathGlow.material.opacity = 0.12 + Math.sin(time * 1.7) * 0.035;
    renderer.render(world, camera);
    statusEl.textContent = `${sceneDescriptor.grass.bladeCount.toLocaleString()} shader grass blades · ${sceneDescriptor.sheep.count} procedural sheep · ${sceneDescriptor.shaders.length} custom shaders · no assets`;
    requestAnimationFrame(frame);
  }

  frame();
}

boot().catch(showFatal);
