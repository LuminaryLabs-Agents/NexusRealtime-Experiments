import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { sampleMeadowTerrainHeight, sampleMeadowTerrainNormal } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/rendering-stack-kits/high-fidelity-meadow.js";

export const MEADOW_SEED = "high-fidelity-meadow-v0.0.2";
export const SUN = new THREE.Vector3(0.38, 0.88, 0.22).normalize();
const litVertex = `varying vec3 vNormal; varying vec3 vWorld; void main(){ vNormal=normalize(normalMatrix*normal); vec4 w=modelMatrix*vec4(position,1.0); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;

export function createUniformRegistry() {
  const sets = [];
  function uniforms(extra = {}) {
    const u = { uTime: { value: 0 }, uSun: { value: SUN.clone() }, uWind: { value: new THREE.Vector3(0.45, 0, 0.2) }, ...extra };
    sets.push(u);
    return u;
  }
  function update(time, windSeed = 0) {
    for (const u of sets) {
      if (u.uTime) u.uTime.value = time + windSeed * 10;
      if (u.uWind) u.uWind.value.set(0.45 + Math.sin(time * 0.31 + windSeed) * 0.18, 0, 0.2 + Math.cos(time * 0.25) * 0.12);
    }
  }
  return { uniforms, update, sets };
}

export function shader(desc, id) {
  const entry = desc.shaders.find((item) => item.id === id);
  if (!entry) throw new Error(`Missing shader descriptor: ${id}`);
  return entry.source;
}

export function terrainHeight(x, z) {
  return sampleMeadowTerrainHeight(x, z, { seed: MEADOW_SEED, amplitude: 1.18 });
}

export function terrainNormal(x, z) {
  const n = sampleMeadowTerrainNormal(x, z, { seed: MEADOW_SEED, amplitude: 1.18 });
  return new THREE.Vector3(n.x, n.y, n.z).normalize();
}

export function createTerrain(desc, uniforms) {
  const segments = Math.min(desc.terrain.segments, 176);
  const geometry = new THREE.PlaneGeometry(desc.terrain.width, desc.terrain.depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const n = terrainNormal(x, z);
    positions.setY(i, terrainHeight(x, z));
    normals.setXYZ(i, n.x, n.y, n.z);
  }
  positions.needsUpdate = true;
  normals.needsUpdate = true;
  geometry.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({ vertexShader: shader(desc, "meadow.terrain.vertex"), fragmentShader: shader(desc, "meadow.terrain.fragment"), uniforms: uniforms() });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

export function createGrass(desc, uniforms) {
  const base = desc.grass.mesh;
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(base.positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(base.uvs, 2));
  geometry.setIndex(base.indices);
  const blades = desc.grass.bladeInstances;
  const offsets = new Float32Array(blades.length * 3);
  const blade = new Float32Array(blades.length * 4);
  const colors = new Float32Array(blades.length * 3);
  for (let i = 0; i < blades.length; i += 1) {
    const item = blades[i];
    offsets.set([item.position.x, item.position.y + 0.015, item.position.z], i * 3);
    blade.set([item.height, item.yaw, item.phase, item.bend], i * 4);
    colors.set(item.color, i * 3);
  }
  geometry.setAttribute("instanceOffset", new THREE.InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute("instanceBlade", new THREE.InstancedBufferAttribute(blade, 4));
  geometry.setAttribute("instanceColor", new THREE.InstancedBufferAttribute(colors, 3));
  const material = new THREE.ShaderMaterial({ vertexShader: shader(desc, "meadow.grass.vertex"), fragmentShader: shader(desc, "meadow.grass.fragment"), uniforms: uniforms(), side: THREE.DoubleSide, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  return mesh;
}

function cottageMaterial(desc, uniforms, color) {
  return new THREE.ShaderMaterial({ vertexShader: litVertex, fragmentShader: shader(desc, "meadow.cottage.fragment"), uniforms: uniforms({ uBase: { value: color } }) });
}

function transform(mesh, t) {
  mesh.position.set(t.x ?? 0, t.y ?? 0, t.z ?? 0);
  mesh.rotation.set(t.rotation?.x ?? 0, t.rotation?.y ?? t.yaw ?? 0, t.rotation?.z ?? 0);
  mesh.scale.set(t.scale?.x ?? 1, t.scale?.y ?? 1, t.scale?.z ?? 1);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createCottage(desc, uniforms) {
  const group = new THREE.Group();
  const materials = {
    plaster: cottageMaterial(desc, uniforms, new THREE.Color(0.66, 0.58, 0.45)),
    wood: cottageMaterial(desc, uniforms, new THREE.Color(0.33, 0.18, 0.09)),
    roof: cottageMaterial(desc, uniforms, new THREE.Color(0.57, 0.42, 0.19)),
    stone: cottageMaterial(desc, uniforms, new THREE.Color(0.43, 0.41, 0.34)),
    glow: new THREE.ShaderMaterial({ vertexShader: litVertex, fragmentShader: `precision highp float; varying vec3 vWorld; uniform float uTime; void main(){ float p=.82+.18*sin(uTime*1.7+vWorld.x); gl_FragColor=vec4(vec3(1.,.62,.24)*p,1.); }`, uniforms: uniforms() })
  };
  for (const part of desc.cottage.parts) {
    let material = materials.plaster;
    if (part.type.includes("roof")) material = materials.roof;
    else if (part.type.includes("stone") || part.type.includes("foundation") || part.type.includes("chimney")) material = materials.stone;
    else if (part.type.includes("door") || part.type.includes("beam") || part.id.includes("ridge")) material = materials.wood;
    else if (part.type.includes("window")) material = materials.glow;
    group.add(transform(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 4, 4, 4), material), part.transform));
  }
  const windowLight = new THREE.PointLight(0xffbb77, 1.25, 9, 2);
  windowLight.position.set(desc.cottage.base.x + 2.05, desc.cottage.base.y + 5.95, desc.cottage.base.z + 0.8);
  group.add(windowLight);
  return group;
}

export function createSheep(desc, uniforms) {
  const flockGroup = new THREE.Group();
  const wool = new THREE.ShaderMaterial({ vertexShader: shader(desc, "meadow.sheepWool.vertex"), fragmentShader: shader(desc, "meadow.sheepWool.fragment"), uniforms: uniforms() });
  const face = new THREE.MeshStandardMaterial({ color: 0x3d3025, roughness: 0.84 });
  const leg = new THREE.MeshStandardMaterial({ color: 0x221b15, roughness: 0.9 });
  const runtime = [];
  for (const sheep of desc.sheep.flock) {
    const group = new THREE.Group();
    group.userData = { phase: sheep.phase, baseX: sheep.transform.x, baseZ: sheep.transform.z, yaw: sheep.transform.yaw };
    group.position.set(sheep.transform.x, sheep.transform.y, sheep.transform.z);
    group.rotation.y = sheep.transform.yaw;
    for (const part of sheep.parts) {
      const geometry = part.kind === "ellipsoid" ? new THREE.SphereGeometry(1, 24, 16) : part.kind === "leaf" ? new THREE.SphereGeometry(1, 12, 8) : new THREE.CylinderGeometry(1, 0.75, 1, 10, 2);
      const mesh = new THREE.Mesh(geometry, part.wool ? wool : (part.material.includes("leg") ? leg : face));
      mesh.position.set(...part.offset);
      mesh.scale.set(...part.scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      if (part.wool) {
        for (let shell = 1; shell <= Math.min(4, sheep.woolShells); shell += 1) {
          const shellMesh = mesh.clone();
          shellMesh.scale.multiplyScalar(1 + shell * 0.018);
          group.add(shellMesh);
        }
      }
    }
    flockGroup.add(group);
    runtime.push(group);
  }
  flockGroup.userData.sheepRuntime = runtime;
  return flockGroup;
}

export function animateSheep(flockGroup, time) {
  for (const sheep of flockGroup.userData.sheepRuntime ?? []) {
    const phase = sheep.userData.phase;
    sheep.position.x = sheep.userData.baseX + Math.sin(time * 0.07 + phase) * 0.6;
    sheep.position.z = sheep.userData.baseZ + Math.cos(time * 0.06 + phase) * 0.6;
    sheep.position.y = terrainHeight(sheep.position.x, sheep.position.z) + Math.abs(Math.sin(time * 1.8 + phase)) * 0.025;
    sheep.rotation.y = sheep.userData.yaw + Math.sin(time * 0.12 + phase) * 0.11;
    sheep.rotation.x = Math.sin(time * 0.75 + phase) < -0.2 ? 0.06 : 0;
  }
}

export function createPollen(desc, uniforms) {
  const points = desc.vfx.particles;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points.length * 3);
  const seeds = new Float32Array(points.length);
  for (let i = 0; i < points.length; i += 1) {
    positions.set([points[i].x, points[i].y, points[i].z], i * 3);
    seeds[i] = points[i].seed;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("instanceSeed", new THREE.BufferAttribute(seeds, 1));
  return new THREE.Points(geometry, new THREE.ShaderMaterial({ vertexShader: shader(desc, "meadow.pollen.vertex"), fragmentShader: shader(desc, "meadow.pollen.fragment"), uniforms: uniforms(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
}

export function createSky(uniforms) {
  return new THREE.Mesh(new THREE.SphereGeometry(260, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: uniforms({ uZenith: { value: new THREE.Color(0x6aa1e0) }, uHorizon: { value: new THREE.Color(0xffbb75) } }), vertexShader: `varying vec3 vWorld; void main(){ vec4 w=modelMatrix*vec4(position,1.); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`, fragmentShader: `precision highp float; varying vec3 vWorld; uniform vec3 uZenith; uniform vec3 uHorizon; void main(){ float h=normalize(vWorld).y*.5+.5; vec3 c=mix(uHorizon,uZenith,smoothstep(.12,1.,h)); float sun=smoothstep(.995,1.,dot(normalize(vWorld),normalize(vec3(.38,.88,.22)))); gl_FragColor=vec4(c+vec3(1.,.75,.42)*sun*1.6,1.); }` }));
}

export function installControls(canvas, camera, target) {
  const control = { distance: 31, theta: 0.58, phi: 0.93, dragging: false, x: 0, y: 0, beat: 0, windSeed: 0 };
  function update() {
    const targets = [new THREE.Vector3(-1.5, 2.1, -2.5), new THREE.Vector3(-8, 2.6, -4), new THREE.Vector3(5, 1.6, 9)];
    target.copy(targets[control.beat % targets.length]);
    camera.position.lerp(new THREE.Vector3(target.x + Math.sin(control.theta) * Math.sin(control.phi) * control.distance, target.y + Math.cos(control.phi) * control.distance, target.z + Math.cos(control.theta) * Math.sin(control.phi) * control.distance), 0.16);
    camera.lookAt(target);
  }
  canvas.addEventListener("pointerdown", (event) => { control.dragging = true; control.x = event.clientX; control.y = event.clientY; canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener("pointermove", (event) => { if (!control.dragging) return; const dx = event.clientX - control.x; const dy = event.clientY - control.y; control.x = event.clientX; control.y = event.clientY; control.theta -= dx * 0.006; control.phi = Math.max(0.34, Math.min(1.37, control.phi + dy * 0.004)); });
  canvas.addEventListener("pointerup", () => { control.dragging = false; });
  canvas.addEventListener("wheel", (event) => { event.preventDefault(); control.distance = Math.max(16, Math.min(58, control.distance + event.deltaY * 0.025)); }, { passive: false });
  window.addEventListener("keydown", (event) => { if (event.code === "Space") { control.beat += 1; event.preventDefault(); } if (event.key.toLowerCase() === "r") control.windSeed += 1; });
  return { control, update };
}
