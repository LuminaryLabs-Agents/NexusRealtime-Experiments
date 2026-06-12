const q = (id) => document.querySelector(id);
const pct = (v) => Math.round(Math.max(0, Math.min(1, Number(v) || 0)) * 100) + "%";
export function createHud() {
  const ui = Object.fromEntries(["round", "score", "apples", "weapon", "health", "stamina", "pressure", "message"].map((id) => [id, q(`#${id}`)]));
  return (s = {}) => {
    ui.round.textContent = s.round?.status === "active" ? String(s.round.round) : String(s.round?.status ?? "idle");
    ui.score.textContent = String(Math.round(s.score ?? 0));
    ui.apples.textContent = String(s.appleCount ?? 0);
    ui.weapon.textContent = s.weaponLabel ?? "empty";
    ui.health.textContent = pct(s.health01);
    ui.stamina.textContent = pct(s.stamina01);
    ui.pressure.textContent = pct(s.horde?.pressure ?? 0);
    ui.message.textContent = s.message || (s.nearestApple ? "Press E for " + s.nearestApple.label : s.nearestWeapon ? "Press E to pick up gear" : "Survive the orchard.");
  };
}
