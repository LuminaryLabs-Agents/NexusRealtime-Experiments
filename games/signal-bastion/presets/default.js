import {
  signalBastionMaps,
  signalBastionTowers,
  signalBastionEnemies,
  signalBastionWaves,
  signalBastionRewards,
  signalBastionCampaign
} from "./content.js";

const map = signalBastionMaps.emberCauseway;

export const signalBastionDefaultPreset = Object.freeze({
  mode: "default",
  campaign: signalBastionCampaign,
  rewards: signalBastionRewards,
  level: {
    id: "signal-bastion",
    label: "Signal Bastion",
    width: 960,
    height: 540,
    startingCurrency: 185,
    buildOrder: Object.keys(signalBastionTowers),
    path: map.path,
    slots: map.slots,
    vital: map.vital,
    blueprints: signalBastionTowers,
    archetypes: signalBastionEnemies,
    waves: signalBastionWaves
  },
  presentation: {
    mapId: map.id,
    mapLabel: map.label,
    palette: {
      path: "rgba(118,231,255,.25)",
      core: "rgba(255,227,109,.9)",
      buildable: "rgba(102,240,184,.48)",
      warning: "rgba(255,139,123,.86)"
    }
  }
});

export default signalBastionDefaultPreset;
