export const REFLECT_PROBE_KIT_VERSION = "0.1.0";

export function createReflectProbeKit(config = {}) {
  return {
    id: "reflect-probe-kit",
    version: REFLECT_PROBE_KIT_VERSION,
    domain: "reflect-probe",
    provides: ["reflect:water", "reflect:scene", "reflect:objects"],
    strength: config.strength ?? 0.44,
    tint: config.tint ?? "#9beeff",
    createDescriptor(scene = {}) {
      const objectCount = (scene.floatProps?.length ?? 0) + (scene.coconuts?.length ?? 0);
      return { id: "water-reflect-descriptor", strength: this.strength, tint: this.tint, reflects: ["island", "palm", "coconut", "float-prop"], objectCount };
    }
  };
}

export default createReflectProbeKit;
