import { OPEN_ABOVE_CONFIG } from "./open-above.config.js";

const params = new URLSearchParams(location.search);
const canvas = document.querySelector("#game");
const topHud = document.querySelector("#top");
const statusHud = document.querySelector("#status");
const err = document.querySelector("#err");

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const length = (v = {}) => Math.hypot(num(v.x), num(v.y), num(v.z));
const normalize = (v = {}, fallback = { x: 0, y: 0, z: -1 }) => {
  const l = length(v);
  return l > 0.000001 ? { x: num(v.x) / l, y: num(v.y) / l, z: num(v.z) / l } : clone(fallback);
};
const blend = (a = {}, b = {}, weight = 0.5) => ({
  x: num(a.x) * (1 - weight) + num(b.x) * weight,
  y: num(a.y) * (1 - weight) + num(b.y) * weight,
  z: num(a.z) * (1 - weight) + num(b.z) * weight
});

function fatal(error) {
  err.hidden = false;
  err.textContent = String(error?.stack || error?.message || error);
  topHud.textContent = "Runtime error";
  statusHud.textContent = "See error panel";
}

function moduleUrl(base, path) {
  return `${String(base).replace(/\/$/, "")}/${path}/index.js`;
}

function inputFromKeys(keys, controls) {
  const down = (codes) => codes.some((code) => keys.has(code));
  return {
    pitchUp: down(controls.pitchUp),
    pitchDown: down(controls.pitchDown),
    bankLeft: down(controls.bankLeft),
    bankRight: down(controls.bankRight),
    boost: down(controls.boost)
  };
}

function hasInput(input = {}) {
  return Boolean(input.pitchUp || input.pitchDown || input.bankLeft || input.bankRight || input.boost || Math.abs(num(input.pitch)) > 0.05 || Math.abs(num(input.bank)) > 0.05);
}

function normalizeInput(input = {}) {
  const pitch = num(input.pitch, 0);
  const bank = num(input.bank, 0);
  return {
    pitch,
    bank,
    pitchUp: Boolean(input.pitchUp || pitch > 0.05),
    pitchDown: Boolean(input.pitchDown || pitch < -0.05),
    bankLeft: Boolean(input.bankLeft || bank > 0.05),
    bankRight: Boolean(input.bankRight || bank < -0.05),
    boost: Boolean(input.boost)
  };
}

function forwardFromRotation(rotation = {}) {
  const pitch = num(rotation.pitch);
  const yaw = num(rotation.yaw);
  return {
    x: -Math.sin(yaw) * Math.cos(pitch),
    y: Math.sin(pitch),
    z: -Math.cos(yaw) * Math.cos(pitch)
  };
}

function terrainColor(biome, height) {
  if (height > 108) return "#8b988c";
  if (biome === "rocky") return "#717a76";
  if (biome === "meadow") return "#3f7f43";
  if (biome === "highland") return "#789071";
  return "#245b31";
}

function rgb(hex, fallback = [0.18, 0.38, 0.22]) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) return fallback;
  return [parseInt(raw.slice(0, 2), 16) / 255, parseInt(raw.slice(2, 4), 16) / 255, parseInt(raw.slice(4, 6), 16) / 255];
}

function createBird(THREE, config) {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.66, metalness: 0.01 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0xdce5e8, roughness: 0.72, metalness: 0.01 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.58 });
  const body = new THREE.ConeGeometry(1.18, num(config.bodyLength, 5.4), 9);
  body.rotateX(Math.PI / 2);
  root.add(new THREE.Mesh(body, bodyMat));
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.92, 12, 8), bodyMat);
  chest.scale.set(0.9, 0.74, 1.35);
  chest.position.set(0, 0.03, -0.72);
  root.add(chest);
  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 0), bodyMat);
  head.position.set(0, 0.54, -2.85);
  root.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.82, 5), beakMat);
  beak.rotateX(-Math.PI / 2);
  beak.position.set(0, 0.5, -3.42);
  root.add(beak);
  function wing(side) {
    const group = new THREE.Group();
    group.position.set(0.72 * side, 0.02, -0.35);
    const inner = new THREE.BoxGeometry(3.9, 0.07, 1.22);
    inner.translate(1.95 * side, 0, 0);
    const outer = new THREE.BoxGeometry(3.6, 0.055, 1.02);
    outer.translate(5.55 * side, -0.02, 0.04);
    group.add(new THREE.Mesh(inner, darkMat), new THREE.Mesh(outer, darkMat));
    group.userData = { side };
    return group;
  }
  const leftWing = wing(-1);
  const rightWing = wing(1);
  root.add(leftWing, rightWing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 1.9), darkMat);
  tail.position.set(0, -0.06, 2.05);
  root.add(tail);
  root.userData = { leftWing, rightWing, tail };
  return root;
}

function createPatchGeometry(THREE, patch, sampler, segments) {
  const size = num(patch.patchSize, OPEN_ABOVE_CONFIG.terrain.patchSize);
  const count = (segments + 1) * (segments + 1);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const indices = [];
  const originX = num(patch.px) * size - size / 2;
  const originZ = num(patch.pz) * size - size / 2;
  const step = size / segments;
  for (let z = 0; z <= segments; z += 1) {
    for (let x = 0; x <= segments; x += 1) {
      const index = z * (segments + 1) + x;
      const wx = originX + x * step;
      const wz = originZ + z * step;
      const height = sampler.getHeight(wx, wz);
      const color = rgb(terrainColor(sampler.getBiome(wx, wz), height));
      positions[index * 3] = wx;
      positions[index * 3 + 1] = height;
      positions[index * 3 + 2] = wz;
      colors[index * 3] = color[0];
      colors[index * 3 + 1] = color[1];
      colors[index * 3 + 2] = color[2];
    }
  }
  for (let z = 0; z < segments; z += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = z * (segments + 1) + x;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createRenderer(THREE, engine, config) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, config.quality.pixelRatioMax));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(new THREE.Color(config.sky.sky.horizon), 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.lighting.exposure;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.sky.sky.horizon);
  const camera = new THREE.PerspectiveCamera(config.camera.baseFov, innerWidth / innerHeight, 0.1, 5200);
  const hemi = new THREE.HemisphereLight(0xbdeaff, 0x253a22, 0.72);
  const sun = new THREE.DirectionalLight(0xfff3c4, 3.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(config.lighting.shadows.mapSize, config.lighting.shadows.mapSize);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = config.lighting.shadows.distance;
  sun.shadow.camera.left = -280;
  sun.shadow.camera.right = 280;
  sun.shadow.camera.top = 280;
  sun.shadow.camera.bottom = -280;
  scene.add(hemi, sun, sun.target);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      topColor: { value: new THREE.Color(config.sky.sky.zenith) },
      bottomColor: { value: new THREE.Color(config.sky.sky.horizon) },
      sunColor: { value: new THREE.Color(config.sky.sky.sun.color) },
      sunDir: { value: new THREE.Vector3(-0.35, 0.62, 0.54).normalize() }
    },
    vertexShader: "varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec3 v;uniform vec3 topColor,bottomColor,sunColor,sunDir;void main(){vec3 d=normalize(v);float h=max(0.,d.y);vec3 sky=mix(bottomColor,topColor,smoothstep(-.12,.76,h));float sd=max(0.,dot(d,sunDir));gl_FragColor=vec4(sky+sunColor*(pow(sd,96.)*.38+pow(sd,7.)*.18),1.);}"
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(4200, 40, 20), skyMat);
  skyDome.frustumCulled = false;
  skyDome.renderOrder = -1000;
  scene.add(skyDome);
  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.01 });
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x1f6531, roughness: 0.86 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x717a76, roughness: 0.88 });
  const bird = createBird(THREE, config.actor);
  bird.traverse((node) => { if (node.isMesh) node.castShadow = true; });
  scene.add(bird);
  const patches = new Map();
  const batches = new Map();
  const flockMeshes = new Map();
  const scratchMatrix = new THREE.Matrix4();
  const scratchPosition = new THREE.Vector3();
  const scratchQuaternion = new THREE.Quaternion();
  const scratchScale = new THREE.Vector3();

  function patchSegments(patch, body) {
    const size = num(patch.patchSize, config.terrain.patchSize);
    const cx = num(patch.px) * size;
    const cz = num(patch.pz) * size;
    const distance = Math.hypot(cx - body.position.x, cz - body.position.z);
    if (distance < config.quality.nearDistance) return config.quality.nearSegments;
    if (distance < config.quality.midDistance) return config.quality.midSegments;
    return config.quality.farSegments;
  }

  function syncScatter(renderBatches = []) {
    const live = new Set();
    for (const batch of renderBatches) {
      live.add(batch.id);
      let mesh = batches.get(batch.id);
      if (!mesh || mesh.count !== batch.instances.length) {
        if (mesh) scene.remove(mesh);
        const isRock = batch.kind === "rock";
        const geometry = isRock ? new THREE.DodecahedronGeometry(1, 0) : new THREE.ConeGeometry(1.2, 5.8, 6);
        const material = isRock ? rockMat : treeMat;
        mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, batch.instances.length));
        mesh.count = batch.instances.length;
        mesh.castShadow = !isRock;
        mesh.receiveShadow = true;
        scene.add(mesh);
        batches.set(batch.id, mesh);
      }
      batch.instances.forEach((instance, index) => {
        const t = instance.transform ?? {};
        scratchPosition.set(num(t.x), num(t.y), num(t.z));
        scratchQuaternion.setFromEuler(new THREE.Euler(0, num(t.rotationY), 0));
        const s = num(t.scale, 1);
        scratchScale.set(s, s * (batch.kind === "tree" ? 1.25 : 0.62), s);
        scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
        mesh.setMatrixAt(index, scratchMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    for (const [key, mesh] of batches) {
      if (!live.has(key)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        batches.delete(key);
      }
    }
  }

  function syncFlock(flock = []) {
    const live = new Set();
    for (const agent of flock) {
      live.add(agent.id);
      let mesh = flockMeshes.get(agent.id);
      if (!mesh) {
        mesh = createBird(THREE, { ...config.actor, bodyLength: 2.4 });
        mesh.scale.setScalar(0.42);
        scene.add(mesh);
        flockMeshes.set(agent.id, mesh);
      }
      mesh.position.set(agent.position.x, agent.position.y, agent.position.z);
      const yaw = Math.atan2(-agent.velocity.x, -agent.velocity.z);
      mesh.rotation.set(0, yaw, Math.sin(num(agent.phase)) * 0.08, "YXZ");
      const flap = Math.sin(num(agent.phase)) * 0.18;
      mesh.userData.leftWing.rotation.z = -flap;
      mesh.userData.rightWing.rotation.z = flap;
    }
    for (const [id, mesh] of flockMeshes) {
      if (!live.has(id)) {
        scene.remove(mesh);
        flockMeshes.delete(id);
      }
    }
  }

  function draw(state) {
    if (!state?.body) return;
    const sampler = engine.terrainSampler;
    const livePatches = new Set();
    for (const patch of state.terrain.patches) {
      const segments = patchSegments(patch, state.body);
      const key = `${patch.key}:${segments}`;
      livePatches.add(patch.key);
      const previous = patches.get(patch.key);
      if (!previous || previous.key !== key) {
        if (previous) {
          scene.remove(previous.mesh);
          previous.mesh.geometry.dispose();
        }
        const mesh = new THREE.Mesh(createPatchGeometry(THREE, patch, sampler, segments), terrainMat);
        mesh.receiveShadow = true;
        scene.add(mesh);
        patches.set(patch.key, { key, mesh });
      }
    }
    for (const [key, record] of patches) {
      if (!livePatches.has(key)) {
        scene.remove(record.mesh);
        record.mesh.geometry.dispose();
        patches.delete(key);
      }
    }
    syncScatter(state.render.batches);
    syncFlock(state.flock.agents);
    const body = state.body;
    const carveIntensity = clamp(num(body.carve?.turnStrength, 0), 0, 1);
    bird.position.set(body.position.x, body.position.y, body.position.z);
    bird.rotation.set(body.rotation.pitch || 0, body.rotation.yaw || 0, body.rotation.roll || 0, "YXZ");
    const flap = Math.sin(state.elapsed * (config.actor.flapRate + body.speed * config.actor.speedFlapRate)) * (0.14 + Math.min(0.36, body.speed / 360) + carveIntensity * 0.08);
    const roll = body.rotation.roll || 0;
    bird.userData.leftWing.rotation.z = -flap - roll * (0.42 + carveIntensity * 0.18);
    bird.userData.rightWing.rotation.z = flap + roll * (0.42 + carveIntensity * 0.18);
    bird.userData.tail.rotation.x = -body.rotation.pitch * 0.34 + num(body.stability?.sinkRate, 0) * -0.002;
    camera.position.lerp(new THREE.Vector3(state.camera.position.x, state.camera.position.y, state.camera.position.z), config.camera.smoothing);
    skyDome.position.copy(camera.position);
    camera.lookAt(state.camera.lookAt.x, state.camera.lookAt.y, state.camera.lookAt.z);
    camera.fov += (state.camera.fov - camera.fov) * 0.12;
    camera.updateProjectionMatrix();
    const sunDirection = state.sky.sun.direction;
    skyMat.uniforms.sunDir.value.set(sunDirection.x, sunDirection.y, sunDirection.z).normalize();
    sun.position.set(body.position.x + sunDirection.x * 320, body.position.y + sunDirection.y * 320, body.position.z + sunDirection.z * 320);
    sun.target.position.set(body.position.x, body.position.y, body.position.z);
    sun.target.updateMatrixWorld();
    scene.fog = new THREE.FogExp2(state.sky.atmosphere.fogColor, state.sky.atmosphere.density);
    topHud.innerHTML = `${config.title}<br>Speed: ${Math.round(body.speed)} · Alt: ${Math.round(body.altitude)} · Clearance: ${Math.round(body.clearance)}`;
    statusHud.textContent = `Carve ${Math.round(carveIntensity * 100)}% · Terrain ${state.terrain.patchCount} · Frame ${state.frame}`;
    renderer.render(scene, camera);
  }

  addEventListener("resize", () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, config.quality.pixelRatioMax));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });
  return { draw, renderer };
}

function blendedCameraForward(motion, config) {
  const rotationForward = normalize(forwardFromRotation(motion.rotation));
  const velocityForward = normalize(motion.velocity, rotationForward);
  const carveForward = normalize(motion.carve?.focusDirection, rotationForward);
  const lookVelocityWeight = clamp(num(config.camera.lookVelocityWeight, 0.42), 0, 1);
  const lookCarveWeight = clamp(num(config.camera.lookCarveFocusWeight, 0.32), 0, 1);
  const rotationVelocity = normalize(blend(rotationForward, velocityForward, lookVelocityWeight), rotationForward);
  return normalize(blend(rotationVelocity, carveForward, lookCarveWeight), rotationVelocity);
}

function composeState(engine, frame, elapsed, input, config) {
  const motion = engine.flightMotion.snapshot();
  const position = motion.position;
  const terrain = engine.terrainSampler;
  const groundHeight = terrain.getHeight(position.x, position.z);
  const patches = engine.worldPatch.listActive();
  const sky = engine.skyAtmosphere.snapshot();
  const lighting = engine.lightingDescriptor.snapshot();
  const actor = engine.actorRender.snapshot();
  const flock = engine.flockAgent.snapshot();
  const render = engine.instancedRender.snapshot();
  const lookForward = blendedCameraForward(motion, config);
  const velocityForward = normalize(motion.velocity, lookForward);
  const followBias = clamp(num(config.camera.followVelocityBias, 0.72), 0, 1);
  const followForward = normalize(blend(lookForward, velocityForward, followBias), lookForward);
  const followDistance = config.camera.followDistance;
  const followHeight = config.camera.followHeight;
  const speedRatio = clamp(motion.speed / config.physics.maxSpeed, 0, 1);
  const clearance = position.y - groundHeight;
  return {
    id: config.id,
    title: config.title,
    frame,
    elapsed,
    input: clone(input),
    body: { ...clone(motion), altitude: position.y, clearance, groundHeight },
    terrain: { seed: config.terrain.seed, patchSize: config.terrain.patchSize, patchCount: patches.length, nearSegments: config.quality.nearSegments, farSegments: config.quality.farSegments, patches },
    sky,
    lighting,
    actor,
    flock,
    render,
    camera: {
      lookForward,
      velocityForward,
      position: {
        x: position.x - followForward.x * followDistance,
        y: position.y + followHeight - followForward.y * num(config.camera.pitchLag, 5.5),
        z: position.z - followForward.z * followDistance
      },
      lookAt: {
        x: position.x + lookForward.x * config.camera.lookAhead,
        y: position.y + lookForward.y * num(config.camera.verticalLookAhead, 13),
        z: position.z + lookForward.z * config.camera.lookAhead
      },
      fov: config.camera.baseFov + speedRatio * config.camera.speedFovBoost
    },
    validation: {
      booted: true,
      frameAdvanced: frame > 0,
      moved: Math.hypot(position.x, position.z) > 0.1,
      airborne: !motion.onGround,
      forwardMotion: motion.speed > 20,
      sustainedFlight: !motion.onGround && motion.speed > 20 && clearance > 30,
      flightOnlySimulation: true,
      noWindForces: true,
      terrainStreaming: patches.length > 0,
      clearOfGround: clearance > 0,
      carveStatePresent: Boolean(motion.carve),
      cameraUsesVelocityBlend: true,
      skyboxCameraRelative: true
    }
  };
}

function collectRawState(engine) {
  return {
    dataRegistry: engine.dataRegistry?.snapshot?.(),
    performanceBudget: engine.performanceBudget?.snapshot?.(),
    skyAtmosphere: engine.skyAtmosphere?.snapshot?.(),
    lightingDescriptor: engine.lightingDescriptor?.snapshot?.(),
    materialPalette: engine.materialPalette?.snapshot?.(),
    terrainSampler: engine.terrainSampler?.snapshot?.(),
    worldPatch: engine.worldPatch?.snapshot?.(),
    scatterPlacement: engine.scatterPlacement?.snapshot?.(),
    instancedRender: engine.instancedRender?.snapshot?.(),
    flightMotion: engine.flightMotion?.snapshot?.(),
    actorRender: engine.actorRender?.snapshot?.(),
    flockAgent: engine.flockAgent?.snapshot?.()
  };
}

function buildOpenAboveKits(Nexus, modules, config) {
  return [
    modules.data.createDataRegistryKit(Nexus, { data: config, seed: config.seed, mode: "app-owned" }),
    modules.performance.createPerformanceBudgetKit(Nexus, { quality: "adaptive", budgets: config.quality }),
    modules.sky.createSkyAtmosphereKit(Nexus, config.sky),
    modules.lighting.createLightingDescriptorKit(Nexus, config.lighting),
    modules.materials.createMaterialPaletteKit(Nexus, { materials: config.materials }),
    modules.terrain.createTerrainSamplerKit(Nexus, { seed: config.terrain.seed, terrain: config.terrain }),
    modules.world.createWorldPatchKit(Nexus, { seed: config.seed, patchSize: config.terrain.patchSize, radius: config.quality.patchRadius }),
    modules.scatter.createScatterPlacementKit(Nexus, { seed: `${config.seed}:scatter`, rules: config.scatterRules }),
    modules.instanced.createInstancedRenderKit(Nexus, { lod: true }),
    modules.flight.createFlightMotionKit(Nexus, { physics: config.physics, actorId: config.actor.id }),
    modules.actor.createActorRenderKit(Nexus, { actors: [{ id: config.actor.id, archetype: config.actor.archetype }] }),
    modules.flock.createFlockAgentKit(Nexus, { seed: `${config.seed}:flock`, ...config.flock })
  ];
}

function makeHeuristicInput(state) {
  const clearance = num(state?.body?.clearance, 120);
  const speed = num(state?.body?.speed, 0);
  const frame = num(state?.frame, 0);
  const heuristic = OPEN_ABOVE_CONFIG.heuristic;
  const bankLeft = Math.floor(frame / 210) % 2 === 0;
  const onGround = Boolean(state?.body?.onGround);
  const low = num(heuristic.lowClearance, 125);
  const high = num(heuristic.highClearance, 280);
  const minSpeed = num(heuristic.minAirSpeed, 48);
  const boostSpeed = num(heuristic.boostBelowSpeed, 72);
  return {
    pitchUp: onGround || clearance < low,
    pitchDown: !onGround && clearance > high && speed < 104,
    bankLeft: !onGround && clearance >= low && speed >= minSpeed && bankLeft,
    bankRight: !onGround && clearance >= low && speed >= minSpeed && !bankLeft,
    boost: speed < boostSpeed && clearance > 55
  };
}

function initializeFlight(engine, config) {
  const start = config.flightStart ?? {};
  const pitch = num(start.pitch, 0.04);
  const yaw = num(start.yaw, 0);
  const speed = num(start.speed, 72);
  const position = { x: num(start.x, 0), y: 0, z: num(start.z, 0) };
  const ground = engine.terrainSampler.getHeight(position.x, position.z);
  position.y = ground + num(start.clearance, 220);
  const forward = forwardFromRotation({ pitch, yaw, roll: 0 });
  engine.flightMotion.setState({
    position,
    velocity: { x: forward.x * speed, y: forward.y * speed, z: forward.z * speed },
    rotation: { pitch, yaw, roll: 0 },
    speed,
    onGround: false,
    boostCooldown: 0
  });
}

async function boot() {
  const runtime = {
    threeUrl: params.get("three") || OPEN_ABOVE_CONFIG.runtime.threeUrl,
    nexusUrl: params.get("nexus") || OPEN_ABOVE_CONFIG.runtime.nexusUrl,
    protoKitBaseUrl: params.get("kitBase") || OPEN_ABOVE_CONFIG.runtime.protoKitBaseUrl
  };
  const [THREE, Nexus, data, performanceKit, sky, lighting, materials, terrain, world, scatter, instanced, flight, actor, flock] = await Promise.all([
    import(runtime.threeUrl),
    import(runtime.nexusUrl),
    import(moduleUrl(runtime.protoKitBaseUrl, "data-registry-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "performance-budget-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "sky-atmosphere-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "lighting-descriptor-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "material-palette-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "terrain-sampler-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "world-patch-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "scatter-placement-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "instanced-render-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "flight-motion-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "actor-render-kit")),
    import(moduleUrl(runtime.protoKitBaseUrl, "flock-agent-kit"))
  ]);
  const modules = { data, performance: performanceKit, sky, lighting, materials, terrain, world, scatter, instanced, flight, actor, flock };
  const engine = Nexus.createRealtimeGame({ kits: buildOpenAboveKits(Nexus, modules, OPEN_ABOVE_CONFIG) });
  initializeFlight(engine, OPEN_ABOVE_CONFIG);
  const view = createRenderer(THREE, engine, OPEN_ABOVE_CONFIG);
  const keys = new Set();
  let manualInput = {};
  let activeInput = {};
  let currentState = null;
  let frame = 0;
  let elapsed = 0;
  let running = true;
  let rafId = 0;

  function syncWorld(position) {
    const patches = engine.worldPatch.ensureAround(position);
    const scatterState = engine.scatterPlacement.snapshot();
    const activeKeys = new Set(patches.map((patch) => patch.key));
    for (const patch of patches) if (!scatterState.byPatch?.[patch.key]) engine.scatterPlacement.generateForPatch(patch);
    const activeScatter = Object.entries(engine.scatterPlacement.snapshot().byPatch ?? {}).filter(([key]) => activeKeys.has(key)).flatMap(([, objects]) => objects);
    engine.instancedRender.build(activeScatter);
  }

  function tick(delta = OPEN_ABOVE_CONFIG.simulation.fixedDt, inputOverride) {
    const d = clamp(delta, 0, OPEN_ABOVE_CONFIG.simulation.maxManualDelta);
    const nextInput = normalizeInput(inputOverride ?? manualInput);
    activeInput = nextInput;
    const motion = engine.flightMotion.step(nextInput, d);
    syncWorld(motion.position);
    engine.actorRender.updateFromMotion(OPEN_ABOVE_CONFIG.actor.id, motion);
    engine.flockAgent.step(motion.position, d);
    engine.lightingDescriptor.syncFromSky();
    engine.tick(d);
    frame += 1;
    elapsed += d;
    currentState = composeState(engine, frame, elapsed, nextInput, OPEN_ABOVE_CONFIG);
    return currentState;
  }

  function render() {
    if (!currentState) tick(0, activeInput);
    view.draw(currentState);
    return currentState;
  }

  function loop(previousTime) {
    if (!running) return;
    rafId = requestAnimationFrame((time) => {
      const delta = Math.min(OPEN_ABOVE_CONFIG.simulation.maxManualDelta, (time - previousTime) / 1000 || OPEN_ABOVE_CONFIG.simulation.fixedDt);
      const keyInput = inputFromKeys(keys, OPEN_ABOVE_CONFIG.controls);
      manualInput = hasInput(keyInput) ? keyInput : makeHeuristicInput(currentState);
      tick(delta, manualInput);
      render();
      loop(time);
    });
  }

  addEventListener("keydown", (event) => {
    keys.add(event.code);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.code === "Backquote") console.log(window.GameHost.getState());
  });
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());
  tick(OPEN_ABOVE_CONFIG.simulation.fixedDt, { boost: true });
  render();
  window.GameHost = {
    engine,
    renderer: view,
    config: OPEN_ABOVE_CONFIG,
    getState: () => clone(currentState),
    getRawState: () => collectRawState(engine),
    getValidationState: () => clone(currentState?.validation ?? {}),
    setInput(input = {}) { manualInput = normalizeInput(input); return this.getState(); },
    heuristicInput: () => makeHeuristicInput(currentState),
    tick(delta = OPEN_ABOVE_CONFIG.simulation.fixedDt, input) { return clone(tick(delta, input ?? manualInput)); },
    render: () => clone(render()),
    start() { if (!running) { running = true; loop(performance.now()); } return this.getState(); },
    stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; return this.getState(); },
    reset() { location.reload(); }
  };
  loop(performance.now());
}

boot().catch(fatal);
