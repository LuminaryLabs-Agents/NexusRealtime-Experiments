export const CEL_SHADING_KIT_VERSION = "0.1.0";

export function createCelShadingKit(config = {}) {
  const ramps = config.ramps ?? {
    sand: ["#7b5627", "#d8a44c", "#ffe5a1"],
    grass: ["#1c5228", "#4ea64b", "#b4ec7f"],
    water: ["#062a50", "#168bc0", "#aaf7ff"],
    palm: ["#164622", "#3e9c45", "#a4e66c"],
    trunk: ["#3b2315", "#875227", "#d28c48"]
  };
  return {
    id: "cel-shading-kit",
    version: CEL_SHADING_KIT_VERSION,
    domain: "cel-shading",
    provides: ["cel:ramps", "cel:bands", "cel:rim", "cel:specular"],
    ramps,
    thresholds: config.thresholds ?? [0.35, 0.68, 0.92],
    describeMaterial(id, rampId = id) {
      return { id, ramp: ramps[rampId] ?? ramps.sand, thresholds: this.thresholds, rim: 0.18, specBand: 0.72 };
    },
    shaderDefines() {
      return { CEL_BANDS: this.thresholds.length, CEL_RIM: true, NORMAL_WEIGHTED: true };
    }
  };
}

export default createCelShadingKit;
