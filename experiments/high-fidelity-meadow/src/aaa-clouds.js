import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

function rand(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createHighCloudDeck({ radius = 235, y = 76, count = 18 } = {}) {
  const random = rand(26062026);
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xf4ead7, transparent: true, opacity: 0.28, depthWrite: false });
  const shadow = new THREE.MeshBasicMaterial({ color: 0xd5b8ac, transparent: true, opacity: 0.12, depthWrite: false });
  const geo = new THREE.SphereGeometry(1, 12, 8);
  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI * 0.9 + random() * Math.PI * 1.8;
    const distance = radius * (0.74 + random() * 0.36);
    const cloud = new THREE.Group();
    cloud.position.set(Math.cos(angle) * distance, y + random() * 22, Math.sin(angle) * distance - 70 - random() * 80);
    cloud.rotation.y = angle + Math.PI * 0.5;
    const puffs = 5 + Math.floor(random() * 5);
    for (let j = 0; j < puffs; j += 1) {
      const mesh = new THREE.Mesh(geo, j % 3 === 0 ? shadow : material);
      mesh.position.set((j - puffs * 0.5) * (4.2 + random() * 3.2), random() * 3, random() * 5 - 2.5);
      mesh.scale.set(10 + random() * 18, 2.0 + random() * 4.8, 4.0 + random() * 11);
      cloud.add(mesh);
    }
    group.add(cloud);
  }
  group.renderOrder = -20;
  group.userData = { kind: "high-distant-cloud-deck", y, radius, count };
  return group;
}

export function animateHighCloudDeck(group, time) {
  let index = 0;
  for (const child of group.children) {
    child.position.x += Math.sin(time * 0.012 + index) * 0.002;
    child.position.z += Math.cos(time * 0.009 + index * 0.7) * 0.002;
    index += 1;
  }
}
