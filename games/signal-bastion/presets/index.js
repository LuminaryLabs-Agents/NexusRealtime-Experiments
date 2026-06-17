import signalBastionDefaultPreset from "./default.js";
import signalBastionHardPreset from "./hard.js";
import signalBastionEndlessPreset from "./endless.js";
import signalBastionDebugPreset from "./debug.js";

export const signalBastionPresets = Object.freeze({
  default: signalBastionDefaultPreset,
  hard: signalBastionHardPreset,
  endless: signalBastionEndlessPreset,
  debug: signalBastionDebugPreset
});

export function resolveSignalBastionPreset(search = "") {
  const params = new URLSearchParams(String(search).startsWith("?") ? String(search).slice(1) : search);
  const id = params.get("preset") || params.get("mode") || "default";
  return signalBastionPresets[id] ?? signalBastionDefaultPreset;
}

export default signalBastionDefaultPreset;
