const COMBAT_STYLE = "direct-dice-ap-lockout-controller";
const TAU = Math.PI * 2;
const DICE_TIMING = Object.freeze({ landAt: 1500, holdFor: 3000, fadeFor: 900 });
const MANEUVERS = Object.freeze([
  { id: "attack", label: "Attack", cost: 1, kind: "attack" },
  { id: "advanceLeft", label: "Advance Left", cost: 1, kind: "advance", section: "left" },
  { id: "advanceCenter", label: "Advance Center", cost: 1, kind: "advance", section: "center" },
  { id: "advanceRight", label: "Advance Right", cost: 1, kind: "advance", section: "right" },
  { id: "lineBrigade", label: "Line Brigade", cost: 2, kind: "lineBrigade" },
  { id: "heavyBrigade", label: "Heavy Brigade", cost: 3, kind: "heavyBrigade" },
  { id: "berserk", label: "Berserk", cost: 4, kind: "berserk" },
  { id: "scout", label: "Scout", cost: 4, kind: "scout" }
]);
const MANEUVER_BY_ID = new Map(MANEUVERS.map((m) => [m.id, m]));
const KEY_TO_MANEUVER = Object.freeze({ "1": "advanceLeft", "2": "advanceCenter", "3": "advanceRight", "4": "lineBrigade", "5": "heavyBrigade", "6": "berserk", "7": "scout", "8": "attack" });

const state = {
  turn: 1,
  side: "player",
  actionPoints: 0,
  canRollActionPoints: true,
  activeManeuver: null,
  phase: "idle",
  gameOver: null,
  dice: { rolls: [], reason: "", startedAt: 0, landAt: DICE_TIMING.landAt, holdUntil: DICE_TIMING.landAt + DICE_TIMING.holdFor, fadeUntil: DICE_TIMING.landAt + DICE_TIMING.holdFor + DICE_TIMING.fadeFor, active: false }
};

let canvas = null;
let ctx = null;
let originalStartManeuver = null;
let originalPassTurn = null;
let originalConcedeBattle = null;
let originalGetSnapshot = null;
let patchAttempts = 0;

const clamp = (v, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(v)) ? Number(v) : min));
function randomUint32() { if (globalThis.crypto?.getRandomValues) { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0]; } return Math.floor(Math.random() * 0x100000000); }
function rollDie() { const range = 0x100000000; const limit = range - (range % 6); let value = randomUint32(); while (value >= limit) value = randomUint32(); return (value % 6) + 1; }
function roll2d6() { return [rollDie(), rollDie()]; }
function sum(faces) { return faces.reduce((a, b) => a + b, 0); }
function showDice(rolls, reason) { const landAt = DICE_TIMING.landAt; const holdUntil = landAt + DICE_TIMING.holdFor; const fadeUntil = holdUntil + DICE_TIMING.fadeFor; state.dice = { rolls, reason, startedAt: performance.now(), landAt, holdUntil, fadeUntil, active: true }; }

function rollActionPointsInPlace() {
  if (state.gameOver || state.activeManeuver || state.side !== "player" || !state.canRollActionPoints) return false;
  const faces = roll2d6();
  const gained = sum(faces);
  state.actionPoints += gained;
  state.canRollActionPoints = false;
  showDice([{ label: "AP", faces, total: gained, advantage: 0 }], "actionPoints");
  return { faces, gained, total: state.actionPoints };
}

function startManeuver(id) {
  const maneuver = MANEUVER_BY_ID.get(id);
  if (!maneuver || state.gameOver || state.activeManeuver || state.side !== "player" || state.actionPoints < maneuver.cost) return false;
  state.actionPoints -= maneuver.cost;
  state.activeManeuver = id;
  state.phase = id;
  const result = originalStartManeuver?.(id);
  if (result === false) {
    state.actionPoints += maneuver.cost;
    state.activeManeuver = null;
    state.phase = "idle";
    return false;
  }
  state.activeManeuver = null;
  state.phase = "idle";
  return result ?? true;
}

function passTurn() {
  state.turn += 1;
  state.canRollActionPoints = true;
  state.activeManeuver = null;
  state.phase = "idle";
  return originalPassTurn?.() ?? true;
}
function concede() { state.gameOver = { winner: "enemy", reason: "player-conceded" }; return originalConcedeBattle?.() ?? true; }

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "cavalry-combat-controller-canvas";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "18", pointerEvents: "none", display: "none" });
  document.querySelector("#app")?.append(canvas);
  ctx = canvas.getContext("2d");
  return canvas;
}
function resize() { ensureCanvas(); const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1)); const w = Math.max(1, Math.floor(canvas.clientWidth * ratio)); const h = Math.max(1, Math.floor(canvas.clientHeight * ratio)); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } return { w, h }; }
function hideOlder() { ["#cavalry-dice-visual-fix-canvas", "#cavalry-roll-controller-canvas", "#cavalry-webgl-dice-canvas"].forEach((id) => { const n = document.querySelector(id); if (n) { n.style.opacity = "0"; n.style.pointerEvents = "none"; } }); }
function drawDice(size) { if (!state.dice.active) return; const age = performance.now() - state.dice.startedAt; if (age > state.dice.fadeUntil) { state.dice.active = false; return; } let alpha = 1; if (age > state.dice.holdUntil) alpha = clamp(1 - (age - state.dice.holdUntil) / (state.dice.fadeUntil - state.dice.holdUntil), 0, 1); ctx.save(); ctx.globalAlpha = alpha; const rolls = state.dice.rolls; rolls.forEach((roll, i) => { const cx = size.w * (rolls.length === 1 ? .5 : i === 0 ? .38 : .62); const cy = size.h * .40; drawTable(cx, cy, size.w * .22, size.h * .15); roll.faces.forEach((face, j) => drawDie(cx + (j - .5) * size.w * .075, cy, Math.min(size.w, size.h) * .052, face, age, i * 3 + j)); ctx.fillStyle = "#fff0bd"; ctx.font = `${Math.max(16, size.w * .014)}px system-ui`; ctx.textAlign = "center"; ctx.fillText(`${roll.label} ${roll.total}${roll.advantage ? ` (${roll.advantage > 0 ? "+" : ""}${roll.advantage})` : ""}`, cx, cy + size.h * .108); }); ctx.restore(); }
function drawTable(cx, cy, w, h) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .75); g.addColorStop(0, "rgba(8,14,8,.96)"); g.addColorStop(.62, "rgba(8,14,8,.72)"); g.addColorStop(1, "rgba(8,14,8,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + h * .10, w * .66, h * .46, 0, 0, TAU); ctx.fill(); }
function drawDie(x, y, s, face, age, seed) { const t = clamp(age / state.dice.landAt, 0, 1); const landed = t >= 1; const e = 1 - Math.pow(1 - t, 3); const start = (seed % 2 ? -1 : 1) * s * 3.0; const dx = landed ? 0 : start * (1 - e); const dy = landed ? 0 : Math.abs(Math.sin(t * TAU * 3.2 + seed)) * s * .55 * (1 - e); const rot = landed ? 0 : (1 - e) * (seed % 2 ? -.55 : .55); const shown = landed ? face : ((face + Math.floor(t * 30 + seed * 2)) % 6) + 1; ctx.save(); ctx.translate(x + dx, y - dy); ctx.rotate(rot); drawShadow(s); drawBody(s); drawPips(s, shown); ctx.restore(); }
function drawShadow(s) { ctx.fillStyle = "rgba(0,0,0,.40)"; ctx.beginPath(); ctx.ellipse(s * .22, s * 1.22, s * 1.08, s * .24, -.10, 0, TAU); ctx.fill(); }
function drawBody(s) { const d = s * .42, r = s * .20; ctx.fillStyle = "#ee8650"; ctx.beginPath(); ctx.moveTo(-s + r, -s - d); ctx.lineTo(s + d - r, -s - d); ctx.quadraticCurveTo(s + d, -s - d, s + d, -s - d + r); ctx.lineTo(s, -s + r); ctx.lineTo(-s, -s + r); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#6d1b13"; ctx.beginPath(); ctx.moveTo(s, -s + r); ctx.lineTo(s + d, -s - d + r); ctx.lineTo(s + d, s + d - r); ctx.lineTo(s, s - r); ctx.closePath(); ctx.fill(); const g = ctx.createLinearGradient(-s, -s, s, s); g.addColorStop(0, "#f69a60"); g.addColorStop(.5, "#b93222"); g.addColorStop(1, "#4d100b"); ctx.fillStyle = g; ctx.strokeStyle = "rgba(255,226,154,.98)"; ctx.lineWidth = Math.max(2, s * .055); ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, r); ctx.fill(); ctx.stroke(); }
function drawPips(s, face) { const spots = { 1:[[0,0]], 2:[[-.34,-.34],[.34,.34]], 3:[[-.34,-.34],[0,0],[.34,.34]], 4:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34]], 5:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34],[0,0]], 6:[[-.34,-.34],[.34,.34],[-.34,.34],[.34,-.34],[-.34,0],[.34,0]] }[face] || []; ctx.fillStyle = "#170806"; spots.forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * s, dy * s, s * .082, 0, TAU); ctx.fill(); }); }
function frame() { ensureCanvas(); hideOlder(); const page = originalGetSnapshot?.() ?? globalThis.GameHost?.getSnapshot?.() ?? {}; const active = page.mode === "battlefield"; canvas.style.display = active && state.dice.active ? "block" : "none"; if (active && state.dice.active) { const size = resize(); ctx.clearRect(0, 0, size.w, size.h); drawDice(size); } requestAnimationFrame(frame); }
function handleKey(e) { const page = originalGetSnapshot?.() ?? {}; if (page.mode !== "battlefield") return; if (e.key === "0" || e.key.toLowerCase() === "r") { e.preventDefault(); rollActionPointsInPlace(); return; } const id = KEY_TO_MANEUVER[e.key]; if (id) { e.preventDefault(); startManeuver(id); } if (e.key.toLowerCase() === "p") { e.preventDefault(); passTurn(); } }
function getTacticalSnapshot() { return { style: COMBAT_STYLE, turn: state.turn, side: state.side, actionPoints: state.actionPoints, canRollActionPoints: state.canRollActionPoints, activeManeuver: state.activeManeuver, phase: state.phase, dice: { rolls: state.dice.rolls, reason: state.dice.reason, active: state.dice.active, landAt: state.dice.landAt, holdUntil: state.dice.holdUntil, fadeUntil: state.dice.fadeUntil }, canRollInPlace: state.side === "player" && state.canRollActionPoints && !state.activeManeuver && !state.gameOver, gameOver: state.gameOver, maneuvers: MANEUVERS }; }
function patchGameHost() { const host = globalThis.GameHost; if (!host || host.__directDiceApPatched) return false; originalGetSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({}); originalStartManeuver = typeof host.startManeuver === "function" ? host.startManeuver.bind(host) : null; originalPassTurn = typeof host.passTurn === "function" ? host.passTurn.bind(host) : null; originalConcedeBattle = typeof host.concedeBattle === "function" ? host.concedeBattle.bind(host) : null; host.getSnapshot = () => ({ ...originalGetSnapshot(), tacticalGameplay: getTacticalSnapshot() }); host.getTacticalGameplaySnapshot = getTacticalSnapshot; host.rollActionPointsInPlace = rollActionPointsInPlace; host.startManeuver = startManeuver; host.passTurn = passTurn; host.concedeBattle = concede; host.__directDiceApPatched = true; return true; }
function boot() { globalThis.CavalryCombatController = { style: COMBAT_STYLE, rollActionPointsInPlace, startManeuver, passTurn, concede, getState: getTacticalSnapshot }; window.addEventListener("keydown", handleKey); const timer = setInterval(() => { if (patchGameHost()) clearInterval(timer); patchAttempts += 1; if (patchAttempts > 240) clearInterval(timer); }, 100); ensureCanvas(); requestAnimationFrame(frame); }
boot();
