import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createEnemyObjectDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/enemy-object-domain-kit/index.js?v=domain-batch-02";
import { createEnemyAgentDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/enemy-agent-domain-kit/index.js?v=domain-batch-02";
import { createDamageHealthDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/damage-health-domain-kit/index.js?v=domain-batch-02";
import { createGuardDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/guard-domain-kit/index.js?v=domain-batch-02";
import { createParryWindowDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/parry-window-domain-kit/index.js?v=domain-batch-02";
import { createManaMeterDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/mana-meter-domain-kit/index.js?v=domain-batch-02";
import { createStatusEffectDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/status-effect-domain-kit/index.js?v=domain-batch-02";
import { createVegetationPlacementDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/vegetation-placement-domain-kit/index.js?v=domain-batch-02";
import { createRouteClearanceDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/route-clearance-domain-kit/index.js?v=domain-batch-02";
import { createTerrainGroundContactDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/terrain-ground-contact-domain-kit/index.js?v=domain-batch-02";
import { createWorldZoneDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/world-zone-domain-kit/index.js?v=domain-batch-02";
import { createInteractionDomainKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/interaction-domain-kit/index.js?v=domain-batch-02";

const factories = {
  enemyObject: createEnemyObjectDomainKit,
  enemyAgent: createEnemyAgentDomainKit,
  damageHealth: createDamageHealthDomainKit,
  guard: createGuardDomainKit,
  parry: createParryWindowDomainKit,
  mana: createManaMeterDomainKit,
  status: createStatusEffectDomainKit,
  vegetation: createVegetationPlacementDomainKit,
  routeClearance: createRouteClearanceDomainKit,
  ground: createTerrainGroundContactDomainKit,
  zone: createWorldZoneDomainKit,
  interaction: createInteractionDomainKit
};

function createNexus() {
  return {
    defineResource: (name) => ({ kind: "resource", name: String(name) }),
    defineEvent: (name) => ({ kind: "event", name: String(name) }),
    defineRuntimeKit: (spec) => ({ ...spec, __nexusRuntimeKit: true })
  };
}

function createWorld() {
  const resources = new Map();
  const events = new Map();
  return {
    __nexusClock: { frame: 0, delta: 0, elapsed: 0 },
    setResource(resource, value) { resources.set(resource?.name ?? String(resource), value); },
    getResource(resource) { return resources.get(resource?.name ?? String(resource)); },
    emit(event, payload = {}) {
      const key = event?.name ?? String(event);
      events.set(key, [...(events.get(key) ?? []), payload]);
    },
    readEvents(event) {
      const key = event?.name ?? String(event);
      const out = [...(events.get(key) ?? [])];
      events.set(key, []);
      return out;
    },
    tick(dt) { this.__nexusClock.delta = dt; this.__nexusClock.elapsed += dt; this.__nexusClock.frame += 1; }
  };
}

function install(factory, config = {}) {
  const kit = factory(createNexus(), config);
  const world = createWorld();
  const engine = {};
  kit.initWorld?.({ world, engine });
  kit.install?.({ world, engine });
  return { kit, world, engine, tick(dt) { world.tick(dt); for (const system of kit.systems ?? []) system.system(world); } };
}

function heightAt(x, z) {
  return Math.sin(x * 0.12) * 0.55 + Math.cos(z * 0.08) * 0.35 + Math.sin((x + z) * 0.04) * 0.2;
}

function makeEnemyBody(THREE, descriptor, color = 0xff4466) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18, roughness: 0.42, metalness: 0.08 });
  const ghostMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false });
  const torso = new THREE.Mesh(new THREE.SphereGeometry(descriptor.radius, 24, 16), bodyMat);
  torso.scale.y = descriptor.height / Math.max(0.01, descriptor.radius * 2.1);
  torso.position.y = descriptor.height * 0.46;
  const head = new THREE.Mesh(new THREE.SphereGeometry(descriptor.parts.head.radius, 18, 12), bodyMat);
  head.position.y = descriptor.parts.head.y;
  const aura = new THREE.Mesh(new THREE.SphereGeometry(descriptor.parts.aura.radius, 24, 12), ghostMat);
  aura.position.y = descriptor.height * 0.44;
  const armGeo = new THREE.CapsuleGeometry(descriptor.radius * 0.16, descriptor.parts.leftArm.length, 6, 12);
  const left = new THREE.Mesh(armGeo, ghostMat);
  left.position.set(-descriptor.radius * 1.3, descriptor.height * 0.48, 0);
  left.rotation.z = 0.45;
  const right = left.clone();
  right.position.x *= -1;
  right.rotation.z *= -1;
  group.add(aura, torso, head, left, right);
  return group;
}

function addForest(scene, domains, mode) {
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.15, 1, 7), new THREE.MeshStandardMaterial({ color: mode === "forest" ? 0x142415 : 0x252b38, roughness: 0.95 }), 180);
  const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(0.55, 1.35, 8), new THREE.MeshStandardMaterial({ color: mode === "forest" ? 0x1c5a2e : 0x354155, roughness: 0.85 }), 180);
  const dummy = new THREE.Object3D();
  let count = 0;
  for (let z = -28; z <= 28; z += 2.1) {
    for (let x = -28; x <= 28; x += 2.1) {
      if (count >= 180) break;
      const radius = 0.65 + ((x * x + z * z) % 7) * 0.08;
      if (!domains.routeClearance.engine.routeClearanceDomain.check({ x, z }, radius).ok) continue;
      const placed = domains.vegetation.engine.vegetationPlacementDomain.tryPlace({ id: `tree-${count}`, x, z, radius, scale: radius * 2.8 });
      if (!placed.ok) continue;
      const y = heightAt(x, z);
      dummy.position.set(x, y + placed.scale * 0.5, z);
      dummy.scale.setScalar(placed.scale);
      dummy.rotation.y = Math.sin(x * 3 + z) * Math.PI;
      dummy.updateMatrix();
      trunks.setMatrixAt(count, dummy.matrix);
      dummy.position.y = y + placed.scale * 1.45;
      dummy.updateMatrix();
      crowns.setMatrixAt(count, dummy.matrix);
      count += 1;
    }
  }
  trunks.count = count; crowns.count = count;
  trunks.instanceMatrix.needsUpdate = true; crowns.instanceMatrix.needsUpdate = true;
  scene.add(trunks, crowns);
}

function addRiftParticles(scene, color = 0x88ccff) {
  const geometry = new THREE.BufferGeometry();
  const data = [];
  for (let i = 0; i < 1600; i++) {
    const t = i / 1600 * Math.PI * 12;
    const r = 2 + i / 1600 * 18;
    data.push(Math.cos(t) * r, Math.sin(i * 0.017) * 5, Math.sin(t) * r);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(data, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: 0.075, transparent: true, opacity: 0.78 }));
  points.name = "domain-rift-particles";
  scene.add(points);
  return points;
}

export async function startScopedDomainThreeExperiment(config = {}) {
  const canvas = document.querySelector("#game");
  const status = document.querySelector("#status");
  const mode = config.mode ?? document.body.dataset.mode ?? "arena";
  const title = config.title ?? document.title;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.background ?? "#070a10");
  scene.fog = new THREE.FogExp2(config.fog ?? "#102333", 0.028);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 220);
  camera.position.set(0, 8, 22);
  scene.add(new THREE.HemisphereLight(0xb8e7ff, 0x11160d, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(-12, 18, 10);
  scene.add(key);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(72, 72, 72, 72), new THREE.MeshStandardMaterial({ color: config.floor ?? 0x182018, roughness: 0.88 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const domains = {
    enemyObject: install(factories.enemyObject, {}),
    enemyAgent: install(factories.enemyAgent, { agents: [{ id: "enemy-a", x: -5, z: 0, speed: 2.2 }, { id: "enemy-b", x: 6, z: -2, speed: 1.6 }] }),
    damageHealth: install(factories.damageHealth, { entities: [{ id: "player", health: 100 }, { id: "enemy-a", health: 90 }] }),
    guard: install(factories.guard, {}),
    parry: install(factories.parry, { duration: 0.35 }),
    mana: install(factories.mana, { mana: 80, maxMana: 100, regenPerSecond: 1.5 }),
    status: install(factories.status, {}),
    vegetation: install(factories.vegetation, { minSpacing: 0.25 }),
    routeClearance: install(factories.routeClearance, { route: [{ x: -20, z: 0 }, { x: 20, z: 0 }], clearWidth: 3 }),
    ground: install(factories.ground, { heightAt }),
    zone: install(factories.zone, { zones: [{ id: "center", x: 0, z: 0, radius: 8, tags: ["combat"] }, { id: "outer", x: 16, z: -10, radius: 6, tags: ["mana"] }] }),
    interaction: install(factories.interaction, { targets: [{ id: "obelisk", actions: ["scan", "bind", "open"] }] })
  };

  const body = domains.enemyObject.engine.enemyObjectDomain.register({ id: "enemy-a", x: -5, z: 0, bodyId: "body-a", health: 90 });
  const bodyDescriptor = (await import("https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/enemy-body-domain-kit/index.js?v=domain-batch-02")).createEnemyBodyDomainKit(createNexus(), {}).install;
  const enemyBody = makeEnemyBody(THREE, { height: 2.4, radius: 0.55, parts: { head: { y: 2.15, radius: 0.25 }, leftArm: { length: 0.95 }, aura: { radius: 1.5 } } }, config.enemyColor ?? 0xff5068);
  enemyBody.position.set(body.position.x, 0, body.position.z);
  scene.add(enemyBody);

  if (mode === "forest") addForest(scene, domains, mode);
  if (mode === "rift") addRiftParticles(scene, config.particleColor ?? 0x82eaff);
  if (mode === "zones" || mode === "arena") {
    for (const zone of domains.zone.engine.worldZoneDomain.getState().zones) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(zone.radius, 0.035, 8, 96), new THREE.MeshBasicMaterial({ color: zone.tags.includes("mana") ? 0x7c5cff : 0x6bf0b8 }));
      ring.rotation.x = Math.PI / 2; ring.position.set(zone.x, 0.04, zone.z); scene.add(ring);
    }
  }
  if (mode === "wraith") {
    addRiftParticles(scene, 0xff5068).scale.setScalar(0.5);
    scene.fog.density = 0.055;
  }

  const obelisk = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), new THREE.MeshStandardMaterial({ color: 0x10252a, emissive: 0x77f3ff, emissiveIntensity: 0.65 }));
  obelisk.position.set(4, 2, 3); scene.add(obelisk);
  const player = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.4, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffe36d, emissive: 0x553300, emissiveIntensity: 0.2 }));
  player.position.set(0, 1, 0); scene.add(player);

  const keys = new Set();
  addEventListener("keydown", (e) => { keys.add(e.key.toLowerCase()); if (e.key === " ") domains.parry.engine.parryWindowDomain.open("player"); if (e.key.toLowerCase() === "e") domains.interaction.engine.interactionDomain.request("obelisk", "scan"); if (e.key.toLowerCase() === "q") domains.guard.engine.guardDomain.raise("player", { stamina: 12 }); if (e.key.toLowerCase() === "f") domains.mana.engine.manaMeterDomain.spend(8); });
  addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener("resize", resize); resize();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const speed = keys.has("shift") ? 7 : 4;
    if (keys.has("a")) player.position.x -= speed * dt;
    if (keys.has("d")) player.position.x += speed * dt;
    if (keys.has("w")) player.position.z -= speed * dt;
    if (keys.has("s")) player.position.z += speed * dt;
    player.position.y = domains.ground.engine.terrainGroundContactDomain.ground({ id: "player", x: player.position.x, z: player.position.z }).y + 1;
    domains.zone.engine.worldZoneDomain.setEntityPosition("player", { x: player.position.x, z: player.position.z });
    domains.enemyAgent.engine.enemyAgentDomain.setTarget("enemy-a", { x: player.position.x, z: player.position.z });
    for (const d of Object.values(domains)) d.tick(dt);
    const agent = domains.enemyAgent.engine.enemyAgentDomain.getState().agentsById["enemy-a"];
    if (agent) enemyBody.position.set(agent.x, heightAt(agent.x, agent.z), agent.z);
    const t = now * 0.001;
    enemyBody.rotation.y = Math.sin(t) * 0.45;
    obelisk.rotation.y += dt * 0.5;
    camera.position.lerp(new THREE.Vector3(player.position.x + 12, 10, player.position.z + 18), 0.04);
    camera.lookAt(player.position);
    renderer.render(scene, camera);
    const mana = domains.mana.engine.manaMeterDomain.getState().mana.toFixed(0);
    const zone = domains.zone.engine.worldZoneDomain.getState().memberships.player?.join(",") || "wild";
    status.textContent = `${title} · mode ${mode} · mana ${mana} · zone ${zone} · E scan · Q guard · Space parry · F cast`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  globalThis.GameHost = { title, mode, domains, renderer, scene, camera, getState: () => ({ mode, mana: domains.mana.engine.manaMeterDomain.getState(), zones: domains.zone.engine.worldZoneDomain.getState(), enemies: domains.enemyObject.engine.enemyObjectDomain.getState() }) };
}
