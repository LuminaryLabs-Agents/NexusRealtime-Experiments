import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const colorApple = (r) => r === "legendary" ? 0xd36bff : r === "rare" ? 0xffe06b : 0xdf3f38;
const colorThreat = (m) => m.boss ? 0xff365f : m.elite ? 0xf0d27b : m.archetypeId === "runner-zombie" ? 0xa4f080 : 0x87a45f;
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02, ...extra });

function resize(canvas, renderer, camera) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = Math.max(320, canvas.clientWidth || innerWidth);
  const h = Math.max(240, canvas.clientHeight || innerHeight);
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function sync(group, cache, items, make, update) {
  const live = new Set();
  for (const item of items ?? []) {
    const id = String(item.id ?? item.entity ?? item.spawnId);
    live.add(id);
    let obj = cache.get(id);
    if (!obj) { obj = make(item); cache.set(id, obj); group.add(obj); }
    update(obj, item);
  }
  for (const [id, obj] of [...cache]) if (!live.has(id)) { cache.delete(id); group.remove(obj); }
}

const setXZ = (obj, p = {}) => obj.position.set(n(p.x), 0, n(p.z ?? p.y));

export async function createThreeView(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050606);
  scene.fog = new THREE.FogExp2(0x101407, 0.025);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  scene.add(new THREE.HemisphereLight(0xd9e6ff, 0x21150e, 1.9));
  const moon = new THREE.DirectionalLight(0xffe0a8, 2.7); moon.position.set(-24, 48, 26); scene.add(moon);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 190), mat(0x111608)); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const trees = new THREE.Group(), apples = new THREE.Group(), pickups = new THREE.Group(), threats = new THREE.Group(); scene.add(trees, apples, pickups, threats);
  const treeMap = new Map(), appleMap = new Map(), pickupMap = new Map(), threatMap = new Map();
  const player = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.75, 12), mat(0xf8e9ba)); body.position.y = 0.9;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), mat(0xfff5dc)); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.25, -0.72);
  player.add(body, nose); scene.add(player);
  const makeTree = (t) => { const g = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.4, 7), mat(0x4a2b16)); trunk.position.y = 1.7; const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.max(1.5, n(t.canopyRadius, 2.7)), 1), mat(0x193911)); canopy.position.y = 4.1; g.add(trunk, canopy); return g; };
  const makeApple = (a) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), mat(colorApple(a.rarity), { emissive: new THREE.Color(colorApple(a.rarity)), emissiveIntensity: 0.22 })); o.position.y = 0.55; return o; };
  const makePickup = () => { const o = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.9), mat(0xffd168)); o.position.y = 0.16; return o; };
  const makeThreat = (m) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(m.boss ? 0.85 : 0.45, m.boss ? 0.95 : 0.5, m.boss ? 3.4 : 2.2, 8), mat(colorThreat(m))); b.position.y = m.boss ? 1.7 : 1.1; g.add(b); return g; };
  return { renderer: "three", render(snapshot = {}) {
    resize(canvas, renderer, camera);
    const orchard = snapshot.orchard ?? {};
    sync(trees, treeMap, (orchard.treeRows ?? []).flatMap((r) => r.trees ?? []), makeTree, (o, t) => setXZ(o, t.position));
    sync(apples, appleMap, orchard.activeApples ?? [], makeApple, (o, a) => { setXZ(o, a.position); o.scale.setScalar(snapshot.nearestApple?.id === a.id ? 1.35 : 1); });
    sync(pickups, pickupMap, (snapshot.weapons?.pickups ?? []).filter((w) => w.active !== false), makePickup, (o, p) => { setXZ(o, p.position); o.scale.setScalar(snapshot.nearestWeapon?.id === p.id ? 1.35 : 1); });
    sync(threats, threatMap, snapshot.monsters ?? [], makeThreat, (o, m) => setXZ(o, m.position));
    const pp = snapshot.player?.position ?? { x: 0, z: 0 }; player.position.set(n(pp.x), 0, n(pp.z)); const f = snapshot.player?.facing ?? { x: 0, z: -1 }; player.rotation.y = Math.atan2(n(f.x), n(f.z));
    camera.position.lerp(new THREE.Vector3(n(pp.x), 25, n(pp.z) + 28), 0.08); camera.lookAt(n(pp.x), 0.8, n(pp.z) - 6);
    renderer.render(scene, camera); return snapshot;
  } };
}
