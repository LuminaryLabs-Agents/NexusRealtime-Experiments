import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
import { createGenericAnchorDescriptorKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-anchor-descriptor-kit/index.js";
import { createGenericModeProjectedRoute, createProjectedRoute } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/generic-mode-projected-route/index.js";
import { createNextLedgeClimbPreset } from "./climb-preset.js";
import { adaptProjectedRouteToClimbRoute } from "./climb-anchor-adapter.js";
import { createClimbActionAdapter } from "./climb-action-adapter.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, Number.isFinite(Number(v)) ? Number(v) : a));
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const d2 = (a, b) => Math.hypot(n(a.x) - n(b.x), n(a.y) - n(b.y));
const copy = (v) => typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));

function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  if (!len) return Math.hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function ropeNodes(start, end, count, wind = 0, slack = 0) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(1, count - 1);
    const sag = Math.sin(Math.PI * t) * slack;
    const sway = Math.sin(t * Math.PI * 2) * wind * Math.sin(Math.PI * t);
    return { x: start.x + (end.x - start.x) * t + sway, y: start.y + (end.y - start.y) * t - sag, z: 1 };
  });
}

function addEvent(state, type, payload = {}) {
  state.recentEvents.push({ type, at: state.frame, ...payload });
  if (state.recentEvents.length > 16) state.recentEvents.shift();
}

function aimFrom(state, payload = {}) {
  if (Number.isFinite(Number(payload.x)) || Number.isFinite(Number(payload.y))) {
    const dx = n(payload.x, state.player.x) - state.player.x;
    const dy = n(payload.y, state.player.y + 1) - state.player.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len, worldX: n(payload.x), worldY: n(payload.y) };
  }
  const dx = n(payload.dx, state.aim.x);
  const dy = n(payload.dy, state.aim.y);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, worldX: state.player.x + dx * 150, worldY: state.player.y + dy * 150 };
}

function createProjectedClimbRoute(options = {}) {
  const preset = createNextLedgeClimbPreset(options);
  const projectedRoute = createProjectedRoute(preset.routeProjection);
  const route = adaptProjectedRouteToClimbRoute(projectedRoute, { ...preset.climb, sector: preset.sector });
  return { preset, projectedRoute, route };
}

function createInitialState(options = {}, status = "SYS_STATUS: ACTIVE") {
  const sector = Math.max(1, Math.floor(n(options.sector, 1)));
  const { preset, projectedRoute, route } = createProjectedClimbRoute({ ...options, sector });
  const ropeLength = n(options.ropeLength, 52);
  const maxCable = n(options.maxCableLength, 150);
  const maxStamina = n(options.staminaMax, 100);
  const nodeCount = Math.max(4, Math.floor(n(options.ropeNodeCount, 12)));
  const start = route.ledges[0];
  const player = { x: start.x, y: start.y - ropeLength, z: 1, vx: 0, vy: 0, angle: 0, aVel: 0, scaleX: 1, scaleY: 1, scaleZ: 1, rotationX: 0, rotationY: 0 };
  return {
    version: "next-ledge-experiment-projected-route-0.1.0",
    levelId: route.id,
    frame: 0,
    sector,
    mode: "swinging",
    alive: true,
    completed: false,
    paused: false,
    status,
    preset,
    projectedRoute,
    route,
    currentAnchorId: start.id,
    lastLedgeId: start.id,
    anchorLedge: start,
    constants: { gravity: n(options.gravityBase, 0.052) + sector * n(options.gravityPerSector, 0.003), ropeLength, maxCableLength: maxCable, maxStamina, scaffoldBoundary: n(options.scaffoldBoundary, 166), ropeNodeCount: nodeCount },
    stamina: maxStamina,
    maxHeight: 0,
    wind: { strength: (sector - 1) * n(options.windPerSector, 0.006), offset: 0 },
    aim: { x: 0, y: 1, worldX: 0, worldY: maxCable },
    input: { axis: 0 },
    player,
    probe: { x: player.x, y: player.y, z: 1, vx: 0, vy: 0, ticks: 0, visible: false },
    rope: { visible: true, start, end: player, nodes: ropeNodes(start, player, nodeCount, 0, 8), targetLength: ropeLength },
    reeling: { ropeLength, anchorId: null },
    camera: { x: 0, y: player.y + 40, z: 210, targetY: player.y + 95 },
    reach: { x: player.x, y: player.y, r: maxCable },
    trajectory: [],
    effects: { sparks: [], trail: [] },
    enabledTargetIds: [],
    hoveredId: null,
    stats: { launches: 0, latches: 0, releases: 0, wallBounces: 0, rests: 0, falls: 0, sectorsCleared: sector - 1, rejected: 0 },
    recentEvents: []
  };
}

function ledgeMap(state) {
  return Object.fromEntries((state.route?.ledges ?? []).map((ledge) => [ledge.id, ledge]));
}

function enabledTargets(state) {
  if (!state.alive || state.completed) return [];
  return (state.route?.ledges ?? [])
    .filter((ledge) => ledge.id !== state.lastLedgeId && d2(ledge, state.player) <= state.constants.maxCableLength + ledge.r)
    .map((ledge) => ledge.id);
}

function setRope(state, a, b, slack = 8) {
  state.rope = {
    ...state.rope,
    start: { x: a.x, y: a.y, z: 1 },
    end: { x: b.x, y: b.y, z: 1 },
    nodes: ropeNodes(a, b, state.constants.ropeNodeCount, state.wind.strength * 18, slack),
    targetLength: d2(a, b) + slack
  };
}

function release(state) {
  state.mode = "falling";
  state.rope.visible = false;
  state.probe.visible = false;
  state.stats.releases += 1;
  state.status = "Tether released. Aim and fire before falling out of frame.";
  addEvent(state, "released", { x: state.player.x, y: state.player.y });
}

function launch(state) {
  if (state.stamina <= 0) return;
  const speed = 9.5;
  state.mode = "launched";
  state.lastLedgeId = state.currentAnchorId;
  state.probe = { x: state.player.x + state.aim.x * 8, y: state.player.y + state.aim.y * 8, z: 1, vx: state.aim.x * speed, vy: state.aim.y * speed + speed * 0.42, ticks: 0, visible: true };
  state.rope.visible = true;
  state.stamina = clamp(state.stamina - 4, 0, state.constants.maxStamina);
  state.stats.launches += 1;
  state.status = "Grapple fired. Cable sweep can latch nearby anchors.";
  addEvent(state, "grapple-fired", { x: state.probe.x, y: state.probe.y });
}

function grab(state, ledge) {
  state.mode = "reeling";
  state.anchorLedge = ledge;
  state.reeling = { anchorId: ledge.id, ropeLength: d2(ledge, state.player) + 24 };
  state.probe.visible = false;
  state.rope.visible = true;
  state.stats.latches += 1;
  state.status = `Latched ${ledge.label}. Winch pulling to swing radius.`;
  addEvent(state, "grapple-latched", { targetId: ledge.id, type: ledge.type });
}

function lock(state, ledge) {
  state.currentAnchorId = ledge.id;
  state.lastLedgeId = ledge.id;
  state.anchorLedge = ledge;
  state.player.angle = Math.atan2(state.player.x - ledge.x, ledge.y - state.player.y || 0.001);
  state.player.aVel = (state.player.vx >= 0 ? 1 : -1) * (Math.hypot(state.player.vx, state.player.vy) / state.constants.ropeLength) * 0.72;
  state.player.vx = 0;
  state.player.vy = 0;
  if (ledge.type === "summit") {
    state.mode = "won";
    state.completed = true;
    state.status = "Summit reclaimed. Sector clearance criteria reached.";
    addEvent(state, "summit-reached", { sector: state.sector });
  } else {
    state.mode = "swinging";
    if (ledge.type === "rest") {
      state.stamina = clamp(state.stamina + n(ledge.staminaRestore, 45), 0, state.constants.maxStamina);
      state.stats.rests += 1;
      state.status = "Restore unit synchronized. Stamina replenished.";
      addEvent(state, "restored", { targetId: ledge.id });
    } else {
      state.status = `Swinging from ${ledge.label}. Release when your arc feels right.`;
    }
  }
}

function fail(state, reason) {
  if (state.mode === "dead") return;
  state.mode = "dead";
  state.alive = false;
  state.rope.visible = false;
  state.probe.visible = false;
  state.stats.falls += 1;
  state.status = reason;
  addEvent(state, "failed", { reason });
}

function command(state) {
  if (["dead", "won"].includes(state.mode)) return;
  if (state.mode === "swinging" || state.mode === "reeling") release(state);
  else if (state.mode === "falling") launch(state);
  else if (state.mode === "launched") {
    state.mode = "retracting";
    state.status = "Grapple retracting.";
  }
}

function stepSwing(state, dt) {
  const ledge = ledgeMap(state)[state.currentAnchorId] ?? state.route.ledges[0];
  const axis = clamp(state.input.axis, -1, 1);
  const ropeLength = state.constants.ropeLength;
  let acc = -(state.constants.gravity / ropeLength) * Math.sin(state.player.angle) + axis * 0.0035;
  acc += state.wind.strength * Math.sin(state.wind.offset) * Math.cos(state.player.angle) / ropeLength;
  state.player.aVel = (state.player.aVel + acc) * 0.988;
  state.player.angle += state.player.aVel;
  state.player.x = ledge.x + Math.sin(state.player.angle) * ropeLength;
  state.player.y = ledge.y - Math.cos(state.player.angle) * ropeLength;
  state.player.vx = state.player.aVel * ropeLength * Math.cos(state.player.angle);
  state.player.vy = state.player.aVel * ropeLength * Math.sin(state.player.angle);
  state.stamina = clamp(state.stamina - (Math.abs(axis) ? 0.062 : 0.018) * (1 + state.sector * 0.15) * dt * 60, 0, state.constants.maxStamina);
  state.rope.visible = true;
  setRope(state, ledge, state.player, 8);
  if (state.stamina <= 0) release(state);
}

function fallPlayer(state, dt, drag = true) {
  const wind = state.wind.strength * Math.sin(state.wind.offset);
  state.player.vx += wind * 0.15 * dt * 60;
  state.player.vy -= state.constants.gravity * dt * 60;
  if (drag) {
    state.player.vx *= Math.pow(0.96, dt * 60);
    state.player.vy *= Math.pow(0.96, dt * 60);
  }
  state.player.x += state.player.vx * dt * 60;
  state.player.y += state.player.vy * dt * 60;
}

function stepLaunched(state, dt) {
  fallPlayer(state, dt, false);
  state.probe.ticks += 1;
  state.probe.vy -= state.constants.gravity * 1.75 * dt * 60;
  state.probe.x += state.probe.vx * dt * 60;
  state.probe.y += state.probe.vy * dt * 60;
  const gap = d2(state.player, state.probe);
  if (gap > state.constants.maxCableLength) {
    const r = state.constants.maxCableLength / gap;
    state.probe.x = state.player.x + (state.probe.x - state.player.x) * r;
    state.probe.y = state.player.y + (state.probe.y - state.player.y) * r;
  }
  setRope(state, state.player, state.probe, 14);
  for (const ledge of state.route.ledges) {
    if (ledge.id === state.lastLedgeId && state.probe.ticks < 10) continue;
    if (d2(ledge, state.probe) <= ledge.r + 9.5 || segmentDistance(ledge.x, ledge.y, state.player.x, state.player.y, state.probe.x, state.probe.y) <= ledge.r + 5) return grab(state, ledge);
  }
  if (state.probe.ticks > 70) state.mode = "retracting";
}

function stepRetracting(state, dt) {
  fallPlayer(state, dt);
  const gap = d2(state.player, state.probe);
  if (gap < 10) {
    state.mode = "falling";
    state.probe.visible = false;
    state.rope.visible = false;
    return;
  }
  const s = 15 * dt * 60;
  state.probe.x += (state.player.x - state.probe.x) / gap * s;
  state.probe.y += (state.player.y - state.probe.y) / gap * s;
  state.probe.visible = true;
  state.rope.visible = true;
  setRope(state, state.player, state.probe, 12);
}

function stepReeling(state, dt) {
  const anchor = state.anchorLedge ?? ledgeMap(state)[state.reeling.anchorId];
  const gap = d2(anchor, state.player) || 0.001;
  state.reeling.ropeLength = Math.max(state.constants.ropeLength, state.reeling.ropeLength - 1.85 * dt * 60);
  if (gap <= state.constants.ropeLength && state.reeling.ropeLength <= state.constants.ropeLength) return lock(state, anchor);
  if (gap > state.reeling.ropeLength) {
    state.player.vx += (anchor.x - state.player.x) / gap * 0.58 * dt * 60;
    state.player.vy += (anchor.y - state.player.y) / gap * 0.58 * dt * 60;
  }
  state.player.vy -= state.constants.gravity * 0.42 * dt * 60;
  state.player.vx *= Math.pow(0.942, dt * 60);
  state.player.vy *= Math.pow(0.942, dt * 60);
  state.player.x += state.player.vx * dt * 60;
  state.player.y += state.player.vy * dt * 60;
  setRope(state, anchor, state.player, Math.max(0, state.reeling.ropeLength - gap));
  state.stamina = clamp(state.stamina - 0.082 * dt * 60, 0, state.constants.maxStamina);
  if (state.stamina <= 0) release(state);
}

function updateDerived(state) {
  state.player.scaleX = clamp(1 + Math.abs(state.player.vx) * 0.038, 0.35, 2);
  state.player.scaleY = clamp(1 + Math.abs(state.player.vy) * 0.038, 0.35, 2);
  state.player.rotationX += 0.035;
  state.player.rotationY += state.player.vx * 0.04;
  state.camera.targetY = state.player.y + 55;
  state.camera.y += (state.camera.targetY - state.camera.y) * (["falling", "retracting"].includes(state.mode) ? 0.075 : 0.038);
  state.reach = { x: state.player.x, y: state.player.y, r: state.constants.maxCableLength };
  state.maxHeight = Math.max(state.maxHeight, Math.round(state.player.y / 10));
  state.enabledTargetIds = enabledTargets(state);
  state.trajectory = ["falling", "retracting"].includes(state.mode) ? Array.from({ length: 38 }, (_, i) => {
    let x = state.player.x, y = state.player.y, vx = state.player.vx, vy = state.player.vy;
    for (let s = 0; s < i; s += 1) { vy -= state.constants.gravity; vx *= 0.96; vy *= 0.96; x += vx; y += vy; }
    return { x, y, z: 1 };
  }) : [];
}

function stepState(state, dt) {
  if (!state.paused && !["dead", "won"].includes(state.mode)) {
    state.frame += 1;
    state.wind.offset += 0.045 * dt * 60;
    if (state.mode !== "swinging") state.input.axis = 0;
    if (state.mode === "swinging") stepSwing(state, dt);
    else if (state.mode === "falling") fallPlayer(state, dt);
    else if (state.mode === "launched") stepLaunched(state, dt);
    else if (state.mode === "retracting") stepRetracting(state, dt);
    else if (state.mode === "reeling") stepReeling(state, dt);
    if (state.player.x < -state.constants.scaffoldBoundary || state.player.x > state.constants.scaffoldBoundary) {
      state.player.x = clamp(state.player.x, -state.constants.scaffoldBoundary, state.constants.scaffoldBoundary);
      state.player.vx = -state.player.vx * 0.72;
      state.stats.wallBounces += 1;
      if (["swinging", "reeling"].includes(state.mode)) release(state);
    }
    if (["falling", "retracting"].includes(state.mode) && state.player.y < state.camera.y - 420) {
      fail(state, "Host aborted. Anchor connection lost below sector floor.");
    }
  }
  updateDerived(state);
}

function domainSnapshot(engine) {
  return {
    projectedRoute: engine.projectedRoute?.getState?.(),
    anchors: engine.anchorDescriptors?.getState?.(),
    objective: engine.objectiveFlow?.getState?.()
  };
}

export function createNextLedgeSession(options = {}) {
  let state = createInitialState(options);
  const level = {
    id: "next-ledge-projected-route-experiment",
    sceneRecipe: { id: "next-ledge-projected-route-scene", objects: [] },
    steps: state.preset.objective.steps
  };
  const engine = NexusRealtime.createRealtimeGame({
    kits: [
      NexusRealtime.createRenderDescriptorKit({ ...level, id: "next-ledge-render-descriptor-kit" }),
      NexusRealtime.createObjectiveFlowKit({ id: "next-ledge-objective-flow-kit", objectiveDataset: state.preset.objective }),
      createGenericAnchorDescriptorKit(NexusRealtime, { kitId: "next-ledge-anchor-descriptor-kit", anchors: state.projectedRoute.anchors }),
      createGenericModeProjectedRoute(NexusRealtime, { ...state.preset.routeProjection, kitId: "next-ledge-projected-route-kit" })
    ],
    renderer: typeof NexusRealtime.createRenderer === "function" ? NexusRealtime.createRenderer("headless") : undefined
  });

  function syncGeneratedRoute() {
    engine.anchorDescriptors?.setAnchors?.(state.projectedRoute.anchors, { reason: "next-ledge-climb-adapter" });
    engine.projectedRoute?.rebuild?.(state.preset.routeProjection, { reason: "next-ledge-climb-adapter" });
    engine.tick(0);
  }

  function restart(message = "Host resynced. Sector restarted.") {
    state = createInitialState({ ...options, sector: state.sector }, message);
    engine.objectiveFlow?.reset?.();
    syncGeneratedRoute();
    return snapshot();
  }

  function advanceSector(sector = state.sector + 1) {
    state = createInitialState({ ...options, sector }, "Ascending next sector. New anchor field generated.");
    engine.objectiveFlow?.reset?.();
    syncGeneratedRoute();
    addEvent(state, "sector-advanced", { sector: state.sector });
    return snapshot();
  }

  function applyInput(raw = {}) {
    const input = createClimbActionAdapter(raw);
    if (input.restart) restart();
    if (input.advanceSector) advanceSector();
    if (input.aimWorld) state.aim = { ...state.aim, ...aimFrom(state, input.aimWorld) };
    else if (input.aimVector) state.aim = { ...state.aim, ...aimFrom(state, input.aimVector) };
    state.input.axis = state.mode === "swinging" ? clamp(input.axis, -1, 1) : 0;
    if (input.action) command(state);
  }

  function syncObjective(beforeCount) {
    const events = state.recentEvents.slice(beforeCount);
    for (const evt of events) {
      if (evt.type === "restored") engine.objectiveFlow?.action?.("rest", { targetId: evt.targetId });
      if (evt.type === "summit-reached") engine.objectiveFlow?.action?.("summit", { sector: evt.sector });
    }
  }

  function update(dt, input = {}) {
    const beforeCount = state.recentEvents.length;
    applyInput(input);
    stepState(state, clamp(n(dt, 1 / 60), 0, 1 / 30));
    engine.tick(dt);
    syncObjective(beforeCount);
    return snapshot();
  }

  function snapshot() {
    return { ...copy(state), domain: domainSnapshot(engine) };
  }

  engine.nextLedge = {
    getState: () => snapshot(),
    getSnapshot: () => snapshot(),
    restart,
    advanceSector,
    swingAxis(axis = 0) { state.input.axis = state.mode === "swinging" ? clamp(axis, -1, 1) : 0; return snapshot(); },
    setAimWorld(x = 0, y = 1) { state.aim = { ...state.aim, ...aimFrom(state, { x, y }) }; return snapshot(); },
    setAimVector(dx = 0, dy = 1) { state.aim = { ...state.aim, ...aimFrom(state, { dx, dy }) }; return snapshot(); },
    action() { command(state); return snapshot(); }
  };

  syncGeneratedRoute();
  return { engine, NexusRealtime, level, update, snapshot, restart, advanceSector };
}
