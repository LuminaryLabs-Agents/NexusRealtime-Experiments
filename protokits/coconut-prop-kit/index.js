export const COCONUT_PROP_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export function createCoconutPropKit(config = {}) {
  const count = Math.max(1, Math.floor(toNumber(config.count, 3)));
  return {
    id: "coconut-prop-kit",
    version: COCONUT_PROP_KIT_VERSION,
    domain: "coconut-prop",
    provides: ["coconut:props", "coconut:mesh", "coconut:material", "coconut:sockets"],
    createCoconuts(sockets = [], options = {}) {
      const source = sockets.length ? sockets : options.anchors ?? [];
      return Array.from({ length: count }, (_, index) => {
        const socket = source[index % Math.max(1, source.length)] ?? { x: index * 0.7, y: 0.5, z: 0 };
        return {
          id: `coconut-${index + 1}`,
          state: index < 2 ? "attached" : "resting",
          socketId: socket.id ?? null,
          position: { x: toNumber(socket.x, 0), y: toNumber(socket.y, 0), z: toNumber(socket.z, 0) },
          radius: 0.28 + index * 0.015,
          material: "cel-coconut-husk",
          normalPolicy: "faceted-round",
          roughness: 0.72,
          fallOrder: index
        };
      });
    },
    createMaterial() {
      return { id: "cel-coconut-husk", base: "#7a4a21", shadow: "#3b2112", highlight: "#b87736", normalStrength: 0.58, outline: true };
    }
  };
}

export default createCoconutPropKit;
