import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createDiegeticEffects, updateDiegeticPlayerSignals } from "./diegetic-effects.js";

const matFor = (m, type, hover) => hover ? m.hover : type === "rest" ? m.rest : type === "summit" ? m.summit : m.ledge;

function dispose(root) {
  root.traverse?.((child) => child.geometry?.dispose?.());
}

function cliffGeometry(h, id) {
  const geo = new THREE.PlaneGeometry(650, h, 14, 14);
  const pos = geo.attributes.position;
  const seed = Array.from(String(id)).reduce((s, c) => s + c.charCodeAt(0), 0);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.014 + seed) * Math.cos(y * 0.012) * 48 - (1 - Math.min(1, Math.abs(x) / 325)) * 45 - 50);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeLineMaterial(color, opacity = 0.5) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

export function createThreeRenderer({ canvas }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03070b, 0.0042);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 5000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x010305, 1);

  const m = {
    rock: new THREE.MeshStandardMaterial({ color: 0x050a12, roughness: 0.95, metalness: 0.05, flatShading: false }),
    metal: new THREE.MeshStandardMaterial({ color: 0x0c111a, roughness: 0.65, metalness: 0.88, flatShading: true }),
    ledge: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.0, roughness: 0.1 }),
    rest: new THREE.MeshStandardMaterial({ color: 0x3dffa3, emissive: 0x3dffa3, emissiveIntensity: 2.2, roughness: 0.1 }),
    summit: new THREE.MeshStandardMaterial({ color: 0xffd65a, emissive: 0xffd65a, emissiveIntensity: 3.0, roughness: 0.1 }),
    hover: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4.0, roughness: 0.1 }),
    player: new THREE.MeshStandardMaterial({ color: 0xffb83d, emissive: 0xffb83d, emissiveIntensity: 1.4, roughness: 0.05, transparent: true, opacity: 0.95 }),
    probe: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 3.0, roughness: 0.1 }),
    reach: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    stamina: new THREE.MeshBasicMaterial({ color: 0xffb83d, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }),
    danger: new THREE.MeshBasicMaterial({ color: 0xff3858, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }),
    beacon: new THREE.MeshBasicMaterial({ color: 0x3dffa3, transparent: true, opacity: 0.36, blending: THREE.AdditiveBlending, depthWrite: false }),
    summitBeam: new THREE.MeshBasicMaterial({ color: 0xffd65a, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
  };

  scene.add(new THREE.AmbientLight(0x0a1122, 0.75));
  const spot = new THREE.SpotLight(0x00f0ff, 3.8, 680);
  spot.angle = Math.PI / 3;
  spot.penumbra = 0.74;
  scene.add(spot, spot.target);
  const modeLight = new THREE.PointLight(0xffb83d, 2.4, 220);
  const dangerLight = new THREE.PointLight(0xff3558, 0, 260);
  scene.add(modeLight, dangerLight);

  const world = new THREE.Group();
  const ledges = new THREE.Group();
  const beacons = new THREE.Group();
  scene.add(world, ledges, beacons);

  const player = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), m.player);
  const staminaHalo = new THREE.Mesh(new THREE.TorusGeometry(10, 0.65, 8, 64), m.stamina);
  const dangerHalo = new THREE.Mesh(new THREE.TorusGeometry(15, 0.28, 8, 64), m.danger);
  const probe = new THREE.Mesh(new THREE.OctahedronGeometry(3.8, 0), m.probe);
  const rope = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x00f0ff, 0.9));
  const routeLine = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x133a4a, 0.42));
  const traj = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0xffb83d, 0.42));
  const aim = new THREE.Line(new THREE.BufferGeometry(), makeLineMaterial(0x00f0ff, 0.34));
  const reach = new THREE.Mesh(new THREE.RingGeometry(148.8, 150, 64), m.reach);
  scene.add(routeLine, player, staminaHalo, dangerHalo, probe, rope, traj, aim, reach);

  const diegeticEffects = createDiegeticEffects({ scene });
  let routeKey = "";
  const ledgeMap = new Map();

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
    camera.position.set(snapshot.camera?.x ?? 0, snapshot.camera?.y ?? 0, snapshot.camera?.z ?? 210);
    camera.lookAt(0, snapshot.camera?.y ?? 0, 0);

    const staminaPct = Math.max(0, Math.min(1, (snapshot.stamina ?? 0) / Math.max(1, snapshot.constants?.maxStamina ?? 100)));
    for (const [id, g] of ledgeMap) {
      const hot = id === snapshot.hoveredId || snapshot.enabledTargetIds?.includes(id);
      const pulse = 1 + Math.sin(time * 6 + (g.position.y || 0) * 0.01) * 0.045;
      g.scale.setScalar((id === snapshot.hoveredId ? 1.3 : hot ? 1.12 : 1) * pulse);
      g.userData.core.material = matFor(m, g.userData.type, id === snapshot.hoveredId);
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
    setLine(aim, [{ x: snapshot.player.x, y: snapshot.player.y, z: 2 }, { x: snapshot.player.x + snapshot.aim.x * 150, y: snapshot.player.y + snapshot.aim.y * 150, z: 2 }]);
    aim.visible = snapshot.mode === "falling" || snapshot.mode === "retracting" || snapshot.mode === "launched";
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
