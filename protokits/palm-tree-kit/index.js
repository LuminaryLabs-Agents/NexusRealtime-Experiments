export const PALM_TREE_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export function createPalmTreeKit(config = {}) {
  const height = toNumber(config.height, 8.4);
  const lean = toNumber(config.lean, -0.22);
  const frondCount = Math.max(6, Math.floor(toNumber(config.frondCount, 10)));
  return {
    id: "palm-tree-kit",
    version: PALM_TREE_KIT_VERSION,
    domain: "palm-tree",
    provides: ["palm:mesh", "palm:fronds", "palm:sockets", "palm:wind-response"],
    createTree(anchor = {}) {
      const base = { x: toNumber(anchor.x, 0), y: toNumber(anchor.y, 0), z: toNumber(anchor.z, 0), yaw: toNumber(anchor.yaw, 0) };
      const trunkSegments = Array.from({ length: 11 }, (_, index) => {
        const t = index / 10;
        return {
          id: `trunk-${index}`,
          center: { x: base.x + lean * t * 1.4, y: base.y + t * height, z: base.z + Math.sin(t * Math.PI) * 0.28 },
          radius: 0.38 - t * 0.16,
          normalBias: { x: lean * 0.08, y: 1, z: 0.04 },
          ring: index
        };
      });
      const crown = trunkSegments.at(-1).center;
      const fronds = Array.from({ length: frondCount }, (_, index) => {
        const angle = base.yaw + index / frondCount * Math.PI * 2;
        const length = 3.2 + (index % 3) * 0.42;
        return {
          id: `frond-${index}`,
          root: clone(crown),
          tip: { x: crown.x + Math.cos(angle) * length, y: crown.y - 0.55 - (index % 2) * 0.22, z: crown.z + Math.sin(angle) * length },
          width: 0.46,
          normal: { x: Math.cos(angle) * 0.32, y: 0.9, z: Math.sin(angle) * 0.32 },
          windPhase: index * 0.61
        };
      });
      const sockets = [0, 1, 2].map((index) => {
        const angle = base.yaw + index * 2.1 + 0.35;
        return { id: `coconut-socket-${index + 1}`, x: crown.x + Math.cos(angle) * 0.55, y: crown.y - 0.42 - index * 0.08, z: crown.z + Math.sin(angle) * 0.55, parent: "palm-tree" };
      });
      return { id: anchor.id ?? "palm-tree-01", base, crown, trunkSegments, fronds, sockets, materials: { trunk: "cel-palm-trunk", frond: "cel-palm-frond" } };
    }
  };
}

export default createPalmTreeKit;
