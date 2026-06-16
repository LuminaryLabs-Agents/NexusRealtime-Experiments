import { clamp, forwardFromYaw } from "./math.js";

const THREE_URL = "https://unpkg.com/three@0.160.0/build/three.module.js";

function color(value, fallback = "#77f3ff") {
  return String(value ?? fallback);
}

function positionOf(object) {
  const transform = object?.position ?? object?.transform ?? object ?? {};
  return {
    x: Number(transform.x ?? 0),
    y: Number(transform.y ?? 0),
    z: Number(transform.z ?? transform.y ?? 0),
    scale: Number(transform.scale ?? object?.metadata?.scale ?? 1)
  };
}

function dynamicObject(snapshot, object) {
  const game = snapshot.game;
  const relay = game.relays.find((entry) => entry.id === object.id);
  if (relay) return { ...object, position: { x: relay.x, y: 0, z: relay.z }, relay };
  if (object.id === game.gate.id) return { ...object, position: { x: game.gate.x, y: 0, z: game.gate.z }, gate: game.gate };
  const wraith = game.wraiths.find((entry) => entry.id === object.id);
  if (wraith) return { ...object, position: { x: wraith.x, y: 0, z: wraith.z }, wraith };
  return object;
}

function setObjectVisible(object, visible) {
  object.visible = visible;
  object.traverse?.((child) => { child.visible = visible; });
}

function makeRelay(THREE) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 3.4, 10),
    new THREE.MeshStandardMaterial({ color: "#10252a", roughness: 0.72, metalness: 0.22 })
  );
  base.position.y = 1.7;
  const coreMaterial = new THREE.MeshStandardMaterial({ color: "#77f3ff", emissive: "#77f3ff", emissiveIntensity: 1.8, roughness: 0.25 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 12), coreMaterial);
  core.position.y = 3.42;
  const beamMaterial = new THREE.MeshBasicMaterial({ color: "#77f3ff", transparent: true, opacity: 0.2, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.34, 16, 14, 1, true), beamMaterial);
  beam.position.y = 8.2;
  beam.userData.kind = "beam";
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.035, 8, 36),
    new THREE.MeshBasicMaterial({ color: "#bafcff", transparent: true, opacity: 0.6 })
  );
  ring.position.y = 3.42;
  ring.rotation.x = Math.PI / 2;
  ring.userData.kind = "scan-ring";
  group.add(base, core, beam, ring);
  group.userData.core = core;
  group.userData.beam = beam;
  group.userData.ring = ring;
  return group;
}

function makeGate(THREE) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: "#1c3438", emissive: "#77f3ff", emissiveIntensity: 0.45, roughness: 0.45 });
  const glow = new THREE.MeshBasicMaterial({ color: "#bafcff", transparent: true, opacity: 0.34, depthWrite: false });
  const left = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 5.6, 12), mat);
  const right = left.clone();
  left.position.set(-1.65, 2.8, 0);
  right.position.set(1.65, 2.8, 0);
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.34, 0.4), mat);
  top.position.y = 5.58;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.3, 22, 24, 1, true), glow);
  beam.position.y = 11.0;
  beam.userData.kind = "gate-beam";
  group.add(left, right, top, beam);
  group.userData.beam = beam;
  return group;
}

function makeWraith(THREE) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshBasicMaterial({ color: "#ff5068", transparent: true, opacity: 0.38, depthWrite: false });
  const auraMaterial = new THREE.MeshBasicMaterial({ color: "#ff5068", transparent: true, opacity: 0.12, depthWrite: false });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 12), bodyMaterial);
  body.scale.set(0.78, 1.85, 0.78);
  body.position.y = 1.3;
  const aura = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 12), auraMaterial);
  aura.scale.set(1.25, 1.65, 1.25);
  aura.position.y = 1.24;
  group.add(aura, body);
  group.userData.body = body;
  group.userData.aura = aura;
  return group;
}

function makeTree(THREE, object) {
  const group = new THREE.Group();
  const scale = clamp(positionOf(object).scale, 0.55, 2.6);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 2.1 * scale, 6),
    new THREE.MeshStandardMaterial({ color: "#101812", roughness: 0.95 })
  );
  trunk.position.y = 1.05 * scale;
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(0.9 * scale, 2.3 * scale, 7),
    new THREE.MeshStandardMaterial({ color: object.archetype === "glow-plant" ? "#315f40" : "#162819", roughness: 0.9 })
  );
  canopy.position.y = 2.55 * scale;
  group.add(trunk, canopy);
  return group;
}

function makeTerrain(THREE, snapshot) {
  const terrain = new THREE.Group();
  const bounds = snapshot.level?.bounds ?? { minX: -22, maxX: 22, minZ: -10, maxZ: 52 };
  const width = Math.abs((bounds.maxX ?? 22) - (bounds.minX ?? -22)) + 20;
  const depth = Math.abs((bounds.maxZ ?? 52) - (bounds.minZ ?? -10)) + 20;
  const centerZ = ((bounds.maxZ ?? 52) + (bounds.minZ ?? -10)) / 2;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth, 48, 72),
    new THREE.MeshStandardMaterial({ color: "#111c16", roughness: 0.96, metalness: 0.02 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.04, centerZ);
  terrain.add(ground);

  const pathPoints = (snapshot.level?.route ?? []).map((p) => new THREE.Vector3(p.x, 0.035, p.z));
  if (pathPoints.length > 1) {
    const route = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pathPoints),
      new THREE.LineBasicMaterial({ color: "#77f3ff", transparent: true, opacity: 0.42 })
    );
    terrain.add(route);
    for (const point of pathPoints) {
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(1.15, 24),
        new THREE.MeshBasicMaterial({ color: "#77f3ff", transparent: true, opacity: 0.06, depthWrite: false })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.copy(point);
      pad.position.y = 0.04;
      terrain.add(pad);
    }
  }

  return terrain;
}

export async function createThreeRenderer(canvas, options = {}) {
  const THREE = options.THREE ?? await import(THREE_URL);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07111a");
  scene.fog = new THREE.FogExp2("#102333", 0.032);

  const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 180);
  const hemi = new THREE.HemisphereLight("#9cdfff", "#07100b", 1.25);
  const moon = new THREE.DirectionalLight("#dff8ff", 1.35);
  moon.position.set(-8, 16, -10);
  moon.castShadow = true;
  scene.add(hemi, moon);

  const root = new THREE.Group();
  scene.add(root);

  const relays = new Map();
  const wraiths = new Map();
  const props = new Map();
  let gate = null;
  let terrain = null;
  let lastTerrainId = null;

  function resize() {
    const width = Math.max(320, globalThis.innerWidth || canvas.clientWidth || 1280);
    const height = Math.max(240, globalThis.innerHeight || canvas.clientHeight || 720);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function syncCamera(snapshot) {
    const player = snapshot.game.player;
    const forward = forwardFromYaw(player.yaw);
    camera.position.set(player.x, 1.72, player.z);
    camera.lookAt(player.x + forward.x * 12, 1.56, player.z + forward.z * 12);
  }

  function syncTerrain(snapshot) {
    const terrainId = snapshot.level?.id ?? "fogline-relay";
    if (terrain && lastTerrainId === terrainId) return;
    if (terrain) root.remove(terrain);
    terrain = makeTerrain(THREE, snapshot);
    terrain.name = "fogline-3d-terrain";
    root.add(terrain);
    lastTerrainId = terrainId;
  }

  function syncObjects(snapshot) {
    const seen = new Set();
    for (const raw of snapshot.visual?.layers?.drawOrder ?? []) {
      const object = dynamicObject(snapshot, raw);
      if (object.layer === "terrain" || object.archetype === "fog-volume") continue;
      const pos = positionOf(object);
      let mesh = null;
      if (object.archetype === "relay") {
        mesh = relays.get(object.id);
        if (!mesh) {
          mesh = makeRelay(THREE);
          relays.set(object.id, mesh);
          root.add(mesh);
        }
        const scanned = object.relay?.scanned;
        const progress = object.relay?.scanProgress ?? 0;
        mesh.userData.core.material.emissiveIntensity = scanned ? 2.8 : 1.5 + progress * 3.2;
        mesh.userData.ring.visible = progress > 0 && !scanned;
        mesh.userData.ring.scale.setScalar(1 + progress * 0.8);
        mesh.userData.beam.material.opacity = scanned ? 0.38 : 0.14 + progress * 0.2;
      } else if (object.archetype === "gate") {
        if (!gate) {
          gate = makeGate(THREE);
          root.add(gate);
        }
        mesh = gate;
        mesh.userData.beam.material.opacity = 0.08 + (object.gate?.openProgress ?? 0) * 0.42;
        mesh.scale.setScalar(1 + (object.gate?.openProgress ?? 0) * 0.12);
      } else if (object.archetype === "wraith") {
        mesh = wraiths.get(object.id);
        if (!mesh) {
          mesh = makeWraith(THREE);
          wraiths.set(object.id, mesh);
          root.add(mesh);
        }
        const danger = object.wraith?.mode === "chase" ? 1 : 0.45;
        mesh.userData.body.material.opacity = 0.28 + danger * 0.32;
        mesh.userData.aura.material.opacity = 0.08 + danger * 0.18;
      } else if (["trunk", "fern", "glow-plant", "tree", "scatter"].includes(object.archetype)) {
        const id = object.id ?? `${object.archetype}-${Math.round(pos.x * 10)}-${Math.round(pos.z * 10)}`;
        mesh = props.get(id);
        if (!mesh && props.size < 320) {
          mesh = makeTree(THREE, object);
          props.set(id, mesh);
          root.add(mesh);
        }
        if (!mesh) continue;
        seen.add(id);
      }
      if (!mesh) continue;
      mesh.position.set(pos.x, 0, pos.z);
      mesh.rotation.y = Number(object.rotation ?? object.transform?.yaw ?? 0);
      setObjectVisible(mesh, true);
    }

    for (const [id, mesh] of props) if (!seen.has(id)) setObjectVisible(mesh, false);
  }

  return {
    kind: "three",
    renderer,
    scene,
    camera,
    draw(snapshot) {
      resize();
      syncCamera(snapshot);
      syncTerrain(snapshot);
      syncObjects(snapshot);
      const fog = snapshot.visual?.fog?.atmosphere ?? {};
      scene.fog.density = clamp(Number(fog.haze ?? 0.045), 0.018, 0.07);
      renderer.render(scene, camera);
    },
    dispose() {
      renderer.dispose();
    }
  };
}
