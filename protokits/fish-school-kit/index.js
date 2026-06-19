export const FISH_SCHOOL_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createFishSchoolKit(config = {}) {
  const count = Math.max(4, Math.floor(toNumber(config.count, 24)));
  const radius = toNumber(config.radius, 28);
  return {
    id: "fish-school-kit",
    version: FISH_SCHOOL_KIT_VERSION,
    domain: "fish-school",
    provides: ["fish:school", "fish:spawn", "fish:lod"],
    createSchool() {
      return Array.from({ length: count }, (_, index) => {
        const angle = index / count * Math.PI * 2;
        const lane = radius * (0.42 + (index % 5) * 0.08);
        return { id: `fish-${index + 1}`, position: { x: Math.cos(angle) * lane, y: -0.35 - (index % 4) * 0.16, z: Math.sin(angle) * lane }, heading: angle + Math.PI / 2, speed: 0.9 + (index % 7) * 0.07, scale: 0.22 + (index % 3) * 0.04, material: index % 3 === 0 ? "cel-fish-gold" : index % 3 === 1 ? "cel-fish-blue" : "cel-fish-silver", lod: index < 12 ? "near" : "mid" };
      });
    }
  };
}

export default createFishSchoolKit;
