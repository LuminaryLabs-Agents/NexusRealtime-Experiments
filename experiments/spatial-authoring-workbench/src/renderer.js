import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const PALETTE = {
  panel: 0x3f86ff,
  note: 0xffd36e,
  timer: 0x90f0d0,
  button: 0xf2f7ff,
  selected: 0xfff3a0,
  ray: 0xc7f4ff
};

export function createSpatialRenderer({ canvas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.xr.enabled = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b12);
  scene.fog = new THREE.Fog(0x070b12, 2.5, 8);

  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.01, 40);
  camera.position.set(0, 1.45, 1.6);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x243044, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(2, 5, 3);
  scene.add(key);

  const floor = new THREE.GridHelper(5, 20, 0x36506e, 0x1b2a3b);
  scene.add(floor);

  const root = new THREE.Group();
  scene.add(root);
  const rayGroup = new THREE.Group();
  scene.add(rayGroup);

  const meshes = new Map();
  const hitTargets = new Map();

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener("resize", resize);

  function materialFor(object, selected) {
    const type = object.widget?.type ?? object.type;
    const color = selected ? PALETTE.selected : type.includes("note") ? PALETTE.note : type.includes("timer") ? PALETTE.timer : type.includes("button") ? PALETTE.button : PALETTE.panel;
    return new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.06, emissive: color, emissiveIntensity: selected ? 0.22 : 0.06 });
  }

  function makeMesh(object, selected) {
    const sx = Math.max(0.05, Number(object.transform?.scale?.x ?? object.bounds?.size?.x ?? 0.4));
    const sy = Math.max(0.05, Number(object.transform?.scale?.y ?? object.bounds?.size?.y ?? 0.25));
    const sz = Math.max(0.02, Number(object.transform?.scale?.z ?? 0.04));
    const geo = new THREE.BoxGeometry(sx, sy, sz);
    const mesh = new THREE.Mesh(geo, materialFor(object, selected));
    mesh.userData.objectId = object.id;
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: selected ? 0xffffff : 0x9bc7ff, transparent: true, opacity: selected ? 0.9 : 0.36 })));
    mesh.add(labelSprite(object.widget?.props?.label ?? object.widget?.props?.title ?? object.name ?? object.id));
    return mesh;
  }

  function labelSprite(text) {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512; labelCanvas.height = 128;
    const ctx = labelCanvas.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
    ctx.fillStyle = "white";
    ctx.font = "700 34px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(text).slice(0, 28), 256, 64);
    const texture = new THREE.CanvasTexture(labelCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(0.42, 0.105, 1);
    sprite.position.z = 0.035;
    return sprite;
  }

  function sync(snapshot) {
    const objects = snapshot?.scene?.objects ?? {};
    const selected = new Set(snapshot?.selection?.selectedObjectIds ?? []);
    for (const [id, object] of Object.entries(objects)) {
      const isSelected = selected.has(id);
      let entry = meshes.get(id);
      if (!entry || entry.selected !== isSelected || entry.kind !== object.widget?.type) {
        if (entry) root.remove(entry.mesh);
        const mesh = makeMesh(object, isSelected);
        root.add(mesh);
        hitTargets.set(id, mesh);
        entry = { mesh, selected: isSelected, kind: object.widget?.type };
        meshes.set(id, entry);
      }
      const pos = object.transform?.position ?? { x: 0, y: 1, z: -1.5 };
      entry.mesh.position.set(pos.x, pos.y, pos.z);
    }
    for (const id of [...meshes.keys()]) {
      if (!objects[id]) {
        root.remove(meshes.get(id).mesh);
        hitTargets.delete(id);
        meshes.delete(id);
      }
    }
  }

  function draw(snapshot) { sync(snapshot); renderer.render(scene, camera); }

  function pick(ray) {
    if (!ray?.origin || !ray?.direction) return null;
    const rc = new THREE.Raycaster(new THREE.Vector3(ray.origin.x, ray.origin.y, ray.origin.z), new THREE.Vector3(ray.direction.x, ray.direction.y, ray.direction.z).normalize(), 0.02, 8);
    const hits = rc.intersectObjects([...hitTargets.values()], true);
    const hit = hits.find((item) => item.object?.parent?.userData?.objectId || item.object?.userData?.objectId);
    if (!hit) return null;
    const objectId = hit.object.userData.objectId ?? hit.object.parent?.userData?.objectId;
    return { objectId, point: { x: hit.point.x, y: hit.point.y, z: hit.point.z }, distance: hit.distance };
  }

  function pointOnRay(ray, distance = 1.35) {
    return { x: ray.origin.x + ray.direction.x * distance, y: ray.origin.y + ray.direction.y * distance, z: ray.origin.z + ray.direction.z * distance };
  }

  function drawHandRays(commands = []) {
    rayGroup.clear();
    for (const command of commands) {
      if (!command.ray) continue;
      const origin = new THREE.Vector3(command.ray.origin.x, command.ray.origin.y, command.ray.origin.z);
      const end = new THREE.Vector3(command.ray.origin.x + command.ray.direction.x * 2, command.ray.origin.y + command.ray.direction.y * 2, command.ray.origin.z + command.ray.direction.z * 2);
      rayGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([origin, end]), new THREE.LineBasicMaterial({ color: PALETTE.ray, transparent: true, opacity: command.pinch?.active ? 0.95 : 0.45 })));
    }
  }

  return { THREE, renderer, scene, camera, draw, pick, pointOnRay, drawHandRays, getReferenceSpace: () => renderer.xr.getReferenceSpace() };
}
