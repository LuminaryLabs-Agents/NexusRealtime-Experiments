import {
  createTerrainFieldDomainServiceKit,
  createWindFieldDomainServiceKit,
  createGrassFieldSystemKit,
  createProceduralStructureDomainServiceKit,
  createParticleVfxDomainServiceKit,
  createCreatureDomainServiceKit,
  createCreatureAnimationDomainServiceKit,
  createFurWoolHairDomainServiceKit,
  createSkyAtmosphereDomainServiceKit,
  createHighFidelityMeadowContentKit,
  createMeadowVisualTargetKit,
  createMeadowSimulationModeKit
} from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/high-fidelity-meadow-kits/index.js";

export const MEADOW_EXPERIMENT_SCENE_VERSION = "0.0.2-cutover-20260619";
export const MEADOW_SEED = "high-fidelity-meadow-v0.0.2";

const DEFAULT_PATH = Object.freeze([
  Object.freeze({ x: -11, z: -36 }),
  Object.freeze({ x: -7, z: -24 }),
  Object.freeze({ x: -1.8, z: -12 }),
  Object.freeze({ x: 2.5, z: 2 }),
  Object.freeze({ x: 6.5, z: 18 }),
  Object.freeze({ x: 1.5, z: 34 })
]);

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / Math.max(0.00001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < String(text).length; i += 1) {
    hash = Math.imul(hash ^ String(text).charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed = MEADOW_SEED) {
  let state = hashString(seed) || 1;
  const random = () => {
    state = Math.imul(1664525, state) + 1013904223 >>> 0;
    return state / 4294967296;
  };
  random.range = (min, max) => min + (max - min) * random();
  random.pick = (items) => items[Math.floor(random() * items.length) % items.length];
  return random;
}

const terrainDomain = createTerrainFieldDomainServiceKit(null, {
  seed: MEADOW_SEED,
  amplitude: 1.18,
  frequency: 0.037,
  octaves: 5,
  foundationMasks: [
    { center: { x: 0, z: 0 }, radius: 8.7, height: 0 },
    { center: { x: -2, z: -14 }, radius: 4.2, height: 0.04 }
  ]
});

function pointToSegmentDistance(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = dx * dx + dz * dz || 1;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / len, 0, 1);
  const x = ax + dx * t;
  const z = az + dz * t;
  return Math.hypot(px - x, pz - z);
}

function minPathDistance(x, z, points = DEFAULT_PATH) {
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    best = Math.min(best, pointToSegmentDistance(x, z, a.x, a.z, b.x, b.z));
  }
  return best;
}

export function pathMask(x = 0, z = 0, points = DEFAULT_PATH) {
  return 1 - smoothstep(1.35, 3.25, minPathDistance(x, z, points));
}

export function yardMask(x = 0, z = 0) {
  const front = 1 - smoothstep(5.5, 13.5, Math.hypot(x - 0.8, z + 2.8));
  const cottage = 1 - smoothstep(4.8, 9.4, Math.hypot(x, z));
  return clamp(Math.max(front * 0.82, cottage));
}

export function terrainHeight(x = 0, z = 0) {
  const base = terrainDomain.heightAt(x, z);
  return base - pathMask(x, z) * 0.055 - yardMask(x, z) * 0.095;
}

export function terrainNormal(x = 0, z = 0) {
  const e = 0.45;
  const left = terrainHeight(x - e, z);
  const right = terrainHeight(x + e, z);
  const down = terrainHeight(x, z - e);
  const up = terrainHeight(x, z + e);
  const nx = left - right;
  const ny = e * 2;
  const nz = down - up;
  const length = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / length, y: ny / length, z: nz / length };
}

function rgb(hex) {
  const n = Number.parseInt(String(hex).replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function grassColor(rng, x, z) {
  const path = pathMask(x, z);
  const yard = yardMask(x, z);
  const palette = [rgb("#2d5c2a"), rgb("#5d7f37"), rgb("#a9a24f"), rgb("#d6b65d")];
  const base = palette[Math.min(palette.length - 1, Math.floor(rng() * palette.length))];
  const warm = path * 0.12 + yard * 0.08 + rng.range(-0.035, 0.035);
  return [clamp(base[0] + warm), clamp(base[1] + warm * 0.5), clamp(base[2] + warm * 0.2)];
}

function createGrassBlades({ bladeCount = 34000, radius = 98, seed = MEADOW_SEED } = {}) {
  const rng = createSeededRandom(`${seed}:grass:${bladeCount}:${radius}`);
  const blades = [];
  let attempts = 0;
  while (blades.length < bladeCount && attempts < bladeCount * 5) {
    attempts += 1;
    const angle = rng.range(0, Math.PI * 2);
    const r = Math.sqrt(rng()) * radius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const path = pathMask(x, z);
    const yard = yardMask(x, z);
    const slope = 1 - terrainNormal(x, z).y;
    const reject = path * 0.75 + yard * 0.35 + slope * 0.75;
    if (rng() < reject) continue;
    blades.push({
      x,
      y: terrainHeight(x, z),
      z,
      height: rng.range(0.42, 1.65) * (1 - path * 0.35),
      yaw: rng.range(0, Math.PI * 2),
      phase: rng.range(0, Math.PI * 2),
      bend: rng.range(0.16, 0.82),
      color: grassColor(rng, x, z)
    });
  }
  return blades;
}

function scatterAroundPath({ count, radius, zMin, zMax, seed, kind, yOffset = 0.02 }) {
  const rng = createSeededRandom(`${seed}:${kind}`);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const z = rng.range(zMin, zMax);
    const side = rng() > 0.5 ? 1 : -1;
    const t = clamp((z - zMin) / Math.max(1, zMax - zMin));
    const pathIndex = Math.min(DEFAULT_PATH.length - 2, Math.floor(t * (DEFAULT_PATH.length - 1)));
    const a = DEFAULT_PATH[pathIndex];
    const b = DEFAULT_PATH[pathIndex + 1] ?? a;
    const local = t * (DEFAULT_PATH.length - 1) - pathIndex;
    const centerX = mix(a.x, b.x, clamp(local));
    const x = centerX + side * rng.range(radius * 0.32, radius);
    items.push({ id: `${kind}.${i}`, x, y: terrainHeight(x, z) + yOffset, z, yaw: rng.range(0, Math.PI * 2), scale: rng.range(0.72, 1.45), rng: rng() });
  }
  return items;
}

function createFlowerField({ count = 1800, radius = 96, seed = MEADOW_SEED } = {}) {
  const rng = createSeededRandom(`${seed}:flowers`);
  const colors = [rgb("#f1d46a"), rgb("#e977ad"), rgb("#f4f0cf"), rgb("#d6627c"), rgb("#b6d96b")];
  const flowers = [];
  let attempts = 0;
  while (flowers.length < count && attempts < count * 6) {
    attempts += 1;
    const angle = rng.range(0, Math.PI * 2);
    const r = Math.sqrt(rng()) * radius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const path = pathMask(x, z);
    if (path > 0.7 || yardMask(x, z) > 0.78 || rng() < 0.28) continue;
    flowers.push({
      id: `flower.${flowers.length}`,
      x,
      y: terrainHeight(x, z) + 0.025,
      z,
      stem: rng.range(0.18, 0.54),
      size: rng.range(0.035, 0.105),
      color: rng.pick(colors),
      phase: rng.range(0, Math.PI * 2)
    });
  }
  return { count: flowers.length, flowers };
}

function createCottageDescriptor(structureDomain, content = {}) {
  const structure = structureDomain.createStructureDescriptor(content.cottage ?? { id: "meadow.cottage", position: { x: 0, y: terrainHeight(0, 0), z: 0 } });
  const x = structure.position.x;
  const y = terrainHeight(x, structure.position.z);
  const z = structure.position.z;
  const parts = [
    { id: "cottage.foundation", type: "stone-foundation", transform: { x, y: y + 0.25, z, scale: { x: 7.7, y: 0.5, z: 5.8 } } },
    { id: "cottage.wall-main", type: "plaster-wall", transform: { x, y: y + 1.95, z, scale: { x: 7.1, y: 3.1, z: 5.15 } } },
    { id: "cottage.roof-a", type: "thatch-roof", transform: { x, y: y + 4.15, z: z - 0.06, rotation: { z: 0.18 }, scale: { x: 7.85, y: 0.48, z: 5.95 } } },
    { id: "cottage.roof-ridge", type: "wood-ridge-beam", transform: { x, y: y + 4.58, z, scale: { x: 0.2, y: 0.24, z: 6.15 } } },
    { id: "cottage.chimney", type: "stone-chimney", transform: { x: x + 1.8, y: y + 5.0, z: z - 0.95, scale: { x: 0.65, y: 2.1, z: 0.62 } } },
    { id: "cottage.door", type: "wood-door", transform: { x: x - 1.65, y: y + 1.25, z: z - 2.62, scale: { x: 1.05, y: 2.2, z: 0.16 } } },
    { id: "cottage.window-a", type: "warm-window", transform: { x: x + 1.45, y: y + 2.18, z: z - 2.64, scale: { x: 1.1, y: 0.78, z: 0.13 } } },
    { id: "cottage.window-b", type: "warm-window", transform: { x: x + 3.62, y: y + 2.08, z: z + 0.7, yaw: Math.PI / 2, scale: { x: 0.95, y: 0.72, z: 0.13 } } },
    { id: "cottage.front-beam", type: "wood-beam", transform: { x, y: y + 3.42, z: z - 2.7, scale: { x: 7.35, y: 0.18, z: 0.18 } } }
  ];
  return { ...structure, base: { x, y, z }, parts };
}

function createRocks(seed = MEADOW_SEED) {
  return { rocks: scatterAroundPath({ count: 54, radius: 17, zMin: -42, zMax: 38, seed, kind: "rock" }).map((item, index) => ({ ...item, scale: [item.scale * 0.72, item.scale * 0.28, item.scale * 0.52], id: `rock.${index}` })) };
}

function createFenceAndProps(seed = MEADOW_SEED) {
  const rng = createSeededRandom(`${seed}:fence`);
  const posts = [];
  for (let i = 0; i < 11; i += 1) {
    const x = -9.5 + i * 1.85;
    const z = 7.4 + Math.sin(i * 0.7) * 0.55;
    posts.push({ id: `fence.post.${i}`, x, y: terrainHeight(x, z), z, height: rng.range(0.78, 1.05), radius: 0.065 });
  }
  const rails = [];
  for (let i = 0; i < posts.length - 1; i += 1) {
    rails.push({ id: `fence.rail.${i}`, from: posts[i], to: posts[i + 1], height: 0.55 });
  }
  const props = [
    { id: "prop.trough", kind: "trough", x: 5.7, y: terrainHeight(5.7, 5.6), z: 5.6, yaw: 0.15, scale: 1.2 },
    { id: "prop.crate", kind: "wood-box", x: -4.2, y: terrainHeight(-4.2, -4.8), z: -4.8, yaw: -0.32, scale: 0.8 },
    { id: "prop.barrel", kind: "rain-barrel", x: 3.6, y: terrainHeight(3.6, -2.8), z: -2.8, yaw: 0.1, scale: 0.86 }
  ];
  return { fence: { posts, rails }, props: { props } };
}

function createHedgerows(seed = MEADOW_SEED) {
  const shrubs = scatterAroundPath({ count: 42, radius: 24, zMin: -32, zMax: 44, seed, kind: "hedgerow" }).map((item, index) => ({
    id: `shrub.${index}`,
    x: item.x,
    y: item.y,
    z: item.z,
    scale: item.scale * 0.72,
    height: 1.1 + item.rng * 1.35
  }));
  return { shrubs };
}

function createSheepDescriptor({ creatureDomain, animationDomain, furDomain, creatureMesh }, count = 8, seed = MEADOW_SEED) {
  const herd = creatureDomain.createHerd(count, { minX: -16, maxX: 16, minZ: 8, maxZ: 36 });
  const sheep = herd.map((creature, index) => {
    const x = creature.position.x;
    const z = creature.position.z;
    const y = terrainHeight(x, z);
    const pose = animationDomain.samplePose(creature, index * 0.37);
    const groom = furDomain.createGroomDescriptor(creatureMesh, { id: `${creature.id}.wool`, shellCount: 8, maxLength: 0.18 });
    const shells = furDomain.createShellDescriptors(groom, "near");
    return {
      id: creature.id,
      transform: { x, y, z, yaw: creature.heading + index * 0.62 },
      phase: creature.animation.phase,
      pose,
      woolShells: shells.length,
      parts: [
        { id: `${creature.id}.body`, kind: "ellipsoid", wool: true, offset: [0, 0.72, 0], scale: [1.05, 0.62, 0.72], material: "wool" },
        { id: `${creature.id}.rump`, kind: "ellipsoid", wool: true, offset: [-0.52, 0.72, 0], scale: [0.54, 0.52, 0.62], material: "wool" },
        { id: `${creature.id}.head`, kind: "ellipsoid", wool: false, offset: [0.88, 0.74, 0.02], scale: [0.34, 0.3, 0.28], material: "face" },
        { id: `${creature.id}.ear-l`, kind: "leaf", wool: false, offset: [1.04, 0.94, 0.19], scale: [0.08, 0.18, 0.05], material: "face" },
        { id: `${creature.id}.ear-r`, kind: "leaf", wool: false, offset: [1.04, 0.94, -0.19], scale: [0.08, 0.18, 0.05], material: "face" },
        { id: `${creature.id}.leg-fl`, kind: "leg", wool: false, offset: [0.43, 0.25, 0.31], scale: [0.12, 0.55, 0.12], material: "leg" },
        { id: `${creature.id}.leg-fr`, kind: "leg", wool: false, offset: [0.43, 0.25, -0.31], scale: [0.12, 0.55, 0.12], material: "leg" },
        { id: `${creature.id}.leg-bl`, kind: "leg", wool: false, offset: [-0.43, 0.25, 0.31], scale: [0.12, 0.55, 0.12], material: "leg" },
        { id: `${creature.id}.leg-br`, kind: "leg", wool: false, offset: [-0.43, 0.25, -0.31], scale: [0.12, 0.55, 0.12], material: "leg" }
      ]
    };
  });
  return { count: sheep.length, sheep };
}

function createPollenParticles({ count = 2200, radius = 94, seed = MEADOW_SEED } = {}) {
  const rng = createSeededRandom(`${seed}:pollen:${count}`);
  return {
    particles: Array.from({ length: count }, (_, i) => {
      const angle = rng.range(0, Math.PI * 2);
      const r = Math.sqrt(rng()) * radius;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      return { id: `pollen.${i}`, x, y: terrainHeight(x, z) + rng.range(0.8, 8.5), z, seed: rng() };
    })
  };
}

function createAudioDescriptor() {
  return {
    durationSeconds: 20 * 60,
    mixer: { master: 0.42, music: 0.48, ambience: 0.72, animal: 0.38 },
    scale: { name: "soft countryside pentatonic", frequencies: [196, 220, 247, 294, 330, 392, 440, 494] },
    sections: [
      { id: "dawn grass", start: 0, end: 240, pad: 0.32, pluck: 0.18, birds: 0.62, crickets: 0.04, wind: 0.28 },
      { id: "warm field", start: 240, end: 540, pad: 0.48, pluck: 0.22, birds: 0.42, crickets: 0.08, wind: 0.34 },
      { id: "quiet sheep meadow", start: 540, end: 840, pad: 0.38, pluck: 0.15, birds: 0.24, crickets: 0.18, wind: 0.42 },
      { id: "golden dusk", start: 840, end: 1200, pad: 0.55, pluck: 0.1, birds: 0.12, crickets: 0.55, wind: 0.3 }
    ]
  };
}

function createShaderDescriptors() {
  const terrainVertex = `varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorld; void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal); vec4 w=modelMatrix*vec4(position,1.); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const terrainFragment = `precision highp float; varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorld; uniform vec3 uSun; uniform float uTime; void main(){ float light=dot(normalize(vNormal),normalize(uSun))*.5+.5; float path=smoothstep(.46,.58,vUv.y); vec3 col=mix(vec3(.19,.31,.16),vec3(.54,.49,.22),path*.08); col+=sin((vWorld.x+vWorld.z)*.15+uTime*.08)*.018; col*=.38+light*.88; gl_FragColor=vec4(col,1.); }`;
  const grassVertex = `attribute vec3 instanceOffset; attribute vec4 instanceBlade; attribute vec3 instanceColor; varying vec3 vColor; varying float vTip; uniform float uTime; uniform vec3 uWind; void main(){ float h=instanceBlade.x; float yaw=instanceBlade.y; float phase=instanceBlade.z; float bend=instanceBlade.w; vec3 p=position; vTip=clamp(p.y,0.,1.); float sway=sin(uTime*1.55+phase+instanceOffset.x*.09+instanceOffset.z*.07)*bend; p.x+=sway*vTip*.22+uWind.x*vTip*.055; p.z+=cos(uTime*1.25+phase)*vTip*.1+uWind.z*vTip*.055; mat2 r=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw)); p.xz=r*p.xz; p.y*=h; vColor=instanceColor; gl_Position=projectionMatrix*modelViewMatrix*vec4(p+instanceOffset,1.); }`;
  const grassFragment = `precision highp float; varying vec3 vColor; varying float vTip; uniform vec3 uSun; void main(){ vec3 c=mix(vColor*.48,vColor*1.32,vTip); float alpha=smoothstep(.02,.12,vTip)*(1.-smoothstep(.98,1.,vTip)*.12); gl_FragColor=vec4(c,alpha); }`;
  const cottageFragment = `precision highp float; varying vec3 vNormal; varying vec3 vWorld; uniform vec3 uSun; uniform vec3 uBase; void main(){ float l=dot(normalize(vNormal),normalize(uSun))*.5+.5; float grain=sin(vWorld.x*9.1+vWorld.y*3.2+vWorld.z*5.7)*.04; vec3 c=uBase*(.45+l*.8+grain); gl_FragColor=vec4(c,1.); }`;
  const sheepWoolVertex = `varying vec3 vNormal; varying vec3 vWorld; uniform float uTime; uniform vec3 uWind; void main(){ vNormal=normalize(normalMatrix*normal); vec3 p=position+normal*(sin(position.y*18.+uTime*1.7)*.012+length(uWind.xz)*.012); vec4 w=modelMatrix*vec4(p,1.); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const sheepWoolFragment = `precision highp float; varying vec3 vNormal; varying vec3 vWorld; uniform vec3 uSun; void main(){ float l=dot(normalize(vNormal),normalize(uSun))*.5+.5; float fleece=sin(vWorld.x*31.)*sin(vWorld.y*27.)*sin(vWorld.z*29.)*.05; vec3 c=mix(vec3(.58,.54,.47),vec3(.96,.91,.78),l)+fleece; gl_FragColor=vec4(c,1.); }`;
  const pollenVertex = `attribute float instanceSeed; varying float vSeed; uniform float uTime; uniform vec3 uWind; void main(){ vSeed=instanceSeed; vec3 p=position; p.x+=sin(uTime*.27+instanceSeed*80.)*.55+uWind.x*.22; p.y+=sin(uTime*.41+instanceSeed*20.)*.22; p.z+=cos(uTime*.23+instanceSeed*50.)*.55+uWind.z*.22; gl_PointSize=1.8+instanceSeed*3.5; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`;
  const pollenFragment = `precision highp float; varying float vSeed; void main(){ vec2 p=gl_PointCoord-.5; float d=dot(p,p); if(d>.25) discard; vec3 c=mix(vec3(1.,.82,.32),vec3(.72,1.,.74),vSeed); gl_FragColor=vec4(c,(1.-smoothstep(.02,.25,d))*.58); }`;
  return Object.freeze([
    Object.freeze({ id: "meadow.terrain.vertex", source: terrainVertex }),
    Object.freeze({ id: "meadow.terrain.fragment", source: terrainFragment }),
    Object.freeze({ id: "meadow.grass.vertex", source: grassVertex }),
    Object.freeze({ id: "meadow.grass.fragment", source: grassFragment }),
    Object.freeze({ id: "meadow.cottage.fragment", source: cottageFragment }),
    Object.freeze({ id: "meadow.sheepWool.vertex", source: sheepWoolVertex }),
    Object.freeze({ id: "meadow.sheepWool.fragment", source: sheepWoolFragment }),
    Object.freeze({ id: "meadow.pollen.vertex", source: pollenVertex }),
    Object.freeze({ id: "meadow.pollen.fragment", source: pollenFragment })
  ]);
}

export function createMeadowShaderVfxKit(_N = null, _options = {}) {
  const shaders = createShaderDescriptors();
  return Object.freeze({ listShaders: () => shaders });
}

function sampleCycle(timeSeconds = 0) {
  const duration = 600;
  const t = ((timeSeconds % duration) + duration) % duration / duration;
  const angle = t * Math.PI * 2 - Math.PI * 0.42;
  const sunY = Math.sin(angle);
  const dayAmount = clamp((sunY + 0.12) / 1.05);
  const dusk = 1 - Math.abs(dayAmount - 0.52) * 1.7;
  const warmRim = clamp(dusk);
  const sunDirection = { x: Math.cos(angle) * 0.72, y: Math.max(0.04, sunY), z: 0.24 };
  const length = Math.hypot(sunDirection.x, sunDirection.y, sunDirection.z) || 1;
  sunDirection.x /= length;
  sunDirection.y /= length;
  sunDirection.z /= length;
  const night = 1 - dayAmount;
  const phase = dayAmount > 0.72 ? "day" : dayAmount > 0.38 ? "golden hour" : dayAmount > 0.16 ? "blue dusk" : "moonlit quiet";
  return {
    time: { normalized: t, seconds: timeSeconds, phase },
    light: {
      sunDirection,
      sunIntensity: 0.35 + dayAmount * 4.2 + warmRim * 0.65,
      moonIntensity: night * 0.55,
      dayAmount,
      warmRim
    },
    fog: {
      color: [mix(0.08, 0.62, dayAmount), mix(0.12, 0.72, dayAmount), mix(0.18, 0.66, dayAmount)],
      density: 0.006 + night * 0.012 + warmRim * 0.004
    },
    sky: {
      exposure: 0.72 + dayAmount * 0.56 + warmRim * 0.18,
      zenith: [mix(0.03, 0.36, dayAmount), mix(0.06, 0.6, dayAmount), mix(0.12, 0.88, dayAmount)],
      horizon: [mix(0.09, 1.0, dayAmount), mix(0.08, 0.62, dayAmount + warmRim * 0.2), mix(0.13, 0.32, dayAmount)]
    },
    postprocess: {
      exposure: 0.92 + dayAmount * 0.24,
      saturation: 0.82 + dayAmount * 0.18 + warmRim * 0.16,
      contrast: 1.04 + warmRim * 0.08,
      bloomStrength: 0.08 + warmRim * 0.16 + night * 0.05,
      vignette: 0.14 + night * 0.1,
      grain: 0.014 + night * 0.014,
      colorLift: [warmRim * 0.035, warmRim * 0.018, night * 0.025]
    }
  };
}

export function createExperimentMeadowKit(_N = null, options = {}) {
  const seed = options.seed ?? MEADOW_SEED;
  const contentKit = createHighFidelityMeadowContentKit(null, {
    seed,
    grassDensity: 2.8,
    smokeCapacity: 2048,
    livestockCount: 8,
    timeOfDay: 0.43
  });
  const content = contentKit.getPreset();
  const visualTargetKit = createMeadowVisualTargetKit(null, { seed });
  const modeKit = createMeadowSimulationModeKit(null, content);
  const windDomain = createWindFieldDomainServiceKit(null, { seed: `${seed}:wind`, baseStrength: 1.05, turbulence: 0.3 });
  const grassSystem = createGrassFieldSystemKit(null, { seed: `${seed}:grass`, density: 2.8, maxInstancesPerChunk: 6500, terrain: terrainDomain });
  const structureDomain = createProceduralStructureDomainServiceKit(null, content.cottage);
  const particleDomain = createParticleVfxDomainServiceKit(null, content.smoke);
  const creatureDomain = createCreatureDomainServiceKit(null, { seed: `${seed}:creatures` });
  const animationDomain = createCreatureAnimationDomainServiceKit(null, {});
  const furDomain = createFurWoolHairDomainServiceKit(null, { shellCount: 8 });
  const skyDomain = createSkyAtmosphereDomainServiceKit(null, content.sky);
  const domainScene = modeKit.buildScene();
  const chunk = terrainDomain.createChunkDescriptor(0, 0);
  const grassInstances = grassSystem.generateChunkInstances(chunk, { terrain: terrainDomain, wind: windDomain });
  const particlePool = particleDomain.createParticlePool(content.smoke.capacity);
  const particleEmitter = particleDomain.createEmitter({ position: { x: 1.8, y: 5.9, z: -0.95 }, rate: content.smoke.rate });
  particleDomain.stepPool(particlePool, [particleEmitter], 0.1, { wind: windDomain, time: 0.1 });

  function createSceneDescriptor(request = {}) {
    const visualTarget = visualTargetKit.createTargetDescriptor();
    const width = request.width ?? 196;
    const depth = request.depth ?? 196;
    const terrain = { width, depth, segments: request.segments ?? 204, sampler: "terrain-field-domain-service-kit", chunk };
    const cottage = createCottageDescriptor(structureDomain, content);
    const creatureMesh = domainScene.creatures.mesh;
    const sheep = createSheepDescriptor({ creatureDomain, animationDomain, furDomain, creatureMesh }, content.livestock.count, seed);
    const grassRequest = request.grass ?? {};
    const flowersRequest = request.flowers ?? {};
    const vfxRequest = request.vfx ?? {};
    const hedgerows = createHedgerows(seed);
    const { fence, props } = createFenceAndProps(seed);
    const descriptor = {
      id: `${content.id}.experiment-scene`,
      version: MEADOW_EXPERIMENT_SCENE_VERSION,
      ownership: {
        experimentOwns: ["WebGL host", "Three.js renderer", "scene-specific mesh assembly", "shader source", "20 minute procedural audio arrangement"],
        protoKitsUsed: [
          "terrain-field-domain-service-kit",
          "wind-field-domain-service-kit",
          "grass-field-system-kit",
          "procedural-structure-domain-service-kit",
          "particle-vfx-domain-service-kit",
          "creature-domain-service-kit",
          "creature-animation-domain-service-kit",
          "fur-wool-hair-domain-service-kit",
          "sky-atmosphere-domain-service-kit",
          "meadow-visual-target-kit",
          "meadow-simulation-mode-kit"
        ]
      },
      terrain,
      grass: {
        bladeCount: grassRequest.bladeCount ?? 34000,
        blades: createGrassBlades({ bladeCount: grassRequest.bladeCount ?? 34000, radius: grassRequest.radius ?? 98, seed }),
        domainBatch: grassSystem.createRenderBatchDescriptor(grassInstances),
        memoryBytes: grassInstances.memoryBytes
      },
      cottage,
      sheep,
      flowers: createFlowerField({ count: flowersRequest.count ?? 1800, radius: flowersRequest.radius ?? 96, seed }),
      hedgerows,
      rocks: createRocks(seed),
      fence,
      props,
      vfx: createPollenParticles({ count: vfxRequest.count ?? 2200, radius: vfxRequest.radius ?? 94, seed }),
      sky: skyDomain.getSkyDescriptor(content.sky),
      smoke: { emitter: particleEmitter, batch: particleDomain.createBatchDescriptor(particlePool) },
      visualTarget,
      audio: createAudioDescriptor(),
      diagnostics: {
        ...domainScene.diagnostics,
        domainGrassBytes: grassInstances.memoryBytes,
        smokeCapacity: particlePool.capacity,
        meadowSceneSource: "experiments/high-fidelity-meadow/src/meadow-experiment-scene.js",
        protoKitBranch: "0.0.2"
      }
    };
    return descriptor;
  }

  return Object.freeze({
    content,
    visualTargetKit,
    modeKit,
    createSceneDescriptor,
    sampleCycle,
    getState: () => ({ version: MEADOW_EXPERIMENT_SCENE_VERSION, content, diagnostics: domainScene.diagnostics })
  });
}

export function createMeadowCutoverDiagnostics() {
  const meadowKit = createExperimentMeadowKit(null, { seed: MEADOW_SEED });
  const scene = meadowKit.createSceneDescriptor({ grass: { bladeCount: 256 }, flowers: { count: 64 }, vfx: { count: 32 } });
  const validation = meadowKit.visualTargetKit.validateSceneDescriptor(scene);
  return Object.freeze({
    version: MEADOW_EXPERIMENT_SCENE_VERSION,
    validation,
    grass: scene.grass.bladeCount,
    flowers: scene.flowers.flowers.length,
    sheep: scene.sheep.count,
    protoKitsUsed: scene.ownership.protoKitsUsed.length,
    experimentOwnedRenderer: scene.ownership.experimentOwns.includes("Three.js renderer")
  });
}
