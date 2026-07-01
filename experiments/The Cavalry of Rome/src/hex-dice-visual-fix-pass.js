const DICE_VISUAL_FIX_STYLE = "landed-3d-dice-visual-fix";
const DICE_TIMING = Object.freeze({ landAt: 1600, holdFor: 3000, fadeFor: 900 });
const TAU = Math.PI * 2;

let canvas = null;
let ctx = null;
let activeRoll = null;
let lastSignature = "";
let rollApBlocked = false;

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "cavalry-dice-visual-fix-canvas";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "64", pointerEvents: "none", display: "none" });
  document.querySelector("#app")?.append(canvas);
  ctx = canvas.getContext("2d");

  const style = document.createElement("style");
  style.textContent = `
    .cavalry-action-card[data-action-id="rollAp"][data-spent="true"] {
      background: linear-gradient(145deg, rgba(24,25,27,.90), rgba(11,12,13,.88)) !important;
      border-color: rgba(190,190,190,.22) !important;
      opacity: .46 !important;
      filter: grayscale(.85) saturate(.55) !important;
      transform: none !important;
      cursor: not-allowed !important;
    }
    .cavalry-action-card[data-action-id="rollAp"][data-spent="true"] .cavalry-card-cost { color: rgba(230,230,230,.72) !important; }
    .cavalry-action-card[data-action-id="rollAp"][data-spent="true"] .cavalry-card-cost::before { background: #777 !important; box-shadow: none !important; }
  `;
  document.head.append(style);

  document.addEventListener("click", (event) => {
    const card = event.target?.closest?.('[data-action-id="rollAp"]');
    if (!card || !rollApBlocked) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }, true);
  return canvas;
}

function resize() {
  ensureCanvas();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return { w, h };
}

function tactical() { return globalThis.GameHost?.getTacticalGameplaySnapshot?.() ?? globalThis.GameHost?.getSnapshot?.()?.tacticalGameplay ?? null; }

function updateRollApCard(snapshot) {
  const card = document.querySelector('[data-action-id="rollAp"]');
  if (!card) return;
  const spent = Boolean(snapshot) && snapshot.side === "player" && !snapshot.canRollInPlace;
  const locked = spent || snapshot?.side === "enemy" || Boolean(snapshot?.activeManeuver) || Boolean(snapshot?.gameOver);
  rollApBlocked = locked;
  card.dataset.spent = spent ? "true" : "false";
  card.disabled = locked;
  card.setAttribute("aria-disabled", locked ? "true" : "false");
}

function rollSignature(dice) {
  if (!dice?.active || !Array.isArray(dice.rolls) || !dice.rolls.length) return "";
  return JSON.stringify({ reason: dice.reason, rolls: dice.rolls.map((r) => ({ label: r.label, faces: r.faces, total: r.total, advantage: r.advantage })) });
}

function syncRoll(snapshot) {
  const sig = rollSignature(snapshot?.dice);
  if (sig && sig !== lastSignature) {
    lastSignature = sig;
    activeRoll = { startedAt: performance.now(), reason: snapshot.dice.reason, rolls: snapshot.dice.rolls.map((r) => ({ ...r, faces: [...(r.faces ?? [])] })) };
  }
  if (!sig && !activeRoll) lastSignature = "";
}

function alphaFor(age) {
  const holdUntil = DICE_TIMING.landAt + DICE_TIMING.holdFor;
  if (age <= holdUntil) return 1;
  return Math.max(0, 1 - (age - holdUntil) / DICE_TIMING.fadeFor);
}

function coverLegacyDiceArea(size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const cx = size.w * 0.50;
  const cy = size.h * 0.405;
  const w = size.w * 0.74;
  const h = size.h * 0.32;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.62);
  g.addColorStop(0, "rgba(7,14,7,.99)");
  g.addColorStop(0.52, "rgba(7,14,7,.96)");
  g.addColorStop(0.78, "rgba(7,14,7,.70)");
  g.addColorStop(1, "rgba(7,14,7,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.10, w * 0.58, h * 0.45, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBoardPatch(cx, cy, w, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .75);
  g.addColorStop(0, "rgba(8,14,8,.96)");
  g.addColorStop(.62, "rgba(8,14,8,.72)");
  g.addColorStop(1, "rgba(8,14,8,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * .08, w * .66, h * .46, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function drawDie(cx, cy, s, face, age, seed) {
  const rollT = Math.min(1, age / DICE_TIMING.landAt);
  const landed = rollT >= 1;
  const e = easeOut(rollT);
  const startX = (seed % 2 ? -1 : 1) * s * 3.3;
  const x = cx + (landed ? 0 : startX * (1 - e));
  const y = cy - (landed ? 0 : Math.abs(Math.sin(rollT * TAU * 3.2 + seed)) * s * .62 * (1 - e));
  const rotation = landed ? 0 : (1 - e) * (seed % 2 ? -.55 : .55);
  const shownFace = landed ? face : ((face + Math.floor(rollT * 30 + seed * 2)) % 6) + 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  drawContactShadow(s);
  drawDieBody(s);
  drawPips(s, shownFace);
  ctx.restore();
}

function drawContactShadow(s) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.40)";
  ctx.beginPath();
  ctx.ellipse(s * .22, s * 1.22, s * 1.08, s * .24, -0.10, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawDieBody(s) {
  const d = s * .42;
  const r = s * .20;
  ctx.fillStyle = "#ee8650";
  ctx.beginPath();
  ctx.moveTo(-s + r, -s - d);
  ctx.lineTo(s + d - r, -s - d);
  ctx.quadraticCurveTo(s + d, -s - d, s + d, -s - d + r);
  ctx.lineTo(s, -s + r);
  ctx.lineTo(-s, -s + r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6d1b13";
  ctx.beginPath();
  ctx.moveTo(s, -s + r);
  ctx.lineTo(s + d, -s - d + r);
  ctx.lineTo(s + d, s + d - r);
  ctx.lineTo(s, s - r);
  ctx.closePath();
  ctx.fill();
  const g = ctx.createLinearGradient(-s, -s, s, s);
  g.addColorStop(0, "#f69a60");
  g.addColorStop(.5, "#b93222");
  g.addColorStop(1, "#4d100b");
  ctx.fillStyle = g;
  ctx.strokeStyle = "rgba(255,226,154,.98)";
  ctx.lineWidth = Math.max(2, s * .055);
  ctx.beginPath();
  ctx.roundRect(-s, -s, s * 2, s * 2, r);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.20)";
  ctx.lineWidth = Math.max(1, s * .030);
  ctx.beginPath();
  ctx.moveTo(-s * .72, -s * .82);
  ctx.lineTo(s * .34, -s * .82);
  ctx.stroke();
}

function drawPips(s, face) {
  const spots = { 1: [[0, 0]], 2: [[-.34, -.34], [.34, .34]], 3: [[-.34, -.34], [0, 0], [.34, .34]], 4: [[-.34, -.34], [.34, .34], [-.34, .34], [.34, -.34]], 5: [[-.34, -.34], [.34, .34], [-.34, .34], [.34, -.34], [0, 0]], 6: [[-.34, -.34], [.34, .34], [-.34, .34], [.34, -.34], [-.34, 0], [.34, 0]] }[face] ?? [];
  ctx.fillStyle = "#170806";
  for (const [dx, dy] of spots) { ctx.beginPath(); ctx.arc(dx * s, dy * s, s * .082, 0, TAU); ctx.fill(); }
}

function drawRoll(size, roll, index, count, age, alpha) {
  const cx = size.w * (count === 1 ? .5 : index === 0 ? .38 : .62);
  const cy = size.h * .40;
  const s = Math.min(size.w, size.h) * .052;
  drawBoardPatch(cx, cy, size.w * .23, size.h * .18, alpha);
  (roll.faces ?? []).forEach((face, dieIndex) => drawDie(cx + (dieIndex - .5) * size.w * .075, cy, s, face, age, index * 3 + dieIndex));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fff0bd";
  ctx.font = `${Math.max(16, size.w * .014)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(`${roll.label ?? "ROLL"} ${roll.total ?? ""}${roll.advantage ? ` (${roll.advantage > 0 ? "+" : ""}${roll.advantage})` : ""}`, cx, cy + size.h * .108);
  ctx.restore();
}

function frame() {
  ensureCanvas();
  const snapshot = tactical();
  updateRollApCard(snapshot);
  const legacySig = rollSignature(snapshot?.dice);
  syncRoll(snapshot);
  const page = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = page.mode === "battlefield" && (activeRoll || legacySig);
  canvas.style.display = active ? "block" : "none";
  if (active) {
    const size = resize();
    ctx.clearRect(0, 0, size.w, size.h);
    if (!activeRoll && legacySig) {
      coverLegacyDiceArea(size, 1);
    } else if (activeRoll) {
      const age = performance.now() - activeRoll.startedAt;
      const alpha = alphaFor(age);
      if (alpha <= 0) {
        activeRoll = null;
      } else {
        coverLegacyDiceArea(size, 1);
        activeRoll.rolls.forEach((roll, index) => drawRoll(size, roll, index, activeRoll.rolls.length, age, alpha));
      }
    }
  }
  requestAnimationFrame(frame);
}

function boot() {
  globalThis.CavalryDiceVisualFix = { style: DICE_VISUAL_FIX_STYLE };
  ensureCanvas();
  requestAnimationFrame(frame);
}

boot();
