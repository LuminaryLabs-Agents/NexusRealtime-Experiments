export const FOGLINE_ENVIRONMENT_PRESET_VERSION = "0.0.2";

export const foglineEnvironmentPreset = Object.freeze({
  id: "fogline-dense-forest-v2",
  seed: "fogline-dense-forest-v2",
  terrain: Object.freeze({
    bounds: Object.freeze({ minX: -72, maxX: 72, minZ: -24, maxZ: 112 }),
    groundInset: 0.14,
    maxTreeSlope: 0.72
  }),
  biomes: Object.freeze([
    Object.freeze({ id: "dark-pine", color: "#152318", placementRules: Object.freeze({ density: 1.0, tallRatio: 0.62, fog: 0.75 }) }),
    Object.freeze({ id: "pale-wood", color: "#26312d", placementRules: Object.freeze({ density: 0.72, tallRatio: 0.34, fog: 0.9 }) }),
    Object.freeze({ id: "wet-lowland", color: "#14251f", placementRules: Object.freeze({ density: 0.62, tallRatio: 0.18, fog: 1.0 }) }),
    Object.freeze({ id: "warm-grove", color: "#271719", placementRules: Object.freeze({ density: 0.52, tallRatio: 0.42, fog: 1.15 }) }),
    Object.freeze({ id: "gate-clearing", color: "#203238", placementRules: Object.freeze({ density: 0.32, tallRatio: 0.24, fog: 0.55 }) })
  ]),
  biomeZones: Object.freeze([
    Object.freeze({ biomeId: "dark-pine", center: Object.freeze({ x: -26, z: 12 }), radius: 48, weight: 2.4 }),
    Object.freeze({ biomeId: "pale-wood", center: Object.freeze({ x: 30, z: 28 }), radius: 42, weight: 2.2 }),
    Object.freeze({ biomeId: "wet-lowland", center: Object.freeze({ x: -22, z: 58 }), radius: 44, weight: 2.0 }),
    Object.freeze({ biomeId: "warm-grove", center: Object.freeze({ x: 22, z: 50 }), radius: 36, weight: 2.3 }),
    Object.freeze({ biomeId: "gate-clearing", center: Object.freeze({ x: 0, z: 84 }), radius: 40, weight: 2.6 })
  ]),
  species: Object.freeze([
    Object.freeze({ id: "giant-pine", biomes: Object.freeze({ "dark-pine": 7, "warm-grove": 2 }), scaleRange: Object.freeze([8.5, 14.0]), insetRange: Object.freeze([0.18, 0.58]), crown: "spire", trunkColor: "#0c120d", leafColor: "#182b1d", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "young-pine", biomes: Object.freeze({ "dark-pine": 4, "gate-clearing": 1 }), scaleRange: Object.freeze([2.2, 5.4]), insetRange: Object.freeze([0.08, 0.28]), crown: "spire", trunkColor: "#11170f", leafColor: "#1b3321", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "pale-tree", biomes: Object.freeze({ "pale-wood": 6, "wet-lowland": 2 }), scaleRange: Object.freeze([4.2, 9.2]), insetRange: Object.freeze([0.08, 0.34]), crown: "thin", trunkColor: "#697169", leafColor: "#26352a", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "low-sapling", biomes: Object.freeze({ "wet-lowland": 5, "gate-clearing": 2 }), scaleRange: Object.freeze([1.0, 2.8]), insetRange: Object.freeze([0.04, 0.2]), crown: "round", trunkColor: "#151911", leafColor: "#203d2e", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) }),
    Object.freeze({ id: "bare-column", biomes: Object.freeze({ "warm-grove": 5, "pale-wood": 2 }), scaleRange: Object.freeze([6.0, 12.0]), insetRange: Object.freeze([0.18, 0.5]), crown: "bare", trunkColor: "#24201c", leafColor: "#2b1a1a", lod: Object.freeze({ near: "mesh", mid: "simple", far: "billboard" }) })
  ]),
  placement: Object.freeze({
    targetInstances: 2400,
    routeClearWidth: 4.8,
    routeShoulderWidth: 12.5,
    minSpacing: 1.35,
    gridStep: 2.05,
    jitter: 1.65,
    tiltDegrees: 10,
    farCullDistance: 190
  }),
  lod: Object.freeze({ near: 48, mid: 100, far: 185 })
});
