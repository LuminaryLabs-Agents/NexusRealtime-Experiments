export const CONTENT = Object.freeze({
  id: "zombie-orchard",
  title: "Zombie Orchard",
  bounds: { minX: -39, maxX: 39, minZ: -54, maxZ: 54 },
  player: { spawn: { x: 0, y: 0, z: 37 }, collectRadius: 2.8, pickupRadius: 3.2, touchRadius: 1.65, baseRange: 3.8 },
  procedural: { id: "orchard-route-space", seed: "orchard-routes", width: 56, height: 76, cellSize: 1.75, roomCount: 10, obstacleDensity: 0.04 },
  navigation: { id: "orchard-walkability", cellSize: 2, margin: 10, treePadding: 1.25, barnPadding: 1.8 },
  orchardBiome: { seed: "zombie-orchard-v1", seasonalVariant: "late-autumn", width: 76, depth: 104, rowCount: 11, treesPerRow: 19, targetActiveApples: 30, hauntingShiftSeconds: 13, appleReplenishSeconds: 4.5 },
  survivalRounds: { autoStart: true, initialBreathingSeconds: 1.2, breathingSeconds: 6, baseDurationSeconds: 42, durationGrowthSeconds: 6, baseSpawnBudget: 12, spawnBudgetGrowth: 8, baseEnemyCap: 7, enemyCapGrowth: 2, maxEnemyCap: 34, baseIntensity: 0.48, intensityGrowth: 0.16, eliteEvery: 3, bossEvery: 5 },
  hordeDirector: { initialSpawnCooldown: 0.65, minSpawnIntervalSeconds: 0.42, maxSpawnIntervalSeconds: 3.1, maxSpawnPerTick: 3, offscreenDistance: 20, criticalSpawnDistance: 24, nearMissPressure: 0.68 },
  foundWeapons: { inventoryLimit: 3, pickups: [
    { id: "pickup-branch", weaponId: "orchard-branch", position: { x: 0, z: 31 }, replacementSeconds: 14 },
    { id: "pickup-shovel", weaponId: "rusty-shovel", position: { x: 18, z: 18 }, replacementSeconds: 22 },
    { id: "pickup-pitchfork", weaponId: "pitchfork", position: { x: -16, z: 4 }, replacementSeconds: 26 },
    { id: "pickup-hatchet", weaponId: "hatchet", position: { x: -23, z: -37 }, replacementSeconds: 34 }
  ] },
  objectiveFlow: { id: "zombie-orchard-objectives", steps: [{ id: "apples", requiredAction: "collect-apple", target: 3 }, { id: "gear", requiredAction: "pick-weapon", target: 2 }, { id: "survive", requiredAction: "defeat-monster", target: 10 }, { id: "keeper", requiredAction: "boss-warning", target: 1 }], completion: { collectibleId: "orchard-survivor-sigil" } },
  collectibles: { id: "zombie-orchard-collection", storageKey: "zombie-orchard.collectibles.v1", rewards: [{ id: "orchard-survivor-sigil", label: "Orchard Survivor Sigil" }] },
  renderDescriptors: { id: "zombie-orchard-render-descriptors", visualDataset: { palette: { ground: "#111608", danger: "#ff3e57" } } },
  realism: { preset: "late-autumn-orchard", quality: "adaptive", systems: { atmosphere: true, vegetation: true, shadows: true, post: true } }
});
export const APPLE_EFFECTS = Object.freeze({
  "red-apple": { score: 10, heal: 0, stamina: 0.04, bias: 0, label: "+10" },
  "golden-apple": { score: 75, heal: 0.32, stamina: 0.16, bias: -0.08, label: "heal" },
  "moon-apple": { score: 50, heal: 0.08, stamina: 0.2, bias: -0.18, label: "moon veil" },
  "glass-apple": { score: 40, heal: 0.12, stamina: 0, bias: -0.05, label: "shield" },
  "cider-apple": { score: 30, heal: 0.04, stamina: 0.42, bias: -0.04, label: "stamina" },
  "black-apple": { score: 250, heal: 0.18, stamina: 0.18, bias: 0.18, label: "curse" }
});
export const appleEffect = (id) => APPLE_EFFECTS[id] ?? APPLE_EFFECTS["red-apple"];
export function equippedLabel(state) { const w = (state?.inventory ?? []).find((x) => x.instanceId === state?.equippedId); return w ? `${w.label}${w.ammo == null ? "" : ` · ${w.ammo}`}${w.durability == null ? "" : ` · ${Math.ceil(w.durability)} uses`}` : "empty hands"; }
export function weaponRange(w, fallback = CONTENT.player.baseRange) { if (!w) return fallback * 0.7; if (w.kind === "ranged") return 12; if (w.tags?.includes("reach")) return 5.4; return fallback; }
