import { OPEN_ABOVE_V2_CONFIG as CONFIG } from "./open-above-v2.config.js";

const params = new URLSearchParams(location.search);
const canvas = document.querySelector("#game");
const hud = document.querySelector("#hud");
const errorPanel = document.querySelector("#error");

const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const length = (v = {}) => Math.hypot(n(v.x), n(v.y), n(v.z));
const normalize = (v = {}, fallback = { x: 0, y: 0, z: -1 }) => {
  const l = length(v);
  return l > 1e-6 ? { x: n(v.x) / l, y: n(v.y) / l, z: n(v.z) / l } : clone(fallback);
};
const mix = (a, b, t) => n(a) + (n(b) - n(a)) * clamp(t, 0, 1);
const blend = (a = {}, b = {}, t = 0.5) => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), z: mix(a.z, b.z, t) });
const rgbMix = (a = [0, 0, 0], b = [1, 1, 1], t = 0.5) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

function fail(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack || error?.message || error);
  hud.innerHTML = "<strong>The Open Above V2</strong><br>Runtime error. See panel.";
}

function kitUrl(base, name) {
  return `${String(base).replace(/\/$/, "")}/${name}/index.js`;
}

function hexToRgb(hex, fallback = [0.74, 0.86, 0.93]) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) return fallback;
  return [parseInt(raw.slice(0, 2), 16) / 255, parseInt(raw.slice(2, 4), 16) / 255, parseInt(raw.slice(4, 6), 16) / 255];
}

function forwardFromRotation(rotation = {}) {
  const pitch = n(rotation.pitch);
  const yaw = n(rotation.yaw);
  return { x: -Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: -Math.cos(yaw) * Math.cos(pitch) };
}

function inputFromKeys(keys, controls) {
  const down = (codes = []) => codes.some((code) => keys.has(code));
  return {
    pitch: (down(controls.pitchUp) ? 1 : 0) + (down(controls.pitchDown) ? -1 : 0),
    bank: (down(controls.bankLeft) ? 1 : 0) + (down(controls.bankRight) ? -1 : 0),
    boost: down(controls.boost)
  };
}

function hasInput(input = {}) {
  return Math.abs(n(input.pitch)) > 0.05 || Math.abs(n(input.bank)) > 0.05 || Boolean(input.boost);
}

function createDomainTerrainSampler(engine, config) {
  const skyRgb = hexToRgb(config.sky?.sky?.horizon, [0.78, 0.90, 0.96]);
  const baseSampler = engine.baseTerrainSampler ?? engine.terrainSampler;

  function distanceFromCenter(x, z, center = null) {
    if (!center) return 0;
    return Math.hypot(n(x) - n(center.x), n(z) - n(center.z));
  }

  function contextFor(x, z, options = {}) {
    const center = options.center ?? options.origin ?? null;
    const distance = options.distance ?? distanceFromCenter(x, z, center);
    const band = options.band ?? engine.terrainHorizon?.sampleDistanceBand?.(distance) ?? "near";
    const hydrology = options.hydrology ?? engine.terrainHydrology?.sampleAt?.(x, z) ?? null;
    return { ...options, center, distance, band, hydrology };
  }

  function sample(x = 0, z = 0, options = {}) {
    const context = contextFor(x, z, options);
    const shaped = engine.terrainShaping?.sampleAt?.(x, z, context) ?? {
      x: n(x),
      z: n(z),
      height: baseSampler.getHeight(x, z),
      normal: baseSampler.getNormal?.(x, z) ?? { x: 0, y: 1, z: 0 },
      slope: 0,
      biome: baseSampler.getBiome?.(x, z) ?? "forest",
      color: [0.36, 0.52, 0.30],
      hydrology: context.hydrology,
      band: context.band
    };
    const compressedHeight = context.band === "far" || context.band === "horizon"
      ? engine.terrainHorizon?.compressFarHeight?.(shaped.height, context.distance) ?? shaped.height
      : shaped.height;
    const fog = engine.terrainHorizon?.fogBlend?.(context.distance) ?? 0;
    const riverTint = shaped.hydrology?.moisture ? [0.52, 0.70, 0.64] : shaped.color;
    const wetColor = rgbMix(shaped.color, riverTint, clamp(n(shaped.hydrology?.moisture, 0) * 0.34, 0, 0.34));
    const color = rgbMix(wetColor, skyRgb, clamp(fog * 0.78, 0, 0.82));
    return { ...shaped, height: compressedHeight, color, distance: context.distance, band: context.band, fog };
  }

  function getHeight(x, z) { return sample(x, z).height; }
  function getNormal(x, z) { return sample(x, z).normal; }
  function getBiome(x, z) { return sample(x, z).biome; }

  return {
    getState: () => baseSampler.getState?.(),
    getHeight,
    getNormal,
    getBiome,
    getVisualSample: sample,
    getPatchDescriptor(px, pz, patchSize = config.terrain.patchSize) {
      const cx = n(px) * patchSize;
      const cz = n(pz) * patchSize;
      const sampleAtCenter = sample(cx, cz);
      return {
        id: `terrain-patch:${px},${pz}`,
        key: `${px},${pz}`,
        px,
        pz,
        patchSize,
        center: { x: cx, z: cz, y: sampleAtCenter.height },
        biome: sampleAtCenter.biome,
        seed: `${config.terrain.seed}:domain:${px}:${pz}`
      };
    },
    snapshot: () => ({
      ...(baseSampler.snapshot?.() ?? baseSampler.getState?.() ?? {}),
      domainStack: {
        id: "open-above-domain-terrain-stack",
        shaping: engine.terrainShaping?.snapshot?.(),
        hydrology: engine.terrainHydrology?.snapshot?.(),
        horizon: engine.terrainHorizon?.snapshot?.()
      }
    })
  };
}

function createBirdMesh(THREE, config, scale = 1) {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.64, metalness: 0.01 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xdce7ea, roughness: 0.72, metalness: 0.01 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.55 });

  const body = new THREE.ConeGeometry(0.92 * scale, n(config.bodyLength, 4.2) * scale, 10);
  body.rotateX(Math.PI / 2);
  root.add(new THREE.Mesh(body, bodyMat));

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.74 * scale, 16, 10), bodyMat);
  chest.scale.set(0.92, 0.74, 1.28);
  chest.position.set(0, 0.03 * scale, -0.55 * scale);
  root.add(chest);

  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58 * scale, 0), bodyMat);
  head.position.set(0, 0.47 * scale, -2.22 * scale);
  root.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.18 * scale, 0.68 * scale, 5), beakMat);
  beak.rotateX(-Math.PI / 2);
  beak.position.set(0, 0.44 * scale, -2.76 * scale);
  root.add(beak);

  function wing(side) {
    const group = new THREE.Group();
    group.position.set(0.52 * side * scale, 0.02 * scale, -0.22 * scale);
    const inner = new THREE.BoxGeometry(2.75 * scale, 0.055 * scale, 0.86 * scale);
    inner.translate(1.38 * side * scale, 0, 0);
    const outer = new THREE.BoxGeometry(2.55 * scale, 0.045 * scale, 0.74 * scale);
    outer.translate(3.92 * side * scale, -0.02 * scale, 0.04 * scale);
    group.add(new THREE.Mesh(inner, wingMat), new THREE.Mesh(outer, wingMat));
    return group;
  }

  const leftWing = wing(-1);
  const rightWing = wing(1);
  root.add(leftWing, rightWing);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.08 * scale, 0.055 * scale, 1.34 * scale), wingMat);
  tail.position.set(0, -0.04 * scale, 1.62 * scale);
  root.add(tail);
  root.traverse((node) => { if (node.isMesh) node.castShadow = true; });
  root.userData = { leftWing, rightWing, tail };
  return root;
}

function createTerrainGeometry(THREE, patch, sampler, segments, context = {}) {
  const size = n(patch.patchSize, CONFIG.terrain.patchSize);
  const count = (segments + 1) * (segments + 1);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const indices = [];
  const originX = n(patch.px) * size - size / 2;
  const originZ = n(patch.pz) * size - size / 2;
  const step = size / segments;

  for (let z = 0; z <= segments; z += 1) {
    for (let x = 0; x <= segments; x += 1) {
      const index = z * (segments + 1) + x;
      const wx = originX + x * step;
      const wz = originZ + z * step;
      const sample = sampler.getVisualSample?.(wx, wz, context) ?? { height: sampler.getHeight(wx, wz), color: [0.36, 0.52, 0.30] };
      positions[index * 3] = wx;
      positions[index * 3 + 1] = sample.height;
      positions[index * 3 + 2] = wz;
      colors[index * 3] = sample.color[0];
      colors[index * 3 + 1] = sample.color[1];
      colors[index * 3 + 2] = sample.color[2];
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

function createHorizonRingGeometry(THREE, ring, sampler) {
  const segments = Math.max(12, Math.floor(n(ring.segments, 56)));
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const colors = new Float32Array((segments + 1) * 2 * 3);
  const indices = [];
  const center = ring.center ?? { x: 0, z: 0 };
  for (let i = 0; i <= segments; i += 1) {
    const angle = i / segments * Math.PI * 2;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    for (let r = 0; r < 2; r += 1) {
      const radius = r === 0 ? ring.innerRadius : ring.outerRadius;
      const wx = n(center.x) + ca * radius;
      const wz = n(center.z) + sa * radius;
      const index = (i * 2 + r) * 3;
      const sample = sampler.getVisualSample(wx, wz, { center, distance: radius, band: "horizon" });
      positions[index] = wx;
      positions[index + 1] = sample.height;
      positions[index + 2] = wz;
      colors[index] = sample.color[0];
      colors[index + 1] = sample.color[1];
      colors[index + 2] = sample.color[2];
    }
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createCloudBands(THREE) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.34, depthWrite: false });
  for (let i = 0; i < 26; i += 1) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mat);
    const angle = i * 0.72;
    const radius = 580 + (i % 5) * 86;
    mesh.position.set(Math.cos(angle) * radius, 260 + (i % 4) * 34, Math.sin(angle) * radius);
    mesh.scale.set(52 + (i % 3) * 26, 10 + (i % 4) * 4, 20 + (i % 5) * 11);
    group.add(mesh);
  }
  group.frustumCulled = false;
  return group;
}

function createHarnessRenderer(THREE, engine, config) {
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
  const camera = new THREE.PerspectiveCamera(config.camera.baseFov, innerWidth / innerHeight, 0.1, 5400);
  const hemi = new THREE.HemisphereLight(0xbdeaff, 0x233b24, 0.74);
  const sun = new THREE.DirectionalLight(0xfff0ba, 3.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(config.lighting.shadows.mapSize, config.lighting.shadows.mapSize);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = config.lighting.shadows.distance;
  sun.shadow.camera.left = -320;
  sun.shadow.camera.right = 320;
  sun.shadow.camera.top = 320;
  sun.shadow.camera.bottom = -320;
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
    fragmentShader: "varying vec3 v;uniform vec3 topColor,bottomColor,sunColor,sunDir;void main(){vec3 d=normalize(v);float h=max(0.,d.y);vec3 sky=mix(bottomColor,topColor,smoothstep(-.18,.82,h));float sd=max(0.,dot(d,sunDir));gl_FragColor=vec4(sky+sunColor*(pow(sd,106.)*.42+pow(sd,8.)*.18),1.);}"
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(4200, 44, 22), skyMat);
  skyDome.frustumCulled = false;
  skyDome.renderOrder = -1000;
  scene.add(skyDome);

  const cloudBands = createCloudBands(THREE);
  scene.add(cloudBands);
  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0.01, flatShading: false });
  const horizonMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0.01, transparent: true, opacity: 0.92, depthWrite: true });
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x1f6531, roughness: 0.86 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x747d78, roughness: 0.88 });
  const bird = createBirdMesh(THREE, config.actor, 1);
  scene.add(bird);

  const terrainMeshes = new Map();
  const horizonMeshes = new Map();
  const scatterMeshes = new Map();
  const flockMeshes = new Map();
  const scratchMatrix = new THREE.Matrix4();
  const scratchPosition = new THREE.Vector3();
  const scratchQuaternion = new THREE.Quaternion();
  const scratchScale = new THREE.Vector3();

  function patchSegments(patch, body) {
    const size = n(patch.patchSize, config.terrain.patchSize);
    const cx = n(patch.px) * size;
    const cz = n(patch.pz) * size;
    const distance = Math.hypot(cx - body.position.x, cz - body.position.z);
    if (distance < config.quality.nearDistance) return config.quality.nearSegments;
    if (distance < config.quality.midDistance) return config.quality.midSegments;
    return config.quality.farSegments;
  }

  function syncTerrain(state) {
    const live = new Set();
    for (const patch of state.terrain.patches) {
      const segments = patchSegments(patch, state.body);
      const renderKey = `${patch.key}:${segments}:domain-terrain-v2`;
      live.add(patch.key);
      const previous = terrainMeshes.get(patch.key);
      if (!previous || previous.renderKey !== renderKey) {
        if (previous) {
          scene.remove(previous.mesh);
          previous.mesh.geometry.dispose();
        }
        const mesh = new THREE.Mesh(createTerrainGeometry(THREE, patch, engine.terrainSampler, segments, { center: state.body.position }), terrainMat);
        mesh.receiveShadow = true;
        scene.add(mesh);
        terrainMeshes.set(patch.key, { renderKey, mesh });
      }
    }
    for (const [key, record] of terrainMeshes) {
      if (!live.has(key)) {
        scene.remove(record.mesh);
        record.mesh.geometry.dispose();
        terrainMeshes.delete(key);
      }
    }
  }

  function syncHorizon(state) {
    const live = new Set();
    for (const ring of state.terrain.horizonRings ?? []) {
      const snapX = Math.round(n(ring.center?.x) / 900);
      const snapZ = Math.round(n(ring.center?.z) / 900);
      const key = ring.id;
      const renderKey = `${ring.id}:${snapX},${snapZ}:${ring.segments}:${ring.innerRadius}:${ring.outerRadius}`;
      live.add(key);
      const previous = horizonMeshes.get(key);
      if (!previous || previous.renderKey !== renderKey) {
        if (previous) {
          scene.remove(previous.mesh);
          previous.mesh.geometry.dispose();
        }
        const mesh = new THREE.Mesh(createHorizonRingGeometry(THREE, { ...ring, center: { x: snapX * 900, z: snapZ * 900 } }, engine.terrainSampler), horizonMat);
        mesh.receiveShadow = false;
        mesh.renderOrder = -20;
        scene.add(mesh);
        horizonMeshes.set(key, { renderKey, mesh });
      }
    }
    for (const [key, record] of horizonMeshes) {
      if (!live.has(key)) {
        scene.remove(record.mesh);
        record.mesh.geometry.dispose();
        horizonMeshes.delete(key);
      }
    }
  }

  function syncScatter(batches = []) {
    const live = new Set();
    for (const batch of batches) {
      live.add(batch.id);
      let mesh = scatterMeshes.get(batch.id);
      if (!mesh || mesh.count !== batch.instances.length) {
        if (mesh) scene.remove(mesh);
        const isRock = batch.kind === "rock";
        const geometry = isRock ? new THREE.DodecahedronGeometry(1, 0) : new THREE.ConeGeometry(1.2, 5.8, 7);
        const material = isRock ? rockMat : treeMat;
        mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, batch.instances.length));
        mesh.count = batch.instances.length;
        mesh.castShadow = !isRock;
        mesh.receiveShadow = true;
        scene.add(mesh);
        scatterMeshes.set(batch.id, mesh);
      }
      batch.instances.forEach((instance, index) => {
        const t = instance.transform ?? {};
        scratchPosition.set(n(t.x), n(t.y), n(t.z));
        scratchQuaternion.setFromEuler(new THREE.Euler(0, n(t.rotationY), 0));
        const s = n(t.scale, 1);
        scratchScale.set(s, s * (batch.kind === "tree" ? 1.26 : 0.62), s);
        scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
        mesh.setMatrixAt(index, scratchMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    for (const [key, mesh] of scatterMeshes) {
      if (!live.has(key)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        scatterMeshes.delete(key);
      }
    }
  }

  function syncFlock(agents = []) {
    const live = new Set();
    for (const agent of agents) {
      live.add(agent.id);
      let mesh = flockMeshes.get(agent.id);
      if (!mesh) {
        mesh = createBirdMesh(THREE, config.actor, 0.42);
        scene.add(mesh);
        flockMeshes.set(agent.id, mesh);
      }
      mesh.position.set(agent.position.x, agent.position.y, agent.position.z);
      const yaw = Math.atan2(-agent.velocity.x, -agent.velocity.z);
      mesh.rotation.set(0, yaw, Math.sin(n(agent.phase)) * 0.08, "YXZ");
      const flap = Math.sin(n(agent.phase)) * 0.18;
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
    syncHorizon(state);
    syncTerrain(state);
    syncScatter(state.render.batches);
    syncFlock(state.flock.agents);

    const body = state.body;
    const carve = clamp(n(body.carve?.turnStrength), 0, 1);
    const dive = clamp(Math.max(0, -n(body.velocity?.y) / 72), 0, 1);
    bird.position.set(body.position.x, body.position.y, body.position.z);
    bird.rotation.set(body.rotation.pitch || 0, body.rotation.yaw || 0, body.rotation.roll || 0, "YXZ");
    const flap = Math.sin(state.elapsed * (config.actor.flapRate + body.speed * config.actor.speedFlapRate)) * (0.12 + Math.min(0.36, body.speed / 390) + carve * 0.08);
    const roll = body.rotation.roll || 0;
    bird.userData.leftWing.rotation.z = -flap - roll * (0.48 + carve * 0.22);
    bird.userData.rightWing.rotation.z = flap + roll * (0.48 + carve * 0.22);
    bird.userData.tail.rotation.x = -body.rotation.pitch * 0.38 + dive * 0.12;

    camera.position.copy(new THREE.Vector3(state.camera.position.x, state.camera.position.y, state.camera.position.z));
    skyDome.position.copy(camera.position);
    cloudBands.position.copy(camera.position);
    camera.lookAt(state.camera.lookAt.x, state.camera.lookAt.y, state.camera.lookAt.z);
    camera.fov = state.camera.fov;
    camera.updateProjectionMatrix();

    const sunDirection = state.sky.sun.direction;
    skyMat.uniforms.sunDir.value.set(sunDirection.x, sunDirection.y, sunDirection.z).normalize();
    sun.position.set(body.position.x + sunDirection.x * 340, body.position.y + sunDirection.y * 340, body.position.z + sunDirection.z * 340);
    sun.target.position.set(body.position.x, body.position.y, body.position.z);
    sun.target.updateMatrixWorld();
    scene.fog = new THREE.FogExp2(state.sky.atmosphere.fogColor, state.sky.atmosphere.density);

    hud.innerHTML = `<strong>${config.title}</strong><br>Speed ${Math.round(body.speed)} · Swoop ${Math.round(dive * 100)}% · Clearance ${Math.round(body.clearance)} · Rivers ${state.terrain.rivers.length} · Horizon ${state.terrain.horizonRings.length} · Bird camera`;
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

function composeState(engine, frame, elapsed, input, config) {
  const motion = engine.flightMotion.snapshot();
  const position = motion.position;
  const terrain = engine.terrainSampler;
  const groundHeight = terrain.getHeight(position.x, position.z);
  const patches = engine.worldPatch.listActive();
  const horizonRings = engine.terrainHorizon?.buildHorizonRings?.(position) ?? [];
  const rivers = engine.terrainHydrology?.listRivers?.(position) ?? [];
  const camera = engine.flightCamera?.snapshot?.() ?? { position, lookAt: { x: position.x, y: position.y, z: position.z - 1 }, fov: config.camera.baseFov };
  const clearance = position.y - groundHeight;

  return {
    id: config.id,
    title: config.title,
    frame,
    elapsed,
    input: clone(input),
    body: { ...clone(motion), altitude: position.y, clearance, groundHeight },
    terrain: { seed: config.terrain.seed, patchSize: config.terrain.patchSize, patchCount: patches.length, patches, horizonRings, rivers, domainStack: terrain.snapshot?.().domainStack },
    sky: engine.skyAtmosphere.snapshot(),
    lighting: engine.lightingDescriptor.snapshot(),
    actor: engine.actorRender.snapshot(),
    flock: engine.flockAgent.snapshot(),
    render: engine.instancedRender.snapshot(),
    camera,
    validation: {
      booted: true,
      frameAdvanced: frame > 0,
      sustainedFlight: !motion.onGround && motion.speed > 20 && clearance > 28,
      terrainStreaming: patches.length > 0,
      carveStatePresent: Boolean(motion.carve),
      directAssistedFlight: motion.control?.responseMode === "direct",
      cameraRelativeSkybox: true,
      compositionalHarness: true,
      birdFlightSimulator: true,
      terrainShapingReady: Boolean(engine.terrainShaping),
      terrainHydrologyReady: Boolean(engine.terrainHydrology),
      terrainHorizonReady: Boolean(engine.terrainHorizon),
      horizonRingsPresent: horizonRings.length > 0,
      flightCameraReady: Boolean(engine.flightCamera),
      trailingBirdCamera: camera.mode === "bird-follow"
    }
  };
}

function buildKits(Nexus, kits, config) {
  return [
    kits.data.createDataRegistryKit(Nexus, { data: config, seed: config.seed, mode: "bird-flight-simulator" }),
    kits.performance.createPerformanceBudgetKit(Nexus, { quality: "adaptive", budgets: config.quality }),
    kits.sky.createSkyAtmosphereKit(Nexus, config.sky),
    kits.lighting.createLightingDescriptorKit(Nexus, config.lighting),
    kits.materials.createMaterialPaletteKit(Nexus, { materials: config.materials }),
    kits.terrain.createTerrainSamplerKit(Nexus, { seed: config.terrain.seed, terrain: config.terrain }),
    kits.terrainHydrology.createTerrainHydrologyDomainKit(Nexus, { seed: `${config.seed}:hydrology`, hydrology: config.terrainHydrology }),
    kits.terrainShaping.createTerrainShapingDomainKit(Nexus, { seed: `${config.seed}:shaping`, shaping: config.terrainShaping }),
    kits.terrainHorizon.createTerrainHorizonLodKit(Nexus, { seed: `${config.seed}:horizon`, horizon: config.terrainHorizon }),
    kits.world.createWorldPatchKit(Nexus, { seed: config.seed, patchSize: config.terrain.patchSize, radius: config.quality.patchRadius }),
    kits.scatter.createScatterPlacementKit(Nexus, { seed: `${config.seed}:scatter`, rules: config.scatterRules }),
    kits.instanced.createInstancedRenderKit(Nexus, { lod: true }),
    kits.flight.createFlightMotionKit(Nexus, { physics: config.physics, actorId: config.actor.id }),
    kits.flightCamera.createFlightCameraDomainKit(Nexus, { camera: config.camera }),
    kits.actor.createActorRenderKit(Nexus, { actors: [{ id: config.actor.id, archetype: config.actor.archetype }] }),
    kits.flock.createFlockAgentKit(Nexus, { seed: `${config.seed}:flock`, ...config.flock })
  ];
}

function initializeFlight(engine, config) {
  const start = config.flightStart;
  const position = { x: n(start.x, 0), y: 0, z: n(start.z, 0) };
  position.y = engine.terrainSampler.getHeight(position.x, position.z) + n(start.clearance, 240);
  const rotation = { pitch: n(start.pitch, 0.035), yaw: n(start.yaw, 0), roll: 0 };
  const forward = forwardFromRotation(rotation);
  const speed = n(start.speed, 90);
  engine.flightMotion.setState({
    position,
    velocity: { x: forward.x * speed, y: forward.y * speed, z: forward.z * speed },
    rotation,
    speed,
    onGround: false,
    boostCooldown: 0
  });
  engine.flightCamera?.updateFromMotion?.(engine.flightMotion.snapshot(), config.simulation.fixedDt);
}

async function loadModules(config) {
  const runtime = {
    threeUrl: params.get("three") || config.runtime.threeUrl,
    nexusUrl: params.get("nexus") || config.runtime.nexusUrl,
    protoKitBaseUrl: params.get("kitBase") || config.runtime.protoKitBaseUrl
  };
  const [THREE, Nexus, data, performance, sky, lighting, materials, terrain, terrainHydrology, terrainShaping, terrainHorizon, world, scatter, instanced, flight, flightCamera, actor, flock] = await Promise.all([
    import(runtime.threeUrl),
    import(runtime.nexusUrl),
    import(kitUrl(runtime.protoKitBaseUrl, "data-registry-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "performance-budget-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "sky-atmosphere-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "lighting-descriptor-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "material-palette-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "terrain-sampler-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "terrain-hydrology-domain-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "terrain-shaping-domain-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "terrain-horizon-lod-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "world-patch-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "scatter-placement-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "instanced-render-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "flight-motion-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "flight-camera-domain-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "actor-render-kit")),
    import(kitUrl(runtime.protoKitBaseUrl, "flock-agent-kit"))
  ]);
  return { THREE, Nexus, kits: { data, performance, sky, lighting, materials, terrain, terrainHydrology, terrainShaping, terrainHorizon, world, scatter, instanced, flight, flightCamera, actor, flock } };
}

async function boot() {
  const { THREE, Nexus, kits } = await loadModules(CONFIG);
  const engine = Nexus.createRealtimeGame({ kits: buildKits(Nexus, kits, CONFIG) });
  engine.baseTerrainSampler = engine.terrainSampler;
  engine.terrainSampler = createDomainTerrainSampler(engine, CONFIG);
  initializeFlight(engine, CONFIG);
  const view = createHarnessRenderer(THREE, engine, CONFIG);
  const keys = new Set();
  let manualInput = {};
  let activeInput = {};
  let state = null;
  let frame = 0;
  let elapsed = 0;
  let running = true;
  let rafId = 0;

  function syncWorld(position) {
    const patches = engine.worldPatch.ensureAround(position);
    const activeKeys = new Set(patches.map((patch) => patch.key));
    const scatterState = engine.scatterPlacement.snapshot();
    for (const patch of patches) {
      if (!scatterState.byPatch?.[patch.key]) engine.scatterPlacement.generateForPatch(patch);
    }
    const activeObjects = Object.entries(engine.scatterPlacement.snapshot().byPatch ?? {})
      .filter(([key]) => activeKeys.has(key))
      .flatMap(([, objects]) => objects);
    engine.instancedRender.build(activeObjects);
  }

  function tick(delta = CONFIG.simulation.fixedDt, inputOverride) {
    const dt = clamp(delta, 0, CONFIG.simulation.maxManualDelta);
    const nextInput = inputOverride ?? manualInput;
    activeInput = nextInput;
    const motion = engine.flightMotion.step(nextInput, dt);
    engine.flightCamera?.updateFromMotion?.(motion, dt);
    syncWorld(motion.position);
    engine.actorRender.updateFromMotion(CONFIG.actor.id, motion);
    engine.flockAgent.step(motion.position, dt);
    engine.lightingDescriptor.syncFromSky();
    engine.tick(dt);
    frame += 1;
    elapsed += dt;
    state = composeState(engine, frame, elapsed, nextInput, CONFIG);
    return state;
  }

  function render() {
    if (!state) tick(0, activeInput);
    view.draw(state);
    return state;
  }

  function loop(previousTime) {
    if (!running) return;
    rafId = requestAnimationFrame((time) => {
      const keyInput = inputFromKeys(keys, CONFIG.controls);
      manualInput = hasInput(keyInput) ? keyInput : {};
      const dt = Math.min(CONFIG.simulation.maxManualDelta, (time - previousTime) / 1000 || CONFIG.simulation.fixedDt);
      tick(dt, manualInput);
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

  tick(CONFIG.simulation.fixedDt, { boost: true });
  render();

  const host = {
    engine,
    renderer: view,
    config: CONFIG,
    getState: () => clone(state),
    getRawState: () => ({
      flightMotion: engine.flightMotion?.snapshot?.(),
      flightCamera: engine.flightCamera?.snapshot?.(),
      terrainSampler: engine.terrainSampler?.snapshot?.(),
      baseTerrainSampler: engine.baseTerrainSampler?.snapshot?.(),
      terrainShaping: engine.terrainShaping?.snapshot?.(),
      terrainHydrology: engine.terrainHydrology?.snapshot?.(),
      terrainHorizon: engine.terrainHorizon?.snapshot?.(),
      worldPatch: engine.worldPatch?.snapshot?.(),
      instancedRender: engine.instancedRender?.snapshot?.(),
      flockAgent: engine.flockAgent?.snapshot?.()
    }),
    getValidationState: () => clone(state?.validation ?? {}),
    setInput(input = {}) { manualInput = input; return this.getState(); },
    tick(delta = CONFIG.simulation.fixedDt, input) { return clone(tick(delta, input ?? manualInput)); },
    render: () => clone(render()),
    captureReady: () => Boolean(state?.validation?.booted && state?.validation?.terrainShapingReady && state?.validation?.terrainHydrologyReady && state?.validation?.terrainHorizonReady && state?.validation?.flightCameraReady),
    hideHudForCapture() { hud.hidden = true; return this.getState(); },
    showHudAfterCapture() { hud.hidden = false; return this.getState(); },
    setCoverCamera() { return this.getState(); },
    start() { if (!running) { running = true; loop(performance.now()); } return this.getState(); },
    stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; return this.getState(); },
    reset() { location.reload(); }
  };

  window.GameHost = host;
  window.GameHostV2 = host;
  loop(performance.now());
}

boot().catch(fail);
