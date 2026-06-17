import {
  signalBastionMaps,
  signalBastionTowers,
  signalBastionEnemies,
  signalBastionWaves,
  signalBastionRewards,
  signalBastionCampaign
} from "./content.js";

const map = signalBastionMaps.frostCanal;

function scaleEnemy(enemy) {
  return {
    ...enemy,
    maxHealth: Math.round(enemy.maxHealth * 1.28),
    reward: Math.max(1, Math.round(enemy.reward * 1.08)),
    speed: Math.round(enemy.speed * 1.06)
  };
}

function scaleWave(wave, index) {
  return {
    ...wave,
    reward: Math.round(wave.reward * 1.1),
    groups: wave.groups.map((group) => ({
      ...group,
      count: Math.ceil(group.count * (1.08 + index * 0.006)),
      cadence: Math.max(0.1, Number((group.cadence * 0.9).toFixed(3)))
    }))
  };
}

export const signalBastionHardPreset = Object.freeze({
  mode: "hard",
  campaign: signalBastionCampaign,
  rewards: signalBastionRewards,
  level: {
    id: "signal-bastion-hard",
    label: "Signal Bastion: Frost Canal",
    width: 960,
    height: 540,
    startingCurrency: 155,
    buildOrder: Object.keys(signalBastionTowers),
    path: map.path,
    slots: map.slots,
    vital: { ...map.vital, maxHealth: 18 },
    blueprints: signalBastionTowers,
    archetypes: Object.fromEntries(Object.entries(signalBastionEnemies).map(([id, enemy]) => [id, scaleEnemy(enemy)])),
    waves: signalBastionWaves.map(scaleWave)
  },
  presentation: {
    mapId: map.id,
    mapLabel: map.label,
    palette: {
      path: "rgba(154,225,255,.22)",
      core: "rgba(183,247,255,.9)",
      buildable: "rgba(102,240,184,.42)",
      warning: "rgba(255,139,123,.92)"
    }
  }
});

export default signalBastionHardPreset;
