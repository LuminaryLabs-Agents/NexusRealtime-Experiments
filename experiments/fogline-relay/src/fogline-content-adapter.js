import { foglineEnvironmentPreset } from "./fogline-environment-preset.js";

function hashString(value = "seed") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed = "seed") {
  let state = hashString(seed) || 1;
  return function random() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rangeValue(range, random) {
  const min = Number(range?.[0] ?? 1);
  const max = Number(range?.[1] ?? min);
  return min + (max - min) * random();
}

function distanceToSegment(point, a, b) {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const apx = point.x - a.x;
  const apz = point.z - a.z;
  const denom = abx * abx + abz * abz || 1;
  const t = clamp((apx * abx + apz * abz) / denom, 0, 1);
  const x = a.x + abx * t;
  const z = a.z + abz * t;
  return Math.hypot(point.x - x, point.z - z);
}

function distanceToRoute(point, route = []) {
  let best = Infinity;
  for (let i = 0; i < route.length - 1; i += 1) best = Math.min(best, distanceToSegment(point, route[i], route[i + 1]));
  return best;
}

function biomeAt(preset, x, z) {
  let best = preset.biomes[0];
  let score = -Infinity;
  for (const zone of preset.biomeZones) {
    const dx = x - zone.center.x;
    const dz = z - zone.center.z;
    const influence = clamp(1 - Math.hypot(dx, dz) / zone.radius, 0, 1) * zone.weight;
    if (influence > score) {
      score = influence;
      best = preset.biomes.find((biome) => biome.id === zone.biomeId) ?? best;
    }
  }
  return best;
}

function pickSpecies(preset, biomeId, random) {
  const candidates = preset.species.map((species) => ({ species, weight: Number(species.biomes?.[biomeId] ?? 0) })).filter((entry) => entry.weight > 0);
  const total = candidates.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  let cursor = random() * total;
  for (const entry of candidates) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.species;
  }
  return candidates[0]?.species ?? preset.species[0];
}

function terrainHeight(x, z) {
  return Math.sin(x * 0.08) * 0.22 + Math.cos(z * 0.06) * 0.18 + Math.sin((x + z) * 0.035) * 0.28;
}

function terrainNormal(x, z) {
  const e = 0.6;
  const hL = terrainHeight(x - e, z);
  const hR = terrainHeight(x + e, z);
  const hD = terrainHeight(x, z - e);
  const hU = terrainHeight(x, z + e);
  const nx = hL - hR;
  const ny = 2 * e;
  const nz = hD - hU;
  const len = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

function lodForDistance(distance, lod) {
  if (distance < lod.near) return "near";
  if (distance < lod.mid) return "mid";
  if (distance < lod.far) return "far";
  return "culled";
}

export function createFoglineEnvironmentContent(level, options = {}) {
  const preset = options.preset ?? foglineEnvironmentPreset;
  const random = createRandom(options.seed ?? preset.seed);
  const route = level.route ?? [];
  const bounds = preset.terrain.bounds;
  const instances = [];
  const gridStep = preset.placement.gridStep;
  const jitter = preset.placement.jitter;

  for (let z = bounds.minZ; z <= bounds.maxZ; z += gridStep) {
    for (let x = bounds.minX; x <= bounds.maxX; x += gridStep) {
      if (instances.length >= preset.placement.targetInstances) break;
      const point = { x: x + (random() - 0.5) * jitter, z: z + (random() - 0.5) * jitter };
      const routeDistance = distanceToRoute(point, route);
      if (routeDistance < preset.placement.routeClearWidth) continue;
      const biome = biomeAt(preset, point.x, point.z);
      const density = Number(biome.placementRules?.density ?? 0.5);
      const shoulderBonus = routeDistance < preset.placement.routeShoulderWidth ? 0.22 : 0;
      if (random() > density + shoulderBonus) continue;
      const species = pickSpecies(preset, biome.id, random);
      const scale = rangeValue(species.scaleRange, random);
      const inset = rangeValue(species.insetRange, random);
      const y = terrainHeight(point.x, point.z) - inset;
      const normal = terrainNormal(point.x, point.z);
      const distanceFromOrigin = Math.hypot(point.x, point.z);
      const lod = lodForDistance(distanceFromOrigin, preset.lod);
      instances.push(Object.freeze({
        id: `veg-${instances.length}`,
        kind: "tree",
        speciesId: species.id,
        biomeId: biome.id,
        crown: species.crown,
        trunkColor: species.trunkColor,
        leafColor: species.leafColor,
        scale,
        inset,
        lod,
        position: Object.freeze({ x: point.x, y, z: point.z }),
        normal: Object.freeze(normal),
        rotation: random() * Math.PI * 2
      }));
    }
  }

  return Object.freeze({
    preset,
    terrain: Object.freeze({ ...preset.terrain, heightAt: terrainHeight, normalAt: terrainNormal }),
    biomes: preset.biomes,
    vegetation: Object.freeze(instances)
  });
}
