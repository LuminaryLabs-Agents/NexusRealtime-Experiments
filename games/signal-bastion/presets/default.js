export const signalBastionDefaultPreset = Object.freeze({
  level: {
    id: "signal-bastion",
    label: "Signal Bastion",
    width: 960,
    height: 540,
    startingCurrency: 145,
    buildOrder: ["bolt", "ember", "slow"],
    path: [
      { x: 40, y: 318 },
      { x: 178, y: 318 },
      { x: 248, y: 210 },
      { x: 390, y: 210 },
      { x: 492, y: 350 },
      { x: 660, y: 350 },
      { x: 735, y: 250 },
      { x: 918, y: 250 }
    ],
    slots: [
      { id: "slot-a", x: 150, y: 246, tags: ["frontline"] },
      { id: "slot-b", x: 238, y: 386, tags: ["bend"] },
      { id: "slot-c", x: 354, y: 144, tags: ["high-ground"] },
      { id: "slot-d", x: 438, y: 286, tags: ["center"] },
      { id: "slot-e", x: 570, y: 420, tags: ["support"] },
      { id: "slot-f", x: 635, y: 274, tags: ["crossfire"] },
      { id: "slot-g", x: 750, y: 170, tags: ["late"] },
      { id: "slot-h", x: 806, y: 330, tags: ["core"] }
    ],
    vital: { id: "core", label: "Core", x: 914, y: 250, maxHealth: 20 },
    blueprints: {
      bolt: { id: "bolt", label: "Bolt Spire", cost: 45, upgradeCost: 38, maxLevel: 4, range: 126, damage: 22, fireRate: 1.18, projectileSpeed: 390, color: "#8bd3ff", role: "single-target" },
      ember: { id: "ember", label: "Ember Loom", cost: 70, upgradeCost: 52, maxLevel: 3, range: 104, damage: 13, fireRate: 2.45, projectileSpeed: 330, splash: 34, color: "#ffbc6b", role: "splash" },
      slow: { id: "slow", label: "Frost Pin", cost: 55, upgradeCost: 44, maxLevel: 3, range: 116, damage: 9, fireRate: 1.55, projectileSpeed: 350, slow: { amount: 0.42, duration: 1.8 }, color: "#b7f7ff", role: "control" }
    },
    archetypes: {
      runner: { id: "runner", label: "Runner", maxHealth: 58, speed: 58, reward: 6, coreDamage: 1, radius: 9, color: "#84f0a4" },
      skitter: { id: "skitter", label: "Skitter", maxHealth: 34, speed: 90, reward: 4, coreDamage: 1, radius: 7, color: "#d7ff8a" },
      brute: { id: "brute", label: "Brute", maxHealth: 155, speed: 34, reward: 13, coreDamage: 2, radius: 13, color: "#ff9c7a" },
      warden: { id: "warden", label: "Warden", maxHealth: 980, speed: 24, reward: 75, coreDamage: 8, radius: 20, color: "#ffdc6e", boss: true }
    },
    waves: [
      { id: "wave-1", label: "First signal", reward: 24, groups: [{ archetype: "runner", count: 8, cadence: 0.76 }] },
      { id: "wave-2", label: "Dense braid", reward: 32, groups: [{ archetype: "runner", count: 7, cadence: 0.6 }, { archetype: "brute", count: 3, cadence: 1.1, delay: 2.3 }] },
      { id: "wave-3", label: "Glass swarm", reward: 44, groups: [{ archetype: "skitter", count: 14, cadence: 0.42 }, { archetype: "brute", count: 4, cadence: 0.95, delay: 3.0 }] },
      { id: "wave-4", label: "Armored press", reward: 56, groups: [{ archetype: "brute", count: 8, cadence: 0.78 }, { archetype: "runner", count: 10, cadence: 0.38, delay: 4.2 }] },
      { id: "wave-5", label: "Warden", reward: 90, groups: [{ archetype: "warden", count: 1, cadence: 1.0 }, { archetype: "skitter", count: 18, cadence: 0.34, delay: 3.5 }] }
    ]
  },
  presentation: {
    palette: {
      path: "rgba(118,231,255,.25)",
      core: "rgba(255,227,109,.9)",
      buildable: "rgba(102,240,184,.48)"
    }
  }
});

export default signalBastionDefaultPreset;
