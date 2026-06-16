import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const eventKey = (event = {}) => `${event.at}:${event.type}:${event.targetId ?? event.reason ?? event.sector ?? ""}`;

function seeded(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createLayer(scene, config) {
  const random = seeded(config.seed ?? 1);
  const count = config.count ?? 120;
  const positions = new Float32Array(count * 3);
  const base = Array.from({ length: count }, () => ({
    x: (random() - 0.5) * (config.spreadX ?? 680),
    y: (random() - 0.5) * (config.spreadY ?? 900),
    z: (random() - 0.5) * (config.spreadZ ?? 120) + (config.z ?? 20),
    wobble: random() * Math.PI * 2,
    speed: 0.6 + random() * 1.6
  }));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: config.color, size: config.size ?? 2.4, transparent: true, opacity: config.opacity ?? 0.35, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  return { points, positions, base, spreadX: config.spreadX ?? 680, spreadY: config.spreadY ?? 900, speed: config.speed ?? 0.08, driftX: config.driftX ?? 0, driftY: config.driftY ?? 1, wobble: config.wobble ?? 18 };
}

function updateLayer(layer, snapshot, time) {
  const cameraY = snapshot.camera?.y ?? 0;
  const cameraX = snapshot.camera?.x ?? 0;
  for (let i = 0; i < layer.base.length; i += 1) {
    const p = layer.base[i];
    const xWrap = p.x + Math.sin(time * p.speed + p.wobble) * layer.wobble + time * layer.driftX;
    const yWrap = p.y + time * layer.speed * layer.driftY * 120;
    layer.positions[i * 3] = cameraX + ((((xWrap + layer.spreadX * 0.5) % layer.spreadX) + layer.spreadX) % layer.spreadX) - layer.spreadX * 0.5;
    layer.positions[i * 3 + 1] = cameraY + ((((yWrap + layer.spreadY * 0.5) % layer.spreadY) + layer.spreadY) % layer.spreadY) - layer.spreadY * 0.5;
    layer.positions[i * 3 + 2] = p.z;
  }
  layer.points.geometry.attributes.position.needsUpdate = true;
}

export function createDiegeticEffects({ scene }) {
  const layers = [
    createLayer(scene, { count: 240, color: 0x00f0ff, opacity: 0.18, size: 2.8, seed: 15, z: 24, spreadX: 720, spreadY: 980, speed: 0.055, driftX: 4, driftY: 0.75, wobble: 32 }),
    createLayer(scene, { count: 160, color: 0xffb83d, opacity: 0.22, size: 2.1, seed: 63, z: 36, spreadX: 620, spreadY: 760, speed: 0.092, driftX: -3, driftY: 1.12, wobble: 16 }),
    createLayer(scene, { count: 90, color: 0x3dffa3, opacity: 0.16, size: 1.7, seed: 108, z: 10, spreadX: 520, spreadY: 620, speed: 0.13, driftX: 1, driftY: 1.35, wobble: 11 })
  ];
  const seen = new Set();
  const root = new THREE.Group();
  const geometry = new THREE.SphereGeometry(1, 8, 8);
  const sparks = [];
  scene.add(root);

  function makeSparks(origin, color, count = 16, velocity = 22, life = 0.8, size = 1) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(origin.x ?? 0, origin.y ?? 0, origin.z ?? 3);
      mesh.scale.setScalar(size * (0.55 + Math.random() * 1.2));
      root.add(mesh);
      sparks.push({ mesh, vx: Math.cos(a) * velocity * (0.25 + Math.random()), vy: Math.sin(a) * velocity * (0.25 + Math.random()), vz: (Math.random() - 0.5) * velocity, life, age: 0 });
    }
  }

  function updateSparks(dt) {
    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const p = sparks[i];
      p.age += dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.mesh.scale.multiplyScalar(1 + dt * 0.7);
      p.mesh.material.opacity = Math.max(0, 1 - p.age / p.life);
      if (p.age >= p.life) {
        root.remove(p.mesh);
        p.mesh.material.dispose?.();
        sparks.splice(i, 1);
      }
    }
  }

  return {
    update(snapshot, dt = 1 / 60) {
      const time = (snapshot.frame ?? 0) / 60;
      for (const layer of layers) updateLayer(layer, snapshot, time);
      for (const evt of snapshot.recentEvents ?? []) {
        const key = eventKey(evt);
        if (seen.has(key)) continue;
        seen.add(key);
        const ledge = evt.targetId ? snapshot.route?.ledges?.find((candidate) => candidate.id === evt.targetId) : null;
        const origin = ledge ?? (evt.type === "grapple-fired" ? snapshot.probe : snapshot.player);
        if (evt.type === "released") makeSparks(snapshot.player, 0xffb83d, 16, 18, 0.55, 0.8);
        else if (evt.type === "grapple-fired") makeSparks(snapshot.probe, 0x00f0ff, 22, 24, 0.65, 0.75);
        else if (evt.type === "grapple-latched") makeSparks(origin, 0x00f0ff, 36, 30, 0.85, 1.0);
        else if (evt.type === "restored") makeSparks(origin, 0x3dffa3, 42, 34, 1.1, 1.1);
        else if (evt.type === "failed") makeSparks(snapshot.player, 0xff3858, 48, 38, 1.2, 1.2);
        else if (evt.type === "summit-reached") makeSparks(origin, 0xffd65a, 80, 54, 1.6, 1.3);
      }
      if (seen.size > 96) {
        const keep = Array.from(seen).slice(-48);
        seen.clear();
        keep.forEach((key) => seen.add(key));
      }
      updateSparks(dt);
    },
    dispose() {
      root.clear();
    }
  };
}

export function updateDiegeticPlayerSignals({ snapshot, playerMaterial, staminaHalo, dangerHalo, modeLight, dangerLight }) {
  const time = (snapshot.frame ?? 0) / 60;
  const staminaPct = clamp((snapshot.stamina ?? 0) / Math.max(1, snapshot.constants?.maxStamina ?? 100), 0, 1);
  playerMaterial.emissiveIntensity = 0.7 + staminaPct * 1.8 + (snapshot.mode === "falling" ? 0.9 : 0);
  staminaHalo.position.set(snapshot.player.x, snapshot.player.y, (snapshot.player.z ?? 1) + 1.5);
  staminaHalo.scale.setScalar(0.62 + staminaPct * 0.78 + Math.sin(time * 6) * 0.025);
  staminaHalo.material.opacity = 0.15 + staminaPct * 0.62;
  staminaHalo.material.color.set(staminaPct < 0.18 ? 0xff3858 : staminaPct < 0.45 ? 0xffb83d : 0x00f0ff);
  staminaHalo.rotation.z += 0.025 + (1 - staminaPct) * 0.03;
  dangerHalo.position.set(snapshot.player.x, snapshot.player.y, (snapshot.player.z ?? 1) + 1.25);
  dangerHalo.visible = staminaPct < 0.2 || snapshot.mode === "dead";
  dangerHalo.material.opacity = dangerHalo.visible ? 0.25 + Math.sin(time * 12) * 0.14 : 0;
  dangerHalo.scale.setScalar(1.1 + Math.sin(time * 10) * 0.12);
  dangerHalo.rotation.z -= 0.04;
  modeLight.position.set(snapshot.player.x, snapshot.player.y, 24);
  modeLight.intensity = snapshot.mode === "swinging" ? 1.9 : 2.8;
  dangerLight.position.set(snapshot.player.x, snapshot.player.y - 20, 32);
  dangerLight.intensity = snapshot.mode === "dead" ? 5 : staminaPct < 0.2 ? 2.2 : 0;
}
