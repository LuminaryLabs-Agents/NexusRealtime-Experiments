export const FLOAT_PROP_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createFloatPropKit(config = {}) {
  const count = Math.max(3, Math.floor(toNumber(config.count, 6)));
  const types = config.types ?? ["wood", "marker", "box"];
  return {
    id: "float-prop-kit",
    version: FLOAT_PROP_KIT_VERSION,
    domain: "float-prop",
    provides: ["float:props", "float:reflection", "float:materials"],
    createProps(radius = 32) {
      return Array.from({ length: count }, (_, index) => {
        const angle = index / count * Math.PI * 2 + 0.4;
        const distance = radius * (0.86 + (index % 3) * 0.18);
        const type = types[index % types.length];
        return { id: `float-prop-${index + 1}`, type, position: { x: Math.cos(angle) * distance, y: 0.05, z: Math.sin(angle) * distance }, rotation: angle, scale: type === "marker" ? 0.85 : 1.15, material: `cel-${type}`, reflective: true, bobPhase: index * 0.77 };
      });
    }
  };
}

export default createFloatPropKit;
