export const ISLAND_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function sampleHeightAt(x, z, config = {}) {
  const radius = toNumber(config.radius, 18);
  const mound = toNumber(config.moundHeight, 3.8);
  const distance = Math.hypot(x, z);
  const normalized = Math.max(0, Math.min(1, distance / radius));
  const beach = Math.max(0, 1 - Math.abs(normalized - 0.82) * 8);
  const hill = Math.pow(Math.max(0, 1 - normalized), 1.8) * mound;
  const undulation = Math.sin(x * 0.38 + z * 0.17) * 0.18 + Math.cos(z * 0.31) * 0.1;
  return hill + beach * 0.18 + undulation * (1 - normalized);
}

function normalAt(x, z, config = {}) {
  const step = 0.35;
  const hL = sampleHeightAt(x - step, z, config);
  const hR = sampleHeightAt(x + step, z, config);
  const hD = sampleHeightAt(x, z - step, config);
  const hU = sampleHeightAt(x, z + step, config);
  const nx = hL - hR;
  const ny = step * 2;
  const nz = hD - hU;
  const length = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / length, y: ny / length, z: nz / length };
}

export function createIslandKit(config = {}) {
  const radius = toNumber(config.radius, 18);
  const beachWidth = toNumber(config.beachWidth, 4.2);
  const palmAnchor = clone(config.palmAnchor ?? { id: "palm-anchor-01", x: -2.4, y: sampleHeightAt(-2.4, 1.5, config), z: 1.5, yaw: -0.22 });
  const shoreline = Array.from({ length: 48 }, (_, index) => {
    const angle = index / 48 * Math.PI * 2;
    return { id: `shore-${index}`, x: Math.cos(angle) * radius, y: 0, z: Math.sin(angle) * radius, normal: { x: Math.cos(angle), y: 0, z: Math.sin(angle) } };
  });
  return {
    id: "island-kit",
    version: ISLAND_KIT_VERSION,
    domain: "island",
    provides: ["island:terrain", "island:anchors", "island:shoreline"],
    config: { radius, beachWidth, moundHeight: toNumber(config.moundHeight, 3.8) },
    sampleHeight: (x = 0, z = 0) => sampleHeightAt(x, z, { ...config, radius }),
    sampleNormal: (x = 0, z = 0) => normalAt(x, z, { ...config, radius }),
    createScene() {
      return {
        radius,
        beachWidth,
        anchors: {
          palm: palmAnchor,
          coconuts: [
            { id: "coconut-ground-01", x: -1.2, y: sampleHeightAt(-1.2, 3.1, config) + 0.25, z: 3.1 },
            { id: "coconut-ground-02", x: 0.8, y: sampleHeightAt(0.8, 2.4, config) + 0.25, z: 2.4 },
            { id: "coconut-ground-03", x: -3.2, y: sampleHeightAt(-3.2, 2.0, config) + 0.25, z: 2.0 }
          ]
        },
        shoreline,
        terrain: {
          rings: [
            { id: "shore-wet-sand", radius, material: "wet-sand" },
            { id: "dry-beach", radius: radius - beachWidth, material: "dry-sand" },
            { id: "inner-grass", radius: radius - beachWidth * 1.8, material: "island-grass" }
          ]
        }
      };
    }
  };
}

export default createIslandKit;
