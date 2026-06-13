import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const matFor = (m, type, hover) => hover ? m.hover : type === "rest" ? m.rest : type === "summit" ? m.summit : m.ledge;

function dispose(root) {
  root.traverse?.((child) => child.geometry?.dispose?.());
}

function cliffGeometry(h, id) {
  const geo = new THREE.PlaneGeometry(650, h, 10, 10);
  const pos = geo.attributes.position;
  const seed = Array.from(String(id)).reduce((s, c) => s + c.charCodeAt(0), 0);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.014 + seed) * Math.cos(y * 0.012) * 48 - (1 - Math.min(1, Math.abs(x) / 325)) * 45 - 50);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createThreeRenderer({ canvas }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03070b, 0.0035);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 5000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const m = {
    rock: new THREE.MeshStandardMaterial({ color: 0x050a12, roughness: 0.95, metalness: 0.05, flatShading: true }),
    metal: new THREE.MeshStandardMaterial({ color: 0x0c111a, roughness: 0.65, metalness: 0.88, flatShading: true }),
    ledge: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.0, roughness: 0.1 }),
    rest: new THREE.MeshStandardMaterial({ color: 0x3dffa3, emissive: 0x3dffa3, emissiveIntensity: 2.0, roughness: 0.1 }),
    summit: new THREE.MeshStandardMaterial({ color: 0xffd65a, emissive: 0xffd65a, emissiveIntensity: 2.5, roughness: 0.1 }),
    hover: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.5, roughness: 0.1 }),
    player: new THREE.MeshStandardMaterial({ color: 0xffb83d, emissive: 0xffb83d, emissiveIntensity: 1.2, roughness: 0.05, transparent: true, opacity: 0.95 }),
    probe: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.5, roughness: 0.1 }),
    reach: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
  };

  scene.add(new THREE.AmbientLight(0x0a1122, 0.65));
  const spot = new THREE.SpotLight(0x00f0ff, 3.2, 500);
  spot.angle = Math.PI / 3;
  spot.penumbra = 0.7;
  scene.add(spot, spot.target);

  const world = new THREE.Group();
  const ledges = new THREE.Group();
  scene.add(world, ledges);
  const player = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), m.player);
  const probe = new THREE.Mesh(new THREE.OctahedronGeometry(3.6, 0), m.probe);
  const rope = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 }));
  const traj = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffb83d, transparent: true, opacity: 0.35 }));
  const aim = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.18 }));
  const reach = new THREE.Mesh(new THREE.RingGeometry(148.8, 150, 64), m.reach);
  scene.add(player, probe, rope, traj, aim, reach);

  let routeKey = "";
  const ledgeMap = new Map();

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener("resize", resize);
  resize();

  function rebuild(snapshot) {
    routeKey = `${snapshot.levelId}:${snapshot.sector}:${snapshot.route?.ledges?.length ?? 0}`;
    dispose(world); dispose(ledges); world.clear(); ledges.clear(); ledgeMap.clear();
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
    for (const l of snapshot.route?.ledges ?? []) {
      const g = new THREE.Group();
      g.position.set(l.x, l.y, 0);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(l.r * 1.5, l.r * 1.5, 3.5, 6), m.metal);
      plate.rotation.x = Math.PI / 2;
      const core = new THREE.Mesh(new THREE.SphereGeometry(l.r, 10, 10), matFor(m, l.type, false));
      core.position.z = 1.5;
      g.add(plate, core);
      g.userData = { id: l.id, type: l.type, core };
      ledges.add(g); ledgeMap.set(l.id, g);
    }
  }

  function setLine(line, points = []) {
    line.visible = points.length > 0;
    const flat = new Float32Array(Math.max(1, points.length) * 3);
    points.forEach((p, i) => { flat[i * 3] = p.x; flat[i * 3 + 1] = p.y; flat[i * 3 + 2] = p.z ?? 1; });
    line.geometry.dispose?.();
    line.geometry = new THREE.BufferGeometry();
    line.geometry.setAttribute("position", new THREE.BufferAttribute(flat, 3));
  }

  function draw(snapshot) {
    if (!snapshot) return;
    resize();
    const key = `${snapshot.levelId}:${snapshot.sector}:${snapshot.route?.ledges?.length ?? 0}`;
    if (key !== routeKey) rebuild(snapshot);
    camera.position.set(snapshot.camera?.x ?? 0, snapshot.camera?.y ?? 0, snapshot.camera?.z ?? 210);
    camera.lookAt(0, snapshot.camera?.y ?? 0, 0);
    for (const [id, g] of ledgeMap) {
      const hot = id === snapshot.hoveredId || snapshot.enabledTargetIds?.includes(id);
      g.scale.setScalar(id === snapshot.hoveredId ? 1.3 : hot ? 1.08 : 1);
      g.userData.core.material = matFor(m, g.userData.type, id === snapshot.hoveredId);
    }
    player.position.set(snapshot.player.x, snapshot.player.y, snapshot.player.z ?? 1);
    player.scale.set(snapshot.player.scaleX ?? 1, snapshot.player.scaleY ?? 1, snapshot.player.scaleZ ?? 1);
    player.rotation.x = snapshot.player.rotationX ?? 0;
    player.rotation.y = snapshot.player.rotationY ?? 0;
    probe.visible = Boolean(snapshot.probe?.visible);
    probe.position.set(snapshot.probe?.x ?? 0, snapshot.probe?.y ?? 0, snapshot.probe?.z ?? 1);
    setLine(rope, snapshot.rope?.visible ? snapshot.rope.nodes : []);
    setLine(traj, snapshot.trajectory ?? []);
    setLine(aim, [{ x: snapshot.player.x, y: snapshot.player.y, z: 2 }, { x: snapshot.player.x + snapshot.aim.x * 150, y: snapshot.player.y + snapshot.aim.y * 150, z: 2 }]);
    reach.position.set(snapshot.reach?.x ?? snapshot.player.x, snapshot.reach?.y ?? snapshot.player.y, -1);
    reach.visible = snapshot.mode === "falling" || snapshot.mode === "retracting";
    spot.position.set(snapshot.player.x, snapshot.player.y + 115, 100);
    spot.target.position.set(snapshot.player.x, snapshot.player.y, -10);
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
