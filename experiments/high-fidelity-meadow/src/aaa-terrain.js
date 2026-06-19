import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { terrainHeight, terrainNormal, pathMask, yardMask } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@76c4a3819248b40ff0003103fbd43b8d6adfd434/protokits/rendering-stack-kits/aaa-countryside-fields.js";

export function createAaaTerrain(desc, shaderSource, uniforms) {
  const segments = Math.min(desc.terrain.segments ?? 192, 212);
  const geometry = new THREE.PlaneGeometry(desc.terrain.width, desc.terrain.depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const colors = [];
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const path = pathMask(x, z);
    const yard = yardMask(x, z);
    const height = terrainHeight(x, z) - path * 0.055 - yard * 0.095;
    const n = terrainNormal(x, z);
    positions.setY(i, height);
    normals.setXYZ(i, n.x, n.y, n.z);
    colors.push(0.28 + yard * 0.08 + path * 0.22, 0.43 - path * 0.08 - yard * 0.04, 0.18 - path * 0.05);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({
    vertexShader: shaderSource("meadow.terrain.vertex").replace("varying vec2 vUv;", "varying vec2 vUv; varying vec3 vColor;").replace("vUv=uv;", "vUv=uv; vColor=color;"),
    fragmentShader: shaderSource("meadow.terrain.fragment").replace("varying vec3 vNormal;", "varying vec3 vNormal; varying vec3 vColor;").replace("vec3 col=mix", "vec3 baseColor=vColor; vec3 col=mix").replace("vec3(.19,.31,.16)", "baseColor*.78"),
    uniforms: uniforms(),
    vertexColors: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

export { terrainHeight, terrainNormal, pathMask, yardMask };
