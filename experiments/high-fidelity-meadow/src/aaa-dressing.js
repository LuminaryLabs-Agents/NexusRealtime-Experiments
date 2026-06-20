import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createAaaDressing(desc) {
  const group = new THREE.Group();
  const mats = {
    leaf: new THREE.MeshStandardMaterial({ color: 0x25491d, roughness: 0.92 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x756d60, roughness: 0.94 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x4a2d17, roughness: 0.86 }),
    stem: new THREE.MeshStandardMaterial({ color: 0x315f22, roughness: 0.85 }),
    prop: new THREE.MeshStandardMaterial({ color: 0x6a4a2c, roughness: 0.86 }),
    path: new THREE.MeshStandardMaterial({ color: 0xc08a55, roughness: 0.95, transparent: true, opacity: 0.34 }),
    silhouette: new THREE.MeshStandardMaterial({ color: 0x172016, roughness: 0.86 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: 0.9 })
  };
  const target = desc.visualTarget;
  for (const point of target?.path?.points ?? []) {
    const marker = new THREE.Mesh(new THREE.CircleGeometry(1.25, 18), mats.path);
    marker.position.set(point.x, (point.y ?? 0) + 0.018, point.z);
    marker.rotation.x = -Math.PI / 2;
    marker.scale.x = 1.65;
    marker.receiveShadow = true;
    group.add(marker);
  }
  const silhouette = target?.focus?.playerSilhouette;
  if (silhouette) {
    const actor = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, silhouette.height * 0.55, 4, 8), mats.silhouette);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mats.silhouette);
    body.position.y = silhouette.height * 0.48;
    head.position.y = silhouette.height * 0.94;
    actor.add(body, head);
    actor.position.set(silhouette.x, silhouette.y ?? 0, silhouette.z);
    actor.rotation.y = 0.28;
    actor.castShadow = true;
    group.add(actor);
  }
  for (const tree of target?.treeLine?.trees ?? []) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, tree.height * 0.42, 7), mats.trunk);
    trunk.position.set(tree.x, tree.y + tree.height * 0.21, tree.z);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(tree.crownRadius, tree.height * 0.68, 9), mats.leaf);
    crown.position.set(tree.x, tree.y + tree.height * 0.68, tree.z);
    trunk.castShadow = crown.castShadow = true;
    group.add(trunk, crown);
  }
  for (const f of desc.flowers?.flowers ?? []) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, f.stem, 5), mats.stem);
    stem.position.set(f.x, f.y + f.stem * 0.5, f.z);
    group.add(stem);
    const head = new THREE.Mesh(new THREE.SphereGeometry(f.size, 8, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(...f.color), roughness: 0.72 }));
    head.position.set(f.x, f.y + f.stem, f.z);
    head.scale.y = 0.42;
    group.add(head);
  }
  for (const shrub of desc.hedgerows?.shrubs ?? []) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mats.leaf);
    mesh.position.set(shrub.x, shrub.y + shrub.height * 0.6, shrub.z);
    mesh.scale.set(shrub.scale, shrub.height * 0.34, shrub.scale * 0.9);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  }
  for (const rock of desc.rocks?.rocks ?? []) {
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), mats.rock);
    mesh.position.set(rock.x, rock.y + 0.18, rock.z);
    mesh.rotation.set(0.2, rock.yaw, 0.1);
    mesh.scale.set(...rock.scale);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  }
  for (const post of desc.fence?.posts ?? []) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(post.radius, post.radius * 1.2, post.height, 6), mats.wood);
    mesh.position.set(post.x, post.y + post.height * 0.5, post.z);
    mesh.castShadow = true;
    group.add(mesh);
  }
  for (const rail of desc.fence?.rails ?? []) {
    const fromY = rail.from.y ?? 0;
    const toY = rail.to.y ?? 0;
    const length = Math.hypot(rail.to.x - rail.from.x, rail.to.z - rail.from.z);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, 0.08), mats.wood);
    mesh.position.set((rail.from.x + rail.to.x) * 0.5, (fromY + toY) * 0.5 + rail.height, (rail.from.z + rail.to.z) * 0.5);
    mesh.rotation.y = -Math.atan2(rail.to.z - rail.from.z, rail.to.x - rail.from.x);
    mesh.castShadow = true;
    group.add(mesh);
  }
  for (const prop of desc.props?.props ?? []) {
    const box = prop.kind.includes("trough") || prop.kind.includes("box");
    const geometry = box ? new THREE.BoxGeometry(1.6, 0.45, 0.52) : new THREE.CylinderGeometry(0.32, 0.38, 0.78, 8);
    const mesh = new THREE.Mesh(geometry, mats.prop);
    mesh.position.set(prop.x, prop.y + 0.4 * prop.scale, prop.z);
    mesh.rotation.y = prop.yaw;
    mesh.scale.setScalar(prop.scale);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}
