export function createVisualSignals(game) {
  const bySource = {};
  for (const relay of game.relays ?? []) {
    bySource[relay.id] = {
      intensity: relay.scanned ? 1.25 : relay.scanProgress > 0 ? 0.8 + relay.scanProgress * 0.8 : 0.42,
      density: relay.scanned ? 0.42 : 0.24,
      color: relay.scanned ? "#bafcff" : "#77f3ff",
      active: true
    };
  }
  bySource[game.gate?.id ?? "gate-01"] = {
    intensity: game.gate?.open ? 1.8 : game.gate?.openProgress ? 0.6 + game.gate.openProgress : 0.12,
    density: game.gate?.open ? 0.34 : 0.14,
    color: "#bafcff",
    active: true
  };
  for (const wraith of game.wraiths ?? []) {
    bySource[wraith.id] = {
      intensity: wraith.mode === "chase" ? 1.1 : 0.45,
      density: 0.22,
      color: "#ff5068",
      active: true
    };
  }
  return { bySource };
}
