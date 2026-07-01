const GAMEPLAY_STYLE = "scene-native-maneuver-logic-webgl-dice";
const HEX_GRID = Object.freeze({ cols: 11, rows: 9 });
const HEX_Y_SCALE = 0.72;
const SQRT3 = Math.sqrt(3);
const TAU = Math.PI * 2;
const VERTEX_STRIDE = 2;

const TERRAIN = Object.freeze({ grass: "grass", water: "water", hill: "hill", fence: "fence" });
const CLASS_COLORS = Object.freeze({ light: "#3fad4f", medium: "#2f70d1", heavy: "#b93026" });
const BAND_COLORS = Object.freeze({ rome: "#c8231f", etruscan: "#d6aa3c", samnite: "#f0e6cf", greek: "#7a54bd", gallic: "#111318" });

const MANEUVERS = Object.freeze({
  advanceLeft: { id: "advanceLeft", label: "Advance Left", cost: 1, kind: "advance", section: "left" },
  advanceCenter: { id: "advanceCenter", label: "Advance Center", cost: 1, kind: "advance", section: "center" },
  advanceRight: { id: "advanceRight", label: "Advance Right", cost: 1, kind: "advance", section: "right" },
  lineBrigade: { id: "lineBrigade", label: "Line Brigade", cost: 2, kind: "lineBrigade" },
  heavyBrigade: { id: "heavyBrigade", label: "Heavy Brigade", cost: 3, kind: "heavyBrigade" },
  berserk: { id: "berserk", label: "Berserk", cost: 4, kind: "berserk" },
  scout: { id: "scout", label: "Scout", cost: 4, kind: "scout" }
});

const KEY_TO_MANEUVER = Object.freeze({
  "1": "advanceLeft",
  "2": "advanceCenter",
  "3": "advanceRight",
  "4": "lineBrigade",
  "5": "heavyBrigade",
  "6": "berserk",
  "7": "scout"
});

const state = {
  initialized: false,
  regionId: null,
  turn: 1,
  actionPoints: 0,
  activeManeuver: null,
  phase: "idle",
  remainingMoves: 0,
  selectedUnitId: null,
  selectedGroupIds: new Set(),
  movedUnitIds: new Set(),
  reachable: [],
  attackTargets: [],
  lastMoveEndedTurn: false,
  lastAttack: null,
  deniedUntil: 0,
  dice: { faces: [], startedAt: 0, duration: 1300, reason: "", active: false }
};

let overlayCanvas = null;
let overlayCtx = null;
let diceCanvas = null;
let diceGl = null;
let diceProgram = null;
let diceBuffer = null;
let cachedBattlefield = null;
let cachedRegionId = null;
let lastPatchAttempts = 0;

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));

function randomUint32() {
  if (globalThis.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0];
  }
  return Math.floor(Math.random() * 0x100000000);
}

function rollDie() {
  const max = 0xffffffff - (0xffffffff % 6);
  let value = randomUint32();
  while (value >= max) value = randomUint32();
  return (value % 6) + 1;
}

function enemyBandForRegion(regionId = "") {
  if (regionId.includes("etruria")) return BAND_COLORS.etruscan;
  if (regionId.includes("samnium")) return BAND_COLORS.samnite;
  if (regionId.includes("graecia") || regionId.includes("campania")) return BAND_COLORS.greek;
  if (regionId.includes("cisalpine")) return BAND_COLORS.gallic;
  return "#d6aa3c";
}

function createUnit(id, army, troopType, col, row, facing = "north", bandColor = BAND_COLORS.rome) {
  return { id, army, troopType, col, row, facing, bandColor, bodyColor: CLASS_COLORS[troopType] };
}

function fallbackUnits(regionId) {
  const enemyBand = enemyBandForRegion(regionId);
  return [
    createUnit("rome-medium-fl", "rome", "medium", 2, 6),
    createUnit("rome-light-c1", "rome", "light", 4, 6),
    createUnit("rome-light-c2", "rome", "light", 5, 6),
    createUnit("rome-light-c3", "rome", "light", 6, 6),
    createUnit("rome-medium-fr", "rome", "medium", 8, 6),
    createUnit("rome-medium-l", "rome", "medium", 3, 7),
    createUnit("rome-light-r", "rome", "light", 5, 7),
    createUnit("rome-medium-r", "rome", "medium", 7, 7),
    createUnit("rome-heavy-bl", "rome", "heavy", 2, 8),
    createUnit("rome-heavy-bc", "rome", "heavy", 5, 8),
    createUnit("rome-heavy-br", "rome", "heavy", 8, 8),
    createUnit("rome-light-reserve", "rome", "light", 5, 5),
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

function terrainForFallback(col, row) {
  const n = Math.sin(col * 12.7 + row * 45.3) * 43758.5453;
  const f = n - Math.floor(n);
  if (f > 0.88 && row > 1 && row < 7) return TERRAIN.water;
  if (f > 0.68) return TERRAIN.hill;
  if ((row === 3 || row === 5) && f > 0.42 && f < 0.6) return TERRAIN.fence;
  return TERRAIN.grass;
}

function fallbackTiles() {
  const tiles = [];
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) {
      tiles.push({ id: `h-${col}-${row}`, col, row, terrainType: terrainForFallback(col, row) });
    }
  }
  return tiles;
}

function getBattlefield(snapshot = {}) {
  const direct = globalThis.GameHost?.getHexBattlefieldSnapshot?.();
  if (direct?.units?.length && direct?.tiles?.length) return direct;
  const regionId = snapshot.selectedRegionId ?? snapshot.hoveredRegionId ?? "latium";
  if (!cachedBattlefield || cachedRegionId !== regionId) {
    cachedBattlefield = { id: `gameplay-fallback-${regionId}`, regionId, cols: HEX_GRID.cols, rows: HEX_GRID.rows, units: fallbackUnits(regionId), tiles: fallbackTiles() };
    cachedRegionId = regionId;
  }
  return cachedBattlefield;
}

function resetBattleState(regionId) {
  state.initialized = true;
  state.regionId = regionId;
  state.turn = 1;
  state.activeManeuver = null;
  state.phase = "idle";
  state.remainingMoves = 0;
  state.selectedUnitId = null;
  state.selectedGroupIds = new Set();
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  state.lastMoveEndedTurn = false;
  state.lastAttack = null;
  rollActionPoints();
}

function rollActionPoints() {
  const a = rollDie();
  const b = rollDie();
  state.actionPoints = a + b;
  showDice([a, b], "actionPoints");
}

function showDice(faces, reason) {
  state.dice = { faces, reason, startedAt: performance.now(), duration: reason === "actionPoints" ? 1800 : 1350, active: true };
}

function ensureOverlays() {
  if (overlayCanvas && diceCanvas) return;
  overlayCanvas = document.createElement("canvas");
  overlayCanvas.id = "cavalry-hex-gameplay-canvas";
  Object.assign(overlayCanvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "9", pointerEvents: "none", display: "none" });
  diceCanvas = document.createElement("canvas");
  diceCanvas.id = "cavalry-webgl-dice-canvas";
  Object.assign(diceCanvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "10", pointerEvents: "none", display: "none" });
  document.querySelector("#app")?.append(overlayCanvas, diceCanvas);
  overlayCtx = overlayCanvas.getContext("2d");
  overlayCanvas.addEventListener("pointermove", onPointerMove);
  overlayCanvas.addEventListener("pointerdown", onPointerDown);
  try {
    diceGl = diceCanvas.getContext("webgl2", { alpha: true, antialias: true, depth: false, premultipliedAlpha: false });
    if (diceGl) initDiceWebGl();
  } catch (error) {
    console.warn("Cavalry WebGL dice unavailable; using Canvas dice fallback.", error);
    diceGl = null;
  }
}

function resize() {
  ensureOverlays();
  const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(overlayCanvas.clientWidth * ratio));
  const h = Math.max(1, Math.floor(overlayCanvas.clientHeight * ratio));
  for (const canvas of [overlayCanvas, diceCanvas]) {
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  return { w, h, ratio };
}

function compileDiceShader(type, source) {
  const shader = diceGl.createShader(type);
  diceGl.shaderSource(shader, source);
  diceGl.compileShader(shader);
  if (!diceGl.getShaderParameter(shader, diceGl.COMPILE_STATUS)) throw new Error(diceGl.getShaderInfoLog(shader) || "Dice shader compile failed");
  return shader;
}

function initDiceWebGl() {
  const vertex = compileDiceShader(diceGl.VERTEX_SHADER, `#version 300 es
    in vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `);
  const fragment = compileDiceShader(diceGl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_face1;
    uniform float u_face2;
    uniform float u_count;
    uniform float u_alpha;
    out vec4 outColor;

    float roundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) - r + min(max(q.x, q.y), 0.0);
    }

    float pip(vec2 p, vec2 c, float r) { return 1.0 - smoothstep(r, r * 1.18, length(p - c)); }

    float facePips(vec2 p, float face) {
      float f = floor(face + 0.5);
      float v = 0.0;
      vec2 a = vec2(-0.34, -0.34);
      vec2 b = vec2(0.34, 0.34);
      vec2 c = vec2(-0.34, 0.34);
      vec2 d = vec2(0.34, -0.34);
      vec2 l = vec2(-0.34, 0.0);
      vec2 r = vec2(0.34, 0.0);
      vec2 m = vec2(0.0, 0.0);
      if (f == 1.0) v += pip(p, m, 0.075);
      if (f == 2.0) { v += pip(p, a, 0.070); v += pip(p, b, 0.070); }
      if (f == 3.0) { v += pip(p, a, 0.068); v += pip(p, m, 0.068); v += pip(p, b, 0.068); }
      if (f == 4.0) { v += pip(p, a, 0.066); v += pip(p, b, 0.066); v += pip(p, c, 0.066); v += pip(p, d, 0.066); }
      if (f == 5.0) { v += pip(p, a, 0.064); v += pip(p, b, 0.064); v += pip(p, c, 0.064); v += pip(p, d, 0.064); v += pip(p, m, 0.064); }
      if (f == 6.0) { v += pip(p, a, 0.062); v += pip(p, b, 0.062); v += pip(p, c, 0.062); v += pip(p, d, 0.062); v += pip(p, l, 0.062); v += pip(p, r, 0.062); }
      return clamp(v, 0.0, 1.0);
    }

    vec4 die(vec2 frag, vec2 center, float size, float face, float phase) {
      vec2 p = (frag - center) / size;
      p.x += sin(phase * 6.28) * 0.035;
      p.y += cos(phase * 6.28) * 0.025;
      float d = roundedBox(p, vec2(0.64), 0.16);
      float body = 1.0 - smoothstep(0.0, 0.016, d);
      if (body <= 0.0) return vec4(0.0);
      float edge = smoothstep(0.40, 0.78, length(p));
      float bevel = smoothstep(0.38, 0.70, abs(p.x)) * 0.24 + smoothstep(0.38, 0.70, abs(p.y)) * 0.18;
      float light = 0.78 + max(dot(normalize(vec3(-p.x * 0.45, -p.y * 0.36, 1.0)), normalize(vec3(-0.35, 0.45, 0.82))), 0.0) * 0.42;
      vec3 color = mix(vec3(0.70, 0.07, 0.04), vec3(1.0, 0.84, 0.54), 0.18 + light * 0.15);
      color *= light - bevel;
      color = mix(color, vec3(0.10, 0.02, 0.015), edge * 0.35);
      float pips = facePips(p, face);
      color = mix(color, vec3(0.055, 0.025, 0.020), pips);
      return vec4(color, body * u_alpha);
    }

    void main() {
      vec2 frag = gl_FragCoord.xy;
      float size = min(u_resolution.x, u_resolution.y) * 0.105;
      float phase = clamp(u_time, 0.0, 1.0);
      vec4 color = vec4(0.0);
      if (u_count < 1.5) {
        color += die(frag, vec2(u_resolution.x * 0.50, u_resolution.y * 0.60), size, u_face1, phase);
      } else {
        color += die(frag, vec2(u_resolution.x * 0.43, u_resolution.y * 0.60), size, u_face1, phase);
        color += die(frag, vec2(u_resolution.x * 0.57, u_resolution.y * 0.60), size, u_face2, phase + 0.21);
      }
      outColor = color;
    }
  `);
  diceProgram = diceGl.createProgram();
  diceGl.attachShader(diceProgram, vertex);
  diceGl.attachShader(diceProgram, fragment);
  diceGl.linkProgram(diceProgram);
  if (!diceGl.getProgramParameter(diceProgram, diceGl.LINK_STATUS)) throw new Error(diceGl.getProgramInfoLog(diceProgram) || "Dice shader link failed");
  diceBuffer = diceGl.createBuffer();
  diceGl.bindBuffer(diceGl.ARRAY_BUFFER, diceBuffer);
  diceGl.bufferData(diceGl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), diceGl.STATIC_DRAW);
}

function boardMetrics(size) {
  const usableW = size.w * 0.88;
  const usableH = size.h * 0.80;
  const rByW = usableW / (SQRT3 * (HEX_GRID.cols + 0.5));
  const rByH = usableH / (HEX_Y_SCALE * (1.5 * (HEX_GRID.rows - 1) + 2));
  const r = Math.min(rByW, rByH);
  const boardW = SQRT3 * r * (HEX_GRID.cols + 0.5);
  const boardH = HEX_Y_SCALE * r * (1.5 * (HEX_GRID.rows - 1) + 2);
  return { r, originX: (size.w - boardW) * 0.5 + SQRT3 * r * 0.5, originY: size.h * 0.06 + Math.max(0, usableH - boardH) * 0.08, yScale: HEX_Y_SCALE };
}

function projectHex(col, row, size) {
  const metrics = boardMetrics(size);
  return { x: metrics.originX + SQRT3 * metrics.r * (col + (row % 2 ? 0.5 : 0)), y: metrics.originY + metrics.yScale * metrics.r * (1 + row * 1.5), r: metrics.r, yScale: metrics.yScale };
}

function nearestHex(clientX, clientY) {
  const rect = overlayCanvas.getBoundingClientRect();
  const size = { w: overlayCanvas.width, h: overlayCanvas.height };
  const x = (clientX - rect.left) * (overlayCanvas.width / Math.max(1, rect.width));
  const y = (clientY - rect.top) * (overlayCanvas.height / Math.max(1, rect.height));
  let best = null;
  let bestD = Infinity;
  for (let row = 0; row < HEX_GRID.rows; row += 1) {
    for (let col = 0; col < HEX_GRID.cols; col += 1) {
      const p = projectHex(col, row, size);
      const d = Math.hypot((x - p.x), (y - p.y) / p.yScale) / Math.max(1, p.r);
      if (d < bestD) { best = { col, row, id: `h-${col}-${row}` }; bestD = d; }
    }
  }
  return bestD < 0.94 ? best : null;
}

function tileAt(field, col, row) {
  return field?.tiles?.find((tile) => tile.col === col && tile.row === row) ?? null;
}

function unitAt(field, col, row) {
  return field?.units?.find((unit) => unit.col === col && unit.row === row && !unit.routed) ?? null;
}

function unitById(field, id) {
  return field?.units?.find((unit) => unit.id === id) ?? null;
}

function sectionForCol(col) {
  if (col <= 3) return "left";
  if (col >= 7) return "right";
  return "center";
}

function isRomeUnit(unit) { return unit?.army === "rome" && !unit.routed; }
function isWater(tile) { return tile?.terrainType === TERRAIN.water || tile?.label === TERRAIN.water; }
function isStopTerrain(tile) { return tile?.terrainType === TERRAIN.hill || tile?.terrainType === TERRAIN.fence || tile?.label === TERRAIN.hill || tile?.label === TERRAIN.fence; }
function isOccupied(field, col, row) { return Boolean(unitAt(field, col, row)); }
function inBounds(col, row) { return col >= 0 && col < HEX_GRID.cols && row >= 0 && row < HEX_GRID.rows; }

function neighbors(col, row) {
  const odd = row % 2 === 1;
  const dirs = odd
    ? [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]]
    : [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]];
  return dirs.map(([dc, dr]) => ({ col: col + dc, row: row + dr })).filter((hex) => inBounds(hex.col, hex.row));
}

function maxMoveFor(unit, maneuver) {
  if (!unit || !maneuver) return 0;
  if (maneuver.kind === "scout") return 3;
  if (maneuver.kind === "berserk") return 2;
  if (unit.troopType === "light") return 2;
  return 1;
}

function reachableHexes(field, unit, maxSteps) {
  const seen = new Set([`${unit.col},${unit.row}`]);
  const queue = [{ col: unit.col, row: unit.row, steps: 0 }];
  const results = [];
  while (queue.length) {
    const current = queue.shift();
    const currentTile = tileAt(field, current.col, current.row);
    const stopped = current.steps > 0 && isStopTerrain(currentTile);
    if (current.steps >= maxSteps || stopped) continue;
    for (const next of neighbors(current.col, current.row)) {
      const key = `${next.col},${next.row}`;
      if (seen.has(key)) continue;
      const tile = tileAt(field, next.col, next.row);
      if (!tile || isWater(tile) || isOccupied(field, next.col, next.row)) continue;
      seen.add(key);
      const entry = { ...next, id: `h-${next.col}-${next.row}`, steps: current.steps + 1, terrainType: tile.terrainType ?? tile.label };
      results.push(entry);
      queue.push(entry);
    }
  }
  return results;
}

function adjacentEnemies(field, unit) {
  return neighbors(unit.col, unit.row)
    .map((hex) => unitAt(field, hex.col, hex.row))
    .filter((target) => target?.army === "enemy" && !target.routed);
}

function connectedLineGroup(field, seedUnit) {
  const group = [];
  const seen = new Set();
  const queue = [seedUnit];
  while (queue.length && group.length < 7) {
    const unit = queue.shift();
    if (!isRomeUnit(unit) || seen.has(unit.id)) continue;
    seen.add(unit.id);
    group.push(unit);
    for (const hex of neighbors(unit.col, unit.row)) {
      const adjacent = unitAt(field, hex.col, hex.row);
      if (isRomeUnit(adjacent) && !seen.has(adjacent.id)) queue.push(adjacent);
    }
  }
  return group;
}

function eligibleUnits(field) {
  const maneuver = state.activeManeuver;
  if (!maneuver) return field.units.filter(isRomeUnit);
  if (maneuver.kind === "advance") return field.units.filter((unit) => isRomeUnit(unit) && sectionForCol(unit.col) === maneuver.section && !state.movedUnitIds.has(unit.id));
  if (maneuver.kind === "heavyBrigade") return field.units.filter((unit) => isRomeUnit(unit) && unit.troopType === "heavy" && !state.movedUnitIds.has(unit.id));
  if (maneuver.kind === "lineBrigade") return field.units.filter((unit) => isRomeUnit(unit) && (state.selectedGroupIds.size ? state.selectedGroupIds.has(unit.id) : true) && !state.movedUnitIds.has(unit.id));
  return field.units.filter((unit) => isRomeUnit(unit) && !state.movedUnitIds.has(unit.id));
}

function maneuverForId(id) { return MANEUVERS[id] ?? null; }

function startManeuver(id, field) {
  const maneuver = maneuverForId(id);
  if (!maneuver || !field) return false;
  if (state.activeManeuver) cancelSelectionOnly();
  if (state.actionPoints < maneuver.cost) {
    state.deniedUntil = performance.now() + 420;
    return false;
  }
  state.actionPoints -= maneuver.cost;
  state.activeManeuver = maneuver;
  state.phase = maneuver.kind === "lineBrigade" ? "pickLine" : "pickUnit";
  state.remainingMoves = maneuver.kind === "advance" ? rollDie() : 1;
  state.selectedUnitId = null;
  state.selectedGroupIds = new Set();
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  state.lastMoveEndedTurn = false;
  state.lastAttack = null;
  if (maneuver.kind === "advance") showDice([state.remainingMoves], maneuver.id);
  if (maneuver.kind === "heavyBrigade") {
    state.selectedGroupIds = new Set(field.units.filter((unit) => isRomeUnit(unit) && unit.troopType === "heavy").map((unit) => unit.id));
  }
  return true;
}

function cancelSelectionOnly() {
  state.phase = state.activeManeuver ? (state.activeManeuver.kind === "lineBrigade" && !state.selectedGroupIds.size ? "pickLine" : "pickUnit") : "idle";
  state.selectedUnitId = null;
  state.reachable = [];
  state.attackTargets = [];
}

function completeManeuver() {
  state.activeManeuver = null;
  state.phase = "idle";
  state.remainingMoves = 0;
  state.selectedUnitId = null;
  state.selectedGroupIds = new Set();
  state.movedUnitIds = new Set();
  state.reachable = [];
  state.attackTargets = [];
  state.turn += 1;
  if ((state.turn - 1) % 3 === 0) rollActionPoints();
}

function selectUnitForManeuver(field, unit) {
  if (!isRomeUnit(unit)) return false;
  if (!state.activeManeuver) {
    const section = sectionForCol(unit.col);
    const id = section === "left" ? "advanceLeft" : section === "right" ? "advanceRight" : "advanceCenter";
    if (!startManeuver(id, field)) return false;
  }
  const maneuver = state.activeManeuver;
  if (maneuver.kind === "lineBrigade" && !state.selectedGroupIds.size) {
    const group = connectedLineGroup(field, unit);
    state.selectedGroupIds = new Set(group.map((entry) => entry.id));
  }
  if (!eligibleUnits(field).some((candidate) => candidate.id === unit.id)) return false;
  state.selectedUnitId = unit.id;
  state.phase = "move";
  state.reachable = reachableHexes(field, unit, maxMoveFor(unit, maneuver));
  state.attackTargets = [];
  return true;
}

function moveSelectedUnit(field, target) {
  const unit = unitById(field, state.selectedUnitId);
  if (!unit || !target) return false;
  if (!state.reachable.some((hex) => hex.col === target.col && hex.row === target.row)) return false;
  unit.col = target.col;
  unit.row = target.row;
  state.movedUnitIds.add(unit.id);
  state.reachable = [];
  state.selectedUnitId = unit.id;
  const tile = tileAt(field, target.col, target.row);
  if (state.activeManeuver?.kind === "berserk") {
    const targets = adjacentEnemies(field, unit);
    if (targets.length) {
      state.phase = "attack";
      state.attackTargets = targets.map((enemy) => ({ id: enemy.id, col: enemy.col, row: enemy.row }));
      return true;
    }
  }
  if (isStopTerrain(tile)) {
    state.lastMoveEndedTurn = true;
    completeManeuver();
    return true;
  }
  state.remainingMoves -= 1;
  if (state.activeManeuver?.kind !== "advance") {
    const remainingGroup = eligibleUnits(field).filter((candidate) => !state.movedUnitIds.has(candidate.id));
    if (!remainingGroup.length || state.activeManeuver?.kind === "scout") completeManeuver();
    else cancelSelectionOnly();
    return true;
  }
  if (state.remainingMoves <= 0) completeManeuver(); else cancelSelectionOnly();
  return true;
}

function attackTarget(field, unit) {
  if (!unit || unit.army !== "enemy") return false;
  if (!state.attackTargets.some((target) => target.id === unit.id)) return false;
  unit.disrupted = true;
  unit.hitPulse = performance.now();
  state.lastAttack = { attackerId: state.selectedUnitId, targetId: unit.id, turn: state.turn };
  completeManeuver();
  return true;
}

function onPointerMove(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const field = getBattlefield(snapshot);
  const hex = nearestHex(event.clientX, event.clientY);
  const unit = hex ? unitAt(field, hex.col, hex.row) : null;
  state.hoveredHexId = hex?.id ?? null;
  state.hoveredUnitId = unit?.army === "rome" ? unit.id : null;
}

function onPointerDown(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const field = getBattlefield(snapshot);
  const hex = nearestHex(event.clientX, event.clientY);
  if (!hex) return;
  const clickedUnit = unitAt(field, hex.col, hex.row);
  if (state.phase === "attack" && clickedUnit?.army === "enemy") {
    attackTarget(field, clickedUnit);
    return;
  }
  if (state.selectedUnitId && state.reachable.some((target) => target.col === hex.col && target.row === hex.row)) {
    moveSelectedUnit(field, hex);
    return;
  }
  if (clickedUnit?.army === "rome") selectUnitForManeuver(field, clickedUnit);
}

function drawHexFill(ctx, p, color, alpha = 0.35) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * TAU / 6;
    const x = p.x + Math.cos(angle) * p.r * 0.92;
    const y = p.y + Math.sin(angle) * p.r * p.yScale * 0.92;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHexStroke(ctx, p, color, width = 3, alpha = 0.85) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, width);
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * TAU / 6;
    const x = p.x + Math.cos(angle) * p.r * 0.96;
    const y = p.y + Math.sin(angle) * p.r * p.yScale * 0.96;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function squadLayout(unit) {
  if (unit.troopType === "heavy") return [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1]];
  if (unit.troopType === "medium") return [[-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0], [-1, 1], [0, 1], [1, 1]];
  return [[-1, 0], [0, 0], [1, 0], [-0.5, 1], [0.5, 1]];
}

function drawDirectionalShadow(x, y, s, yScale) {
  overlayCtx.save();
  overlayCtx.fillStyle = "rgba(0,0,0,0.20)";
  overlayCtx.beginPath();
  overlayCtx.moveTo(x - s * 0.22, y + s * 0.35 * yScale);
  overlayCtx.lineTo(x + s * 0.12, y + s * 0.42 * yScale);
  overlayCtx.lineTo(x + s * 0.76, y + s * 0.20 * yScale);
  overlayCtx.lineTo(x + s * 0.42, y + s * 0.10 * yScale);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.restore();
}

function drawSelectionPennant(x, y, s, unit, selected, hovered) {
  if (!selected && !hovered) return;
  overlayCtx.save();
  overlayCtx.globalAlpha = selected ? 0.95 : 0.68;
  overlayCtx.strokeStyle = unit.bandColor;
  overlayCtx.lineWidth = Math.max(1, s * 0.10);
  overlayCtx.beginPath();
  overlayCtx.moveTo(x, y - s * 1.35);
  overlayCtx.lineTo(x, y - s * 2.10);
  overlayCtx.stroke();
  overlayCtx.fillStyle = unit.bandColor;
  overlayCtx.beginPath();
  overlayCtx.moveTo(x, y - s * 2.08);
  overlayCtx.lineTo(x + s * 0.55, y - s * 1.92);
  overlayCtx.lineTo(x, y - s * 1.76);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.restore();
}

function drawLowPolySoldier(x, y, s, unit, yScale, index, total) {
  const armor = unit.troopType === "heavy" ? "#b9af93" : unit.troopType === "medium" ? "#878d96" : "#7a6b59";
  const shieldW = unit.troopType === "heavy" ? s * 0.30 : unit.troopType === "medium" ? s * 0.24 : s * 0.18;
  const shieldH = unit.troopType === "heavy" ? s * 0.42 : unit.troopType === "medium" ? s * 0.34 : s * 0.24;
  const spear = unit.troopType !== "light" || index % 2 === 0;
  drawDirectionalShadow(x, y, s, yScale);
  overlayCtx.save();
  if (spear) {
    overlayCtx.strokeStyle = "#7b5a33";
    overlayCtx.lineWidth = Math.max(1, s * 0.08);
    overlayCtx.beginPath();
    overlayCtx.moveTo(x + s * 0.28, y - s * 0.02);
    overlayCtx.lineTo(x + s * 0.34, y - s * 1.0);
    overlayCtx.stroke();
  }
  overlayCtx.fillStyle = "#493225";
  overlayCtx.beginPath();
  overlayCtx.moveTo(x - s * 0.15, y + s * 0.36 * yScale);
  overlayCtx.lineTo(x - s * 0.04, y + s * 0.02 * yScale);
  overlayCtx.lineTo(x + s * 0.03, y + s * 0.36 * yScale);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.beginPath();
  overlayCtx.moveTo(x + s * 0.15, y + s * 0.36 * yScale);
  overlayCtx.lineTo(x + s * 0.04, y + s * 0.02 * yScale);
  overlayCtx.lineTo(x - s * 0.03, y + s * 0.36 * yScale);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.fillStyle = unit.bodyColor;
  overlayCtx.beginPath();
  overlayCtx.moveTo(x - s * 0.25, y - s * 0.02);
  overlayCtx.lineTo(x + s * 0.25, y - s * 0.02);
  overlayCtx.lineTo(x + s * 0.17, y - s * 0.50);
  overlayCtx.lineTo(x - s * 0.17, y - s * 0.50);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.fillStyle = unit.bandColor;
  overlayCtx.fillRect(x - s * 0.23, y - s * 0.28, s * 0.46, s * 0.10);
  overlayCtx.fillStyle = armor;
  overlayCtx.beginPath();
  overlayCtx.moveTo(x - s * 0.28, y - s * 0.08);
  overlayCtx.lineTo(x - s * 0.28 - shieldW * 0.44, y - shieldH * 0.15);
  overlayCtx.lineTo(x - s * 0.28 - shieldW * 0.36, y - shieldH * 0.88);
  overlayCtx.lineTo(x - s * 0.14, y - shieldH);
  overlayCtx.lineTo(x - s * 0.02, y - shieldH * 0.82);
  overlayCtx.lineTo(x - s * 0.06, y - s * 0.06);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.fillStyle = unit.bandColor;
  overlayCtx.fillRect(x - s * 0.28, y - shieldH * 0.68, shieldW * 0.50, s * 0.06);
  overlayCtx.fillStyle = "#d2b38a";
  overlayCtx.beginPath();
  overlayCtx.arc(x, y - s * 0.64, s * 0.12, 0, TAU);
  overlayCtx.fill();
  overlayCtx.fillStyle = armor;
  overlayCtx.beginPath();
  overlayCtx.moveTo(x - s * 0.16, y - s * 0.68);
  overlayCtx.lineTo(x + s * 0.16, y - s * 0.68);
  overlayCtx.lineTo(x + s * 0.10, y - s * 0.84);
  overlayCtx.lineTo(x - s * 0.10, y - s * 0.84);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.restore();
}

function drawSquad(unit, size) {
  const p = projectHex(unit.col, unit.row, size);
  const selected = state.selectedUnitId === unit.id || selectedUnitId === unit.id;
  const hovered = state.hoveredUnitId === unit.id;
  const layout = squadLayout(unit);
  const scale = p.r * (unit.troopType === "heavy" ? 0.23 : unit.troopType === "medium" ? 0.20 : 0.18);
  const spacingX = scale * (unit.troopType === "heavy" ? 1.55 : 1.65);
  const spacingY = scale * p.yScale * 1.70;
  const lift = selected ? -p.r * 0.060 : hovered ? -p.r * 0.028 : 0;
  overlayCtx.save();
  overlayCtx.filter = selected ? "brightness(1.16) saturate(1.08)" : hovered ? "brightness(1.06)" : "none";
  for (let i = 0; i < layout.length; i += 1) {
    const [lx, ly] = layout[i];
    const x = p.x + lx * spacingX;
    const y = p.y + ly * spacingY - scale * 0.20 + ly * 0.10 * p.r * p.yScale + lift;
    drawLowPolySoldier(x, y, scale, unit, p.yScale, i, layout.length);
    if (i === Math.floor(layout.length / 2)) drawSelectionPennant(x + scale * 0.46, y - scale * 0.10, scale, unit, selected, hovered);
  }
  overlayCtx.restore();
}

function drawHighlights(field, size) {
  const now = performance.now();
  const eligible = eligibleUnits(field);
  for (const unit of eligible) {
    const p = projectHex(unit.col, unit.row, size);
    drawHexStroke(overlayCtx, p, "rgba(246,211,112,.78)", p.r * 0.040, 0.65);
  }
  if (state.activeManeuver?.kind === "advance") {
    for (const tile of field.tiles) {
      if (sectionForCol(tile.col) === state.activeManeuver.section) drawHexFill(overlayCtx, projectHex(tile.col, tile.row, size), "#e1b844", 0.10);
    }
  }
  for (const target of state.reachable) {
    drawHexFill(overlayCtx, projectHex(target.col, target.row, size), "#56d37a", 0.24);
    drawHexStroke(overlayCtx, projectHex(target.col, target.row, size), "rgba(126,244,154,.86)", 2, 0.88);
  }
  for (const target of state.attackTargets) {
    drawHexFill(overlayCtx, projectHex(target.col, target.row, size), "#d63a31", 0.30);
    drawHexStroke(overlayCtx, projectHex(target.col, target.row, size), "rgba(255,95,72,.92)", 3, 0.92);
  }
  if (state.deniedUntil > now) {
    overlayCtx.save();
    overlayCtx.globalAlpha = (state.deniedUntil - now) / 420 * 0.22;
    overlayCtx.fillStyle = "#b93026";
    overlayCtx.fillRect(0, 0, size.w, size.h);
    overlayCtx.restore();
  }
}

function drawHexFill(ctx, p, color, alpha = 0.35) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * TAU / 6;
    const x = p.x + Math.cos(angle) * p.r * 0.92;
    const y = p.y + Math.sin(angle) * p.r * p.yScale * 0.92;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHexStroke(ctx, p, color, width = 3, alpha = 0.85) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, width);
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + i * TAU / 6;
    const x = p.x + Math.cos(angle) * p.r * 0.96;
    const y = p.y + Math.sin(angle) * p.r * p.yScale * 0.96;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawDiceFallback(size) {
  if (!state.dice.active) return;
  const age = performance.now() - state.dice.startedAt;
  const alpha = clamp(1 - age / state.dice.duration, 0, 1);
  if (alpha <= 0) { state.dice.active = false; return; }
  const faces = state.dice.faces;
  overlayCtx.save();
  overlayCtx.globalAlpha = alpha;
  for (let i = 0; i < faces.length; i += 1) {
    const x = size.w * (faces.length === 1 ? 0.50 : i === 0 ? 0.43 : 0.57);
    const y = size.h * 0.40;
    const s = Math.min(size.w, size.h) * 0.085;
    overlayCtx.fillStyle = "#b92d20";
    overlayCtx.strokeStyle = "#f3c879";
    overlayCtx.lineWidth = Math.max(2, s * 0.05);
    overlayCtx.beginPath();
    overlayCtx.roundRect(x - s, y - s, s * 2, s * 2, s * 0.22);
    overlayCtx.fill();
    overlayCtx.stroke();
    drawDicePips2D(x, y, s, faces[i]);
  }
  overlayCtx.restore();
}

function drawDicePips2D(x, y, s, face) {
  const spots = {
    1: [[0, 0]],
    2: [[-0.36, -0.36], [0.36, 0.36]],
    3: [[-0.36, -0.36], [0, 0], [0.36, 0.36]],
    4: [[-0.36, -0.36], [0.36, 0.36], [-0.36, 0.36], [0.36, -0.36]],
    5: [[-0.36, -0.36], [0.36, 0.36], [-0.36, 0.36], [0.36, -0.36], [0, 0]],
    6: [[-0.36, -0.36], [0.36, 0.36], [-0.36, 0.36], [0.36, -0.36], [-0.36, 0], [0.36, 0]]
  }[face] ?? [];
  overlayCtx.fillStyle = "#1a0b08";
  for (const [dx, dy] of spots) {
    overlayCtx.beginPath();
    overlayCtx.arc(x + dx * s, y + dy * s, s * 0.075, 0, TAU);
    overlayCtx.fill();
  }
}

function renderDiceWebGl(size) {
  if (!diceGl || !diceProgram) { drawDiceFallback(size); return; }
  const age = performance.now() - state.dice.startedAt;
  const alpha = state.dice.active ? clamp(1 - age / state.dice.duration, 0, 1) : 0;
  if (state.dice.active && alpha <= 0) state.dice.active = false;
  diceCanvas.style.display = alpha > 0 ? "block" : "none";
  diceGl.viewport(0, 0, size.w, size.h);
  diceGl.clearColor(0, 0, 0, 0);
  diceGl.clear(diceGl.COLOR_BUFFER_BIT);
  if (alpha <= 0) return;
  diceGl.useProgram(diceProgram);
  diceGl.bindBuffer(diceGl.ARRAY_BUFFER, diceBuffer);
  const location = diceGl.getAttribLocation(diceProgram, "a_position");
  diceGl.enableVertexAttribArray(location);
  diceGl.vertexAttribPointer(location, VERTEX_STRIDE, diceGl.FLOAT, false, 0, 0);
  diceGl.uniform2f(diceGl.getUniformLocation(diceProgram, "u_resolution"), size.w, size.h);
  diceGl.uniform1f(diceGl.getUniformLocation(diceProgram, "u_time"), clamp(age / state.dice.duration, 0, 1));
  diceGl.uniform1f(diceGl.getUniformLocation(diceProgram, "u_face1"), state.dice.faces[0] ?? 1);
  diceGl.uniform1f(diceGl.getUniformLocation(diceProgram, "u_face2"), state.dice.faces[1] ?? 1);
  diceGl.uniform1f(diceGl.getUniformLocation(diceProgram, "u_count"), state.dice.faces.length);
  diceGl.uniform1f(diceGl.getUniformLocation(diceProgram, "u_alpha"), alpha);
  diceGl.enable(diceGl.BLEND);
  diceGl.blendFunc(diceGl.SRC_ALPHA, diceGl.ONE_MINUS_SRC_ALPHA);
  diceGl.drawArrays(diceGl.TRIANGLES, 0, 6);
}

function frame() {
  ensureOverlays();
  hideSupersededLayers();
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const active = snapshot.mode === "battlefield";
  overlayCanvas.style.display = active ? "block" : "none";
  overlayCanvas.style.pointerEvents = active ? "auto" : "none";
  diceCanvas.style.display = active && state.dice.active ? "block" : "none";
  if (active) {
    const field = getBattlefield(snapshot);
    if (!state.initialized || state.regionId !== field.regionId) resetBattleState(field.regionId ?? "latium");
    const size = resize();
    overlayCtx.clearRect(0, 0, size.w, size.h);
    drawHighlights(field, size);
    field.units.filter((unit) => !unit.routed).sort((a, b) => a.row - b.row || a.col - b.col).forEach((unit) => drawSquad(unit, size));
    renderDiceWebGl(size);
  }
  requestAnimationFrame(frame);
}

function hideSupersededLayers() {
  for (const id of ["#cavalry-hex-squad-canvas", "#cavalry-hex-unit-canvas"]) {
    const node = document.querySelector(id);
    if (!node) continue;
    node.style.opacity = "0";
    node.style.pointerEvents = "none";
  }
}

function handleKey(event) {
  const snapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  if (snapshot.mode !== "battlefield") return;
  const id = KEY_TO_MANEUVER[event.key];
  if (id) {
    event.preventDefault();
    startManeuver(id, getBattlefield(snapshot));
  }
  if (event.key === "Escape") {
    event.preventDefault();
    cancelSelectionOnly();
  }
}

function patchGameHost() {
  const host = globalThis.GameHost;
  if (!host || host.__cavalryGameplayPatched) return false;
  const originalSnapshot = typeof host.getSnapshot === "function" ? host.getSnapshot.bind(host) : () => ({});
  host.getSnapshot = () => {
    const snapshot = originalSnapshot() ?? {};
    return {
      ...snapshot,
      tacticalGameplay: {
        style: GAMEPLAY_STYLE,
        turn: state.turn,
        actionPoints: state.actionPoints,
        activeManeuver: state.activeManeuver?.id ?? null,
        phase: state.phase,
        remainingMoves: state.remainingMoves,
        selectedUnitId: state.selectedUnitId,
        hoveredUnitId: state.hoveredUnitId,
        hoveredHexId: state.hoveredHexId,
        reachable: state.reachable.map((hex) => ({ col: hex.col, row: hex.row, steps: hex.steps })),
        attackTargets: state.attackTargets,
        lastAttack: state.lastAttack,
        dice: { faces: state.dice.faces, reason: state.dice.reason, active: state.dice.active },
        maneuvers: Object.values(MANEUVERS).map(({ id, label, cost, kind, section }) => ({ id, label, cost, kind, section }))
      }
    };
  };
  host.startManeuver = (id) => startManeuver(id, getBattlefield(originalSnapshot() ?? {}));
  host.getTacticalGameplaySnapshot = () => host.getSnapshot().tacticalGameplay;
  host.__cavalryGameplayPatched = true;
  return true;
}

function boot() {
  window.CavalryHexGameplay = {
    style: GAMEPLAY_STYLE,
    maneuvers: MANEUVERS,
    startManeuver: (id) => startManeuver(id, getBattlefield(globalThis.GameHost?.getSnapshot?.() ?? {})),
    rollDie,
    getState: () => ({ turn: state.turn, actionPoints: state.actionPoints, activeManeuver: state.activeManeuver?.id ?? null, phase: state.phase })
  };
  window.addEventListener("keydown", handleKey);
  const patchTimer = setInterval(() => {
    if (patchGameHost()) clearInterval(patchTimer);
    lastPatchAttempts += 1;
    if (lastPatchAttempts > 240) clearInterval(patchTimer);
  }, 100);
  ensureOverlays();
  requestAnimationFrame(frame);
}

boot();
