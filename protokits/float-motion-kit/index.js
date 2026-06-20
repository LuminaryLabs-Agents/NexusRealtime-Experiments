export const FLOAT_MOTION_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createFloatMotionKit(config = {}) {
  const drift = config.drift ?? { x: 0.02, z: -0.015 };
  return {
    id: "float-motion-kit",
    version: FLOAT_MOTION_KIT_VERSION,
    domain: "float-motion",
    provides: ["float:motion", "float:bobbing", "float:drift"],
    tick(props = [], time = 0, delta = 1 / 60) {
      return props.map((prop, index) => {
        const phase = toNumber(prop.bobPhase, index) + time;
        return {
          ...prop,
          position: {
            x: toNumber(prop.position?.x, 0) + toNumber(drift.x, 0) * delta,
            y: 0.05 + Math.sin(phase * 1.7) * 0.12,
            z: toNumber(prop.position?.z, 0) + toNumber(drift.z, 0) * delta
          },
          rotation: toNumber(prop.rotation, 0) + Math.sin(phase) * 0.002
        };
      });
    }
  };
}

export default createFloatMotionKit;
