import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createDiegeticEffects, updateDiegeticPlayerSignals } from "./diegetic-effects.js";

const matFor = (m, type, hover) => hover ? m.hover : type === "rest" ? m.rest : type === "summit" ? m.summit : m.ledge;
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

function dispose(root) {
  root.traverse?.((child) => child.geometry?.dispose?.());
}

function cliffGeometry(h, id) {
  const geo = new THREE.PlaneGeometry(650, h, 18, 18);
  const pos = geo.attributes.position;
  const seed = Array.from(String(id)).reduce((s, c) => s + c.charCodeAt(0), 0);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i), y = pos.getY(i);
    const ridge = Math.sin(x * 0.014 + seed) * Math.cos(y * 0.012) * 54;
    const carved = (1 - Math.min(1, Math.abs(x) / 325)) * 52;
    pos.setZ(i, ridge - carved - 56 + Math.sin(y * 0.028 + seed) * 8);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeLineMaterial(color, opacity = 0.5) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

function aimEndpoint(snapshot) {
  const p = snapshot.player ?? { x: 0, y: 0, z: 1 };
  const max = Math.max(32, num(snapshot.constants?.maxCableLength, 150));
  let tx = num(snapshot.aim?.worldX, p.x + num(snapshot.aim?.x, 0) * max);
  let ty = num(snapshot.aim?.worldY, p.y + num(snapshot.aim?.y, 1) * max);
  let dx = tx - p.x;
  let dy = ty - p.y;
  let len = Math.hypot(dx, dy);
  if (len < 0.001) {
    dx = num(snapshot.aim?.x, 0) || 0;
    dy = num(snapshot.aim?.y, 1) || 1;
    len = Math.hypot(dx, dy) || 1;
    tx = p.x + dx / len * max;
    ty = p.y + dy / len * max;
    len = max;
  }
  if (len > max) {
    const r = max / len;
    tx = p.x + dx * r;
    ty = p.y + dy * r;
    dx = tx - p.x;
    dy = ty - p.y;
    len = max;
  }
  return { start: { x: p.x, y: p.y, z: (p.z ?? 1) + 2.25 }, end: { x: tx, y: ty, z: 3 }, dx, dy, len, angle: Math.atan2(dy, dx) };
}

function colorForStyle(styleId = "") {
  if (styleId.includes("summit")) return 0xffd65a;
  if (styleId.includes("danger")) return 0xff3858;
  if (styleId.includes("cloud")) return 0xbfeaff;
  if (styleId.includes("foreground")) return 0x03070b;
  return 0x77e8ff;
}

function material(color, opacity, additive = false) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
}

function ellipseGeometry(width, height, segments = 48) {
  const geo = new THREE.CircleGeometry(1, segments);
  geo.scale(width, height, 1);
  return geo;
}

function layerZ(layerId = "") {
  if (layerId === "sky") return -310;
  if (layerId.includes("cloud")) return -230;
  if (layerId.includes("distant")) return -185;
  if (layerId.includes("mid")) return -118;
  if (layerId.includes("foreground")) return 44;
  return -40;
}

export function createThreeRenderer({ canvas }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03070b, 0.0036);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 5000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x010305, 1);

  const m = {
    rock: new THREE.MeshStandardMaterial({ color: 0x050a12, roughness: 0.95, metalness: 0.05, flatShading: false }),
    metal: new THREE.MeshStandardMaterial({ color: 0x0c111a, roughness: 0.65, metalness: 0.88, flatShading: true }),
    ledge: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.2, roughness: 0.1 }),
    rest: new THREE.MeshStandardMaterial({ color: 0x3dffa3, emissive: 0x3dffa3, emissiveIntensity: 2.4, roughness: 0.1 }),
    summit: new THREE.MeshStandardMaterial({ color: 0xffd65a, emissive: 0xffd65a, emissiveIntensity: 3.4, roughness: 0.1 }),
    hover: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4.3, roughness: 0.1 }),
    player: new THREE.MeshStandardMaterial({ color: 0xffb83d, emissive: 0xffb83d, emissiveIntensity: 1.55, roughness: 0.05, transparent: true, opacity: 0.97 }),
    probe: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 3.2, roughness: 0.1 }),
    reach: material(0x00f0ff, 0.06, true),
    stamina: material(0xffb83d, 0.75, true),
    danger: material(0xff3858, 0.4, true),
    beacon: material(0x3dffa3, 0.36, true),
    summitBeam: material(0xffd65a, 0.16, true),
    aimHead: material(0xffffff, 0.96, true),
    aimEnd: material(0x00f0ff, 0.88, true),
    aimCore: material(0xffb83d, 0.72, true),
    aimParticle: new THREE.PointsMaterial({ color: 0xfff3bd, size: 3.2, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
  };

  scene.add(new THREE.AmbientLight(0x0a1122, 0.8));
  const moon = new THREE.DirectionalLight(0xbfeaff, 1.2);
  moon.position.set(-120, 240, 180);
  scene.add(moon);
  const spot = new THREE.SpotLight(0x00f0ff, 4.2, 720);
  spot.angle = Math.PI / 3;
  spot.penumbra = 0.74;
  scene.add(spot, spot.target);
  const modeLight = new THREE.PointLight(0xffb83d, 2.5, 240);
  const dangerLight = new THREE.PointLight(0xff3558, 0, 280);
  scene.add(modeLight, dangerLight);

  const parallaxBack = new THREE.Group();
  const world = new THREE.Group();
  const ledges = new THREE.Group();
  const beacons = new THREE.Group();
  const parallaxFront = new THREE.Group();
  scene.add(parallaxBack, world, ledges, beacons, parallaxFront);

  const player = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), m.player);
  const staminaHalo = new THREE.Mesh(new THREE.TorusGeometry(10, 0.65, 8, 64), m.stamina);
  const dangerHalo = new THREE.Mesh(new THREE.TorusGeometry(15, 0.28, 8, 64), m.danger);
  const probe = new THREE.Mesh(new THREE.OctahedronGeometry(3.8, 0), m.probe);
  const rope = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x00f0ff, 0.9));
  const routeLine = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x133a4a, 0.42));
  const traj = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0xffb83d, 0.42));
  const aim = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0xfff3bd, 0.86));
  const reach = new THREE.Mesh(new THREE.RingGeometry(148.8, 150, 64), m.reach);
  const aimHead = new THREE.Mesh(new THREE.ConeGeometry(5.2, 16, 24), m.aimHead);
  const aimEnd = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.9, 8, 64), m.aimEnd);
  const aimCore = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 12), m.aimCore);
  const aimParticleCount = 48;
  const aimParticlePositions = new Float32Array(aimParticleCount * 3);
  const aimParticleGeometry = new THREE.BufferGeometry();
  aimParticleGeometry.setAttribute("position", new THREE.BufferAttribute(aimParticlePositions, 3));
  const aimParticles = new THREE.Points(aimParticleGeometry, m.aimParticle);
  scene.add(routeLine, player, staminaHalo, dangerHalo, probe, rope, traj, aim, reach, aimHead, aimEnd, aimCore, aimParticles);

  const diegeticEffects = createDiegeticEffects({ scene });
  let routeKey = "";
  let parallaxKey = "";
  const ledgeMap = new Map();
  const parallaxGroups = new Map();

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener("resize", resize);
  resize();

  function setLine(line, points = []) {
    line.visible = points.length > 0;
    const flat = new Float32Array(Math.max(1, points.length) * 3);
    points.forEach((p, i) => { flat[i * 3] = p.x; flat[i * 3 + 1] = p.y; flat[i * 3 + 2] = p.z ?? 1; });
    line.geometry.dispose?.();
    line.geometry = new THREE.BufferGeometry();
    line.geometry.setAttribute("position", new THREE.BufferAttribute(flat, 3));
  }

  function addCloud(group, layer, i) {
    const cloud = new THREE.Group();
    const c = colorForStyle(layer.styleId);
    for (let p = 0; p < 4; p += 1) {
      const blob = new THREE.Mesh(ellipseGeometry(52 + p * 18, 13 + p * 5, 42), material(c, 0.10 + p * 0.025, true));
      blob.position.set(p * 32 - 42, Math.sin(i + p) * 18, 0);
      cloud.add(blob);
    }
    cloud.position.set((i - 2) * 260, i % 2 ? 170 : -120, layerZ(layer.id));
    cloud.userData = { baseX: cloud.position.x, baseY: cloud.position.y, drift: 0.7 + i * 0.11 };
    group.add(cloud);
  }

  function addCliffBand(group, layer, i) {
    const shard = new THREE.Mesh(new THREE.PlaneGeometry(160 + i * 24, 520 + (i % 2) * 160, 4, 8), material(0x07111a, layer.id.includes("distant") ? 0.25 : 0.42, false));
    const pos = shard.geometry.attributes.position;
    for (let p = 0; p < pos.count; p += 1) pos.setZ(p, Math.sin(pos.getY(p) * 0.017 + i) * 14);
    shard.position.set(i % 2 ? -315 : 315, i * 220 - 420, layerZ(layer.id));
    shard.rotation.z = (i % 2 ? -1 : 1) * 0.08;
    group.add(shard);
  }

  function addForeground(group, layer, i) {
    const vine = new THREE.Mesh(new THREE.PlaneGeometry(24 + (i % 3) * 10, 560, 2, 8), material(0x010204, 0.34, false));
    vine.position.set((i - 2) * 170, i % 2 ? 80 : -120, layerZ(layer.id));
    vine.rotation.z = Math.sin(i) * 0.18;
    group.add(vine);
  }

  function rebuildParallax(snapshot) {
    parallaxBack.clear();
    parallaxFront.clear();
    parallaxGroups.clear();
    const layers = snapshot.domain?.parallax?.layers ?? [];
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(5200, 3200), material(0x07111a, 0.96, false));
    sky.position.set(0, 0, -340);
    parallaxBack.add(sky);
    for (const layer of layers) {
      const group = new THREE.Group();
      group.userData = { layerId: layer.id, baseZ: layerZ(layer.id) };
      const parent = layer.id.includes("foreground") ? parallaxFront : parallaxBack;
      parent.add(group);
      parallaxGroups.set(layer.id, group);
      if (layer.id.includes("cloud")) for (let i = 0; i < 7; i += 1) addCloud(group, layer, i);
      else if (layer.id.includes("cliff")) for (let i = 0; i < 7; i += 1) addCliffBand(group, layer, i);
      else if (layer.id.includes("foreground")) for (let i = 0; i < 7; i += 1) addForeground(group, layer, i);
    }
  }

  function updateParallax(snapshot, time) {
    const parallax = snapshot.domain?.parallax;
    if (!parallax) return;
    const key = `${snapshot.levelId}:${snapshot.sector}:${parallax.profileId}:${parallax.layers?.length ?? 0}`;
    if (key !== parallaxKey) { parallaxKey = key; rebuildParallax(snapshot); }
    for (const layer of parallax.layers ?? []) {
      const group = parallaxGroups.get(layer.id);
      if (!group) continue;
      const off = layer.offset ?? {};
      group.position.set(num(off.x) * 0.42, (snapshot.camera?.y ?? 0) + num(off.y) * 0.35, 0);
      group.children.forEach((child, i) => {
        child.position.x = (child.userData.baseX ?? child.position.x) + Math.sin(time * (child.userData.drift ?? 0.4) + i) * 8;
        child.position.y = (child.userData.baseY ?? child.position.y) + Math.cos(time * 0.37 + i) * 4;
      });
    }
    const styles = snapshot.domain?.renderStyles;
    const danger = snapshot.mode === "falling" || snapshot.mode === "launched" || snapshot.mode === "retracting";
    scene.fog.color.setHex(danger ? 0x250910 : snapshot.completed ? 0x2a2412 : 0x07111a);
    scene.fog.density = danger ? 0.0055 : snapshot.completed ? 0.0044 : 0.0036;
    renderer.setClearColor(snapshot.completed ? 0x130f04 : danger ? 0x080205 : 0x010305, 1);
    parallaxBack.visible = Boolean(styles || parallax.layers?.length);
  }

  function updateAimGuide(snapshot, time) {
    const active = Boolean(snapshot.alive && !snapshot.completed && !["dead", "won"].includes(snapshot.mode));
    const data = aimEndpoint(snapshot);
    const modeBoost = ["falling", "retracting", "launched"].includes(snapshot.mode) ? 1 : 0.72;
    const pulse = 0.5 + 0.5 * Math.sin(time * 9);
    setLine(aim, active ? [data.start, data.end] : []);
    aim.visible = active;
    aim.material.opacity = active ? 0.46 + modeBoost * 0.34 + pulse * 0.08 : 0;
    aimHead.visible = active;
    aimEnd.visible = active;
    aimCore.visible = active;
    aimParticles.visible = active;
    if (!active) return;
    aimHead.position.set(data.end.x, data.end.y, data.end.z + 1.2);
    aimHead.rotation.set(0, 0, data.angle - Math.PI / 2);
    aimHead.scale.setScalar(1 + pulse * 0.22);
    aimEnd.position.set(data.end.x, data.end.y, data.end.z);
    aimEnd.rotation.z += 0.045 + pulse * 0.01;
    aimEnd.scale.setScalar(0.86 + pulse * 0.18 + modeBoost * 0.12);
    aimEnd.material.opacity = 0.55 + pulse * 0.25;
    aimCore.position.set(data.end.x, data.end.y, data.end.z);
    aimCore.scale.setScalar(0.7 + pulse * 0.32);
    const px = -data.dy / Math.max(1, data.len);
    const py = data.dx / Math.max(1, data.len);
    for (let i = 0; i < aimParticleCount; i += 1) {
      const t = ((i / aimParticleCount) + time * (0.9 + modeBoost * 0.7)) % 1;
      const burst = Math.sin(t * Math.PI);
      const wave = Math.sin(time * 16 + i * 1.91) * (2.5 + burst * 7.5);
      aimParticlePositions[i * 3] = data.start.x + data.dx * t + px * wave;
      aimParticlePositions[i * 3 + 1] = data.start.y + data.dy * t + py * wave;
      aimParticlePositions[i * 3 + 2] = 4 + burst * 4.5;
    }
    aimParticleGeometry.attributes.position.needsUpdate = true;
    aimParticles.material.opacity = 0.35 + modeBoost * 0.42 + pulse * 0.16;
  }

  function rebuild(snapshot) {
    routeKey = `${snapshot.levelId}:${snapshot.sector}:${snapshot.route?.ledges?.length ?? 0}`;
    dispose(world); dispose(ledges); dispose(beacons); world.clear(); ledges.clear(); beacons.clear(); ledgeMap.clear();
    for (const chunk of snapshot.route?.chunks ?? []) {
      const cliff = new THREE.Mesh(cliffGeometry(chunk.h, chunk.id), m.rock);
      cliff.position.set(0, chunk.y + chunk.h / 2, -15);
      world.add(cliff);
      for (const x of [chunk.scaffold?.leftX ?? -170, chunk.scaffold?.rightX ?? 170]) {
        const girder = new THREE.Mesh(new THREE.BoxGeometry(8, chunk.h + 20, 8), m.metal);
        girder.position.set(x, chunk.y + chunk.h / 2, -10);
        world.add(girder);
      }
      for (const brace of chunk.scaffold?.braces ?? []) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(320, 3, 3), m.metal);
        mesh.position.set(brace.x, brace.y, -12);
        mesh.rotation.z = brace.rotation;
        world.add(mesh);
      }
    }
    const routePoints = [];
    for (const l of snapshot.route?.ledges ?? []) {
      const g = new THREE.Group();
      g.position.set(l.x, l.y, 0);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(l.r * 1.55, l.r * 1.55, 3.5, 6), m.metal);
      plate.rotation.x = Math.PI / 2;
      const core = new THREE.Mesh(new THREE.SphereGeometry(l.r, 14, 14), matFor(m, l.type, false));
      core.position.z = 1.5;
      const haloMaterial = matFor(m, l.type, false).clone();
      haloMaterial.transparent = true;
      haloMaterial.opacity = l.type === "normal" ? 0.18 : 0.42;
      haloMaterial.blending = THREE.AdditiveBlending;
      haloMaterial.depthWrite = false;
      const halo = new THREE.Mesh(new THREE.TorusGeometry(l.r * 2.25, 0.35, 8, 48), haloMaterial);
      g.add(plate, core, halo);
      g.userData = { id: l.id, type: l.type, core, halo };
      ledges.add(g);
      ledgeMap.set(l.id, g);
      routePoints.push({ x: l.x, y: l.y, z: -0.5 });
      if (l.type === "rest" || l.type === "summit") {
        const height = l.type === "summit" ? 420 : 120;
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(l.type === "summit" ? 7 : 4, l.type === "summit" ? 1.8 : 0.8, height, 18, 1, true), l.type === "summit" ? m.summitBeam : m.beacon);
        beam.position.set(l.x, l.y + height / 2, -2);
        beam.userData = { sourceY: l.y, type: l.type };
        beacons.add(beam);
      }
    }
    setLine(routeLine, routePoints);
  }

  function draw(snapshot) {
    if (!snapshot) return;
    resize();
    const time = (snapshot.frame ?? 0) / 60;
    const key = `${snapshot.levelId}:${snapshot.sector}:${snapshot.route?.ledges?.length ?? 0}`;
    if (key !== routeKey) rebuild(snapshot);
    const trauma = clamp01(snapshot.camera?.trauma ?? 0);
    camera.position.set((snapshot.camera?.x ?? 0) + Math.sin(time * 53) * trauma * 8, (snapshot.camera?.y ?? 0) + Math.cos(time * 47) * trauma * 6, snapshot.camera?.z ?? 210);
    camera.lookAt(0, snapshot.camera?.y ?? 0, 0);
    updateParallax(snapshot, time);

    const staminaPct = Math.max(0, Math.min(1, (snapshot.stamina ?? 0) / Math.max(1, snapshot.constants?.maxStamina ?? 100)));
    for (const [id, g] of ledgeMap) {
      const hot = id === snapshot.hoveredId || snapshot.enabledTargetIds?.includes(id) || id === snapshot.aimAssistTargetId;
      const pulse = 1 + Math.sin(time * 6 + (g.position.y || 0) * 0.01) * 0.045;
      g.scale.setScalar((id === snapshot.hoveredId || id === snapshot.aimAssistTargetId ? 1.3 : hot ? 1.12 : 1) * pulse);
      g.userData.core.material = matFor(m, g.userData.type, id === snapshot.hoveredId || id === snapshot.aimAssistTargetId);
      g.userData.halo.visible = hot || g.userData.type !== "normal";
      g.userData.halo.material.opacity = g.userData.type === "normal" ? (hot ? 0.22 + staminaPct * 0.18 : 0.05) : 0.32 + Math.sin(time * 4) * 0.08;
      g.userData.halo.rotation.z += 0.012;
    }
    for (const beam of beacons.children) {
      beam.material.opacity = beam.userData.type === "summit" ? 0.14 + Math.sin(time * 2.2) * 0.04 : 0.18 + Math.sin(time * 4.5 + beam.userData.sourceY) * 0.1;
      beam.rotation.y += beam.userData.type === "summit" ? 0.003 : 0.009;
    }

    player.position.set(snapshot.player.x, snapshot.player.y, snapshot.player.z ?? 1);
    player.scale.set(snapshot.player.scaleX ?? 1, snapshot.player.scaleY ?? 1, snapshot.player.scaleZ ?? 1);
    player.rotation.x = snapshot.player.rotationX ?? 0;
    player.rotation.y = snapshot.player.rotationY ?? 0;
    updateDiegeticPlayerSignals({ snapshot, playerMaterial: m.player, staminaHalo, dangerHalo, modeLight, dangerLight });

    probe.visible = Boolean(snapshot.probe?.visible);
    probe.position.set(snapshot.probe?.x ?? 0, snapshot.probe?.y ?? 0, snapshot.probe?.z ?? 1);
    setLine(rope, snapshot.rope?.visible ? snapshot.rope.nodes : []);
    setLine(traj, snapshot.trajectory ?? []);
    updateAimGuide(snapshot, time);
    reach.position.set(snapshot.reach?.x ?? snapshot.player.x, snapshot.reach?.y ?? snapshot.player.y, -1);
    reach.visible = snapshot.mode === "falling" || snapshot.mode === "retracting";
    reach.material.opacity = reach.visible ? 0.05 + Math.sin(time * 3) * 0.02 : 0;
    spot.position.set(snapshot.player.x, snapshot.player.y + 115, 100);
    spot.target.position.set(snapshot.player.x, snapshot.player.y, -10);
    diegeticEffects.update(snapshot, 1 / 60);
    renderer.render(scene, camera);
  }

  function screenToWorld(clientX, clientY, snapshot) {
    if (snapshot?.camera) { camera.position.set(snapshot.camera.x ?? 0, snapshot.camera.y ?? 0, snapshot.camera.z ?? 210); camera.lookAt(0, snapshot.camera.y ?? 0, 0); camera.updateMatrixWorld(); }
    const ndc = new THREE.Vector2(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    const vec = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const hit = camera.position.clone().add(dir.multiplyScalar(-camera.position.z / (dir.z || 0.0001)));
    return Number.isFinite(hit.x) && Number.isFinite(hit.y) ? { x: hit.x, y: hit.y } : null;
  }

  return { draw, screenToWorld };
}
