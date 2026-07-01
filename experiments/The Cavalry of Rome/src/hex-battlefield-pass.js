const HEX_STYLE = "rome-perspective-hex-battlefield-no-ui";
const HEX_GRID = Object.freeze({ cols: 11, rows: 9 });
const CLASS_COLORS = Object.freeze({ light: "#3fad4f", medium: "#2f70d1", heavy: "#b93026" });
const BAND_COLORS = Object.freeze({ rome: "#c8231f", etruscan: "#d6aa3c", samnite: "#f0e6cf", greek: "#7a54bd", gallic: "#111318" });
const TERRAIN_TYPES = Object.freeze({ grass: "grass", water: "water", hill: "hill", fence: "fence" });
const UNIT_COUNTS = Object.freeze({ rome: { light: 5, medium: 4, heavy: 3 }, enemy: { light: 4, medium: 4, heavy: 2 } });
const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / Math.max(0.0001, b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function hashNoise(x, y, salt = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

function enemyBandForRegion(regionId = "") {
  if (regionId.includes("etruria")) return BAND_COLORS.etruscan;
  if (regionId.includes("samnium")) return BAND_COLORS.samnite;
  if (regionId.includes("graecia") || regionId.includes("campania")) return BAND_COLORS.greek;
  if (regionId.includes("cisalpine")) return BAND_COLORS.gallic;
  return "#d6aa3c";
}

function terrainForHex(col, row, regionId = "") {
  const n = hashNoise(col, row, regionId.length + 19);
  const ridge = Math.abs(row - (3 + Math.sin(col * 0.7 + regionId.length) * 1.5));
  const riverCenter = 5 + Math.sin((row + regionId.length) * 0.8) * 1.2;
  if ((regionId.includes("campania") || regionId.includes("graecia")) && Math.abs(col - riverCenter) < 0.7 && row > 1 && row < HEX_GRID.rows - 1) return TERRAIN_TYPES.water;
  if (regionId.includes("samnium") && ridge < 0.85 && n > 0.28) return TERRAIN_TYPES.hill;
  if (regionId.includes("cisalpine") && (n > 0.76 || ridge < 0.55)) return TERRAIN_TYPES.hill;
  if (n > 0.86 && row > 1 && row < HEX_GRID.rows - 2) return TERRAIN_TYPES.water;
  if (n > 0.68 && n <= 0.86) return TERRAIN_TYPES.hill;
  if ((row === 3 || row === 5) && n > 0.42 && n < 0.60) return TERRAIN_TYPES.fence;
  return TERRAIN_TYPES.grass;
}

function tileStats(type) {
  if (type === TERRAIN_TYPES.water) return { movementCost: 3, defense: 0, blocksCharge: true, label: "water" };
  if (type === TERRAIN_TYPES.hill) return { movementCost: 2, defense: 1, blocksCharge: false, label: "hill" };
  if (type === TERRAIN_TYPES.fence) return { movementCost: 2, defense: 1, blocksCharge: true, label: "fence" };
  return { movementCost: 1, defense: 0, blocksCharge: false, label: "grass" };
}

function createHexBattlefield(regionId = "latium") {
  const tiles = [];
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) {
      const terrainType = terrainForHex(col, row, regionId);
      tiles.push({
        id: `h-${col}-${row}`,
        q: col,
        r: row,
        col,
        row,
        terrainType,
        height: terrainType === TERRAIN_TYPES.hill ? 1 : 0,
        visualVariant: hashNoise(col, row, 77),
        ...tileStats(terrainType)
      });
    }
  }
  return { id: `hex-battlefield-${regionId}`, regionId, cols: HEX_GRID.cols, rows: HEX_GRID.rows, tiles, units: createBattleUnits(regionId) };
}

function createUnit(id, army, troopType, col, row, facing = "north", bandColor = BAND_COLORS.rome) {
  return { id, army, troopType, col, row, facing, bandColor, bodyColor: CLASS_COLORS[troopType], strengthLabel: troopType, selected: false };
}

function createBattleUnits(regionId) {
  const enemyBand = enemyBandForRegion(regionId);
  return [
    createUnit("rome-medium-fl", "rome", "medium", 2, 6, "north"),
    createUnit("rome-light-c1", "rome", "light", 4, 6, "north"),
    createUnit("rome-light-c2", "rome", "light", 5, 6, "north"),
    createUnit("rome-light-c3", "rome", "light", 6, 6, "north"),
    createUnit("rome-medium-fr", "rome", "medium", 8, 6, "north"),
    createUnit("rome-medium-l", "rome", "medium", 3, 7, "north"),
    createUnit("rome-light-r", "rome", "light", 5, 7, "north"),
    createUnit("rome-medium-r", "rome", "medium", 7, 7, "north"),
    createUnit("rome-heavy-bl", "rome", "heavy", 2, 8, "north"),
    createUnit("rome-heavy-bc", "rome", "heavy", 5, 8, "north"),
    createUnit("rome-heavy-br", "rome", "heavy", 8, 8, "north"),
    createUnit("rome-light-reserve", "rome", "light", 5, 5, "north"),

    createUnit("enemy-light-l", "enemy", "light", 3, 2, "south", enemyBand),
    createUnit("enemy-medium-l", "enemy", "medium", 4, 2, "south", enemyBand),
    createUnit("enemy-medium-c", "enemy", "medium", 5, 2, "south", enemyBand),
    createUnit("enemy-medium-r", "enemy", "medium", 6, 2, "south", enemyBand),
    createUnit("enemy-light-r", "enemy", "light", 7, 2, "south", enemyBand),
    createUnit("enemy-light-screen-l", "enemy", "light", 4, 1, "south", enemyBand),
    createUnit("enemy-light-screen-r", "enemy", "light", 6, 1, "south", enemyBand),
    createUnit("enemy-heavy-l", "enemy", "heavy", 3, 3, "south", enemyBand),
    createUnit("enemy-heavy-r", "enemy", "heavy", 7, 3, "south", enemyBand),
    createUnit("enemy-medium-reserve", "enemy", "medium", 5, 3, "south", enemyBand)
  ];
}

let canvas = null;
let ctx = null;
let battlefield = null;
let selectedUnitId = null;
let hoveredHexId = null;
let hoveredUnitId = null;
let lastRegionId = null;

function ensureCanvas() {
  if (canvas) return canvas;
  canvas = document.createElement("canvas");
  canvas.id = "cavalry-hex-battlefield-canvas";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "4", pointerEvents: "none", display: "none", background: "#11130d" });
  document.querySelector("#app")?.append(canvas);
  ctx = canvas.getContext("2d");
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  return canvas;
}

function resize() {
  ensureCanvas();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return { w, h, ratio };
}

function battlefieldForSnapshot(snapshot = {}) {
  const regionId = snapshot.selectedRegionId ?? snapshot.hoveredRegionId ?? "latium";
  if (!battlefield || lastRegionId !== regionId) {
    battlefield = createHexBattlefield(regionId);
    lastRegionId = regionId;
    selectedUnitId = null;
    hoveredHexId = null;
    hoveredUnitId = null;
  }
  return battlefield;
}

function projectHex(col, row, size) {
  const t = row / Math.max(1, HEX_GRID.rows - 1);
  const perspective = lerp(0.64, 1.28, smoothstep(0, 1, t));
  const base = Math.min(size.w / 15.0, size.h / 11.2);
  const hexR = base * perspective;
  const centerX = size.w * 0.5;
  const centerY = size.h * 0.145;
  const x = centerX + (col - (HEX_GRID.cols - 1) / 2 + (row % 2 ? 0.5 : 0)) * base * 1.42 * perspective;
  const y = centerY + row * base * 0.76 * perspective + row * base * 0.145;
  return { x, y, r: hexR, perspective };
}

function hexPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * TAU / 6;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r * 0.82;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function tileColor(tile) {
  if (tile.terrainType === TERRAIN_TYPES.water) return ["#264f5d", "#183845"];
  if (tile.terrainType === TERRAIN_TYPES.hill) return ["#6d673c", "#4e4e2d"];
  if (tile.terrainType === TERRAIN_TYPES.fence) return ["#4c6d35", "#38562c"];
  return ["#355f2f", "#254a29"];
}

function drawTile(tile, size) {
  const p = projectHex(tile.col, tile.row, size);
  const hot = hoveredHexId === tile.id;
  const [a, b] = tileColor(tile);
  const gradient = ctx.createLinearGradient(p.x, p.y - p.r, p.x, p.y + p.r);
  gradient.addColorStop(0, a);
  gradient.addColorStop(1, b);
  hexPath(ctx, p.x, p.y, p.r * 0.97);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = hot ? Math.max(2, p.r * 0.035) : Math.max(1, p.r * 0.018);
  ctx.strokeStyle = hot ? "rgba(255,236,164,.86)" : "rgba(236,216,148,.22)";
  ctx.stroke();

  if (tile.terrainType === TERRAIN_TYPES.hill) drawHillFeature(p, tile);
  if (tile.terrainType === TERRAIN_TYPES.water) drawWaterFeature(p, tile);
  if (tile.terrainType === TERRAIN_TYPES.fence) drawFenceFeature(p, tile);
  if (tile.terrainType === TERRAIN_TYPES.grass) drawGrassFeature(p, tile);
}

function drawGrassFeature(p, tile) {
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "rgba(115,146,69,.72)";
  ctx.lineWidth = Math.max(0.7, p.r * 0.012);
  for (let i = 0; i < 7; i += 1) {
    const a = hashNoise(tile.col + i, tile.row, 23) * TAU;
    const radius = p.r * (0.12 + hashNoise(tile.row, tile.col + i, 24) * 0.42);
    const x = p.x + Math.cos(a) * radius;
    const y = p.y + Math.sin(a) * radius * 0.62;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a + 0.9) * p.r * 0.055, y - p.r * 0.12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaterFeature(p, tile) {
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "rgba(126,190,200,.58)";
  ctx.lineWidth = Math.max(1, p.r * 0.025);
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + (i - 1) * p.r * 0.18, p.r * 0.48, p.r * 0.06, 0.1 * i, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHillFeature(p, tile) {
  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.fillStyle = "rgba(140,128,76,.58)";
  ctx.beginPath();
  ctx.ellipse(p.x - p.r * 0.12, p.y - p.r * 0.05, p.r * 0.38, p.r * 0.16, -0.2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(226,205,139,.35)";
  ctx.stroke();
  ctx.restore();
}

function drawFenceFeature(p, tile) {
  ctx.save();
  ctx.strokeStyle = "rgba(132,90,48,.86)";
  ctx.lineWidth = Math.max(2, p.r * 0.035);
  ctx.beginPath();
  ctx.moveTo(p.x - p.r * 0.48, p.y + p.r * 0.04);
  ctx.lineTo(p.x + p.r * 0.48, p.y - p.r * 0.08);
  ctx.stroke();
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    const x = p.x + i * p.r * 0.22;
    ctx.moveTo(x, p.y - p.r * 0.20);
    ctx.lineTo(x, p.y + p.r * 0.13);
    ctx.stroke();
  }
  ctx.restore();
}

function unitAt(col, row) {
  return battlefield?.units.find((unit) => unit.col === col && unit.row === row) ?? null;
}

function drawUnit(unit, size) {
  const p = projectHex(unit.col, unit.row, size);
  const selected = selectedUnitId === unit.id;
  const hovered = hoveredUnitId === unit.id;
  const baseR = p.r * 0.45;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = p.r * 0.18;
  ctx.fillStyle = "rgba(13,11,8,.58)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + baseR * 0.42, baseR * 1.08, baseR * 0.42, 0, 0, TAU);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = selected ? "rgba(255,235,155,.62)" : hovered ? "rgba(255,235,155,.34)" : "rgba(30,23,16,.82)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + baseR * 0.22, baseR * 0.98, baseR * 0.46, 0, 0, TAU);
  ctx.fill();

  const cluster = unit.troopType === "heavy" ? 5 : unit.troopType === "medium" ? 4 : 3;
  for (let i = 0; i < cluster; i += 1) {
    const offset = (i - (cluster - 1) / 2) * baseR * 0.28;
    const soldierX = p.x + offset;
    const soldierY = p.y - baseR * 0.16 + Math.abs(i - 2) * baseR * 0.04;
    drawMiniSoldier(soldierX, soldierY, baseR * (unit.troopType === "heavy" ? 0.42 : 0.36), unit);
  }

  ctx.lineWidth = Math.max(3, p.r * 0.055);
  ctx.strokeStyle = unit.bandColor;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + baseR * 0.20, baseR * 0.98, baseR * 0.46, 0, 0, TAU);
  ctx.stroke();
  if (unit.army === "rome" && unit.troopType === "heavy") {
    ctx.strokeStyle = "#6e0d0c";
    ctx.lineWidth = Math.max(1, p.r * 0.025);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMiniSoldier(x, y, s, unit) {
  ctx.fillStyle = unit.bodyColor;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.30, y - s * 0.18, s * 0.60, s * 0.70, s * 0.12);
  ctx.fill();
  ctx.fillStyle = unit.bandColor;
  ctx.fillRect(x - s * 0.31, y + s * 0.02, s * 0.62, s * 0.12);
  ctx.fillStyle = "#d2b38a";
  ctx.beginPath();
  ctx.arc(x, y - s * 0.30, s * 0.20, 0, TAU);
  ctx.fill();
  ctx.fillStyle = unit.troopType === "heavy" ? "#c7b073" : "#6b6d6d";
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.42, s * 0.24, s * 0.12, 0, 0, TAU);
  ctx.fill();
}

function drawBackground(size) {
  const gradient = ctx.createLinearGradient(0, 0, 0, size.h);
  gradient.addColorStop(0, "#192018");
  gradient.addColorStop(0.48, "#354125");
  gradient.addColorStop(1, "#17110b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 80; i += 1) {
    const x = hashNoise(i, 2, 19) * size.w;
    const y = hashNoise(i, 4, 23) * size.h;
    const r = size.w * (0.02 + hashNoise(i, 7, 29) * 0.08);
    ctx.fillStyle = i % 5 === 0 ? "#182f2f" : "#566331";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.22, hashNoise(i, 9, 31) * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBattlefield(snapshot) {
  const size = resize();
  const field = battlefieldForSnapshot(snapshot);
  drawBackground(size);
  field.tiles.sort((a, b) => a.row - b.row).forEach((tile) => drawTile(tile, size));
  field.units.sort((a, b) => a.row - b.row || a.col - b.col).forEach((unit) => drawUnit(unit, size));
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#6a1713";
  ctx.beginPath();
  ctx.moveTo(size.w * 0.18, size.h * 0.95);
  ctx.lineTo(size.w * 0.82, size.h * 0.95);
  ctx.lineTo(size.w * 0.64, size.h * 0.88);
  ctx.lineTo(size.w * 0.36, size.h * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function nearestHex(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const size = { w: canvas.width, h: canvas.height };
  const x = (clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
  const y = (clientY - rect.top) * (canvas.height / Math.max(1, rect.height));
  let best = null;
  let bestD = Infinity;
  for (const tile of battlefield?.tiles ?? []) {
    const p = projectHex(tile.col, tile.row, size);
    const d = Math.hypot(x - p.x, y - p.y) / Math.max(1, p.r);
    if (d < bestD) { best = tile; bestD = d; }
  }
  return bestD < 0.82 ? best : null;
}

function onPointerMove(event) {
  const tile = nearestHex(event.clientX, event.clientY);
  hoveredHexId = tile?.id ?? null;
  const unit = tile ? unitAt(tile.col, tile.row) : null;
  hoveredUnitId = unit?.id ?? null;
}

function onPointerDown(event) {
  const tile = nearestHex(event.clientX, event.clientY);
  if (!tile) return;
  const unit = unitAt(tile.col, tile.row);
  selectedUnitId = unit?.id ?? null;
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || host.__cavalryHexPatched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const snapshot = originalSnapshot() ?? {};
    return {
      ...snapshot,
      tacticalHex: battlefield ? {
        id: battlefield.id,
        style: HEX_STYLE,
        grid: { cols: battlefield.cols, rows: battlefield.rows },
        terrainTypes: Object.keys(TERRAIN_TYPES),
        unitCounts: UNIT_COUNTS,
        selectedUnitId,
        hoveredHexId,
        hoveredUnitId,
        active: snapshot.mode === "battlefield"
      } : null
    };
  };
  host.getHexBattlefieldSnapshot = () => battlefield ? { ...battlefield, selectedUnitId, hoveredHexId, hoveredUnitId } : null;
  host.__cavalryHexPatched = true;
  return true;
}

function frame() {
  ensureCanvas();
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = snapshot.mode === "battlefield";
  window.CavalryHexBattlefieldActive = active;
  canvas.style.display = active ? "block" : "none";
  canvas.style.pointerEvents = active ? "auto" : "none";
  const vegetation = document.querySelector("#cavalry-procedural-vegetation-overlay");
  if (vegetation) vegetation.style.display = active ? "none" : "block";
  if (active) drawBattlefield(snapshot);
  requestAnimationFrame(frame);
}

function boot() {
  window.CavalryHexBattlefield = { createHexBattlefield, createBattleUnits, terrainForHex, style: HEX_STYLE, unitCounts: UNIT_COUNTS };
  const patchTimer = setInterval(() => {
    if (patchGameHost()) clearInterval(patchTimer);
  }, 100);
  ensureCanvas();
  requestAnimationFrame(frame);
}

boot();
