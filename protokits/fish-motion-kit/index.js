export const FISH_MOTION_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createFishMotionKit(config = {}) {
  const orbitRadius = toNumber(config.orbitRadius, 26);
  return {
    id: "fish-motion-kit",
    version: FISH_MOTION_KIT_VERSION,
    domain: "fish-motion",
    provides: ["fish:motion", "fish:swim", "fish:schooling"],
    tick(fish = [], time = 0, delta = 1 / 60) {
      return fish.map((entry, index) => {
        const heading = toNumber(entry.heading, 0) + toNumber(entry.speed, 1) * delta * 0.18;
        const radius = orbitRadius * (0.58 + (index % 6) * 0.055);
        const wave = Math.sin(time * 1.7 + index * 0.73);
        return {
          ...entry,
          heading,
          tailPhase: time * 8 + index,
          position: {
            x: Math.cos(heading) * radius + wave * 0.6,
            y: toNumber(entry.position?.y, -0.5) + Math.sin(time * 1.2 + index) * 0.01,
            z: Math.sin(heading) * radius + Math.cos(time * 1.1 + index) * 0.45
          }
        };
      });
    }
  };
}

export default createFishMotionKit;
