import { clamp, distance, distance2, forwardFromYaw, normalize2, rightFromYaw, wrapAngle } from "./math.js";

export const FOGLINE_RELAY_KIT_VERSION = "0.2.0";

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function relayMap(level) {
  return Object.fromEntries((level.relays ?? []).map((relay) => [relay.id, relay]));
}

function createInitialState(level, version = FOGLINE_RELAY_KIT_VERSION) {
  const spawn = level.spawn ?? { x: 0, z: 0, yaw: 0 };
  return {
    id: level.id ?? "fogline-relay",
    version,
    mode: "playing",
    status: "Find the first blue relay.",
    prompt: "Hold E near a glowing relay.",
    lastReject: null,
    sequence: { id: "intro", prompt: "Follow the blue signal through the fog." },
    player: {
      x: Number(spawn.x ?? 0),
      z: Number(spawn.z ?? 0),
      yaw: Number(spawn.yaw ?? 0),
      health: 100,
      speed: 7.6,
      scan: { targetId: null, progress: 0 }
    },
    relays: (level.relays ?? []).map((relay) => ({
      id: relay.id,
      label: relay.label ?? relay.id,
      x: Number(relay.x ?? 0),
      z: Number(relay.z ?? 0),
      scanned: false,
      scanProgress: 0
    })),
    gate: {
      id: level.gate?.id ?? "gate",
      x: Number(level.gate?.x ?? 0),
      z: Number(level.gate?.z ?? 42),
      radius: Number(level.gate?.radius ?? 3.2),
      open: false,
      entered: false,
      openProgress: 0
    },
    wraiths: (level.wraiths ?? []).map((wraith) => ({
      id: wraith.id,
      anchorX: Number(wraith.x ?? 0),
      anchorZ: Number(wraith.z ?? 0),
      x: Number(wraith.x ?? 0),
      z: Number(wraith.z ?? 0),
      phase: Number(wraith.phase ?? 0),
      patrolRadius: Number(wraith.patrolRadius ?? 4),
      mode: "patrol",
      damageCooldown: 0
    })),
    stats: { scanned: 0, damageTaken: 0, rejected: 0, restarts: 0, elapsed: 0 },
    input: { moveX: 0, moveZ: 0, turn: 0, scan: false }
  };
}

function inBounds(player, bounds = {}) {
  return {
    x: clamp(player.x, Number(bounds.minX ?? -20), Number(bounds.maxX ?? 20)),
    z: clamp(player.z, Number(bounds.minZ ?? -10), Number(bounds.maxZ ?? 50))
  };
}

function nearestScannableRelay(state, level) {
  const relaysById = relayMap(level);
  const forward = forwardFromYaw(state.player.yaw);
  let best = null;
  for (const relay of state.relays) {
    if (relay.scanned) continue;
    const source = relaysById[relay.id] ?? relay;
    const dx = relay.x - state.player.x;
    const dz = relay.z - state.player.z;
    const d = Math.hypot(dx, dz);
    const radius = Number(source.metadata?.scanRadius ?? source.scanRadius ?? 3.2);
    if (d > radius) continue;
    const dot = d > 0.0001 ? (dx / d) * forward.x + (dz / d) * forward.z : 1;
    if (dot < 0.5) continue;
    const score = d - dot * 1.5;
    if (!best || score < best.score) best = { relay, distance: d, dot, score };
  }
  return best;
}

function updateMovement(state, input, level, dt) {
  state.player.yaw = wrapAngle(state.player.yaw + Number(input.turn ?? 0));
  const move = normalize2(Number(input.moveX ?? 0), Number(input.moveZ ?? 0));
  const forward = forwardFromYaw(state.player.yaw);
  const right = rightFromYaw(state.player.yaw);
  const speed = Number(state.player.speed ?? 7.6) * (state.mode === "failed" || state.mode === "complete" ? 0 : 1);
  state.player.x += (right.x * move.x + forward.x * move.z) * speed * dt;
  state.player.z += (right.z * move.x + forward.z * move.z) * speed * dt;
  const bounded = inBounds(state.player, level.bounds);
  state.player.x = bounded.x;
  state.player.z = bounded.z;
}

function updateScan(state, input, level, world, events, objectiveFlowAction, dt) {
  const candidate = nearestScannableRelay(state, level);
  const targetId = candidate?.relay?.id ?? null;
  if (!input.scan || !candidate) {
    state.player.scan = { targetId, progress: targetId ? state.player.scan.progress * 0.92 : 0 };
    if (input.scan && !candidate) {
      state.lastReject = "No relay in range.";
      state.stats.rejected += 1;
    }
    return;
  }

  const same = state.player.scan.targetId === targetId;
  const progress = clamp((same ? state.player.scan.progress : 0) + dt * 0.82, 0, 1);
  state.player.scan = { targetId, progress };
  candidate.relay.scanProgress = progress;
  state.status = `Linking ${candidate.relay.label}…`;
  state.prompt = "Hold scan.";

  if (progress >= 1 && !candidate.relay.scanned) {
    candidate.relay.scanned = true;
    candidate.relay.scanProgress = 1;
    state.stats.scanned += 1;
    state.player.scan = { targetId: null, progress: 0 };
    state.status = `${candidate.relay.label} linked.`;
    state.prompt = state.stats.scanned >= state.relays.length ? "The gate is opening." : "Find the next relay.";
    world.emit(events.RelayScanned, { relayId: candidate.relay.id, scanned: state.stats.scanned });
    if (objectiveFlowAction) world.emit(objectiveFlowAction, { action: "scan", targetId: candidate.relay.id });
  }
}

function updateGate(state, world, events, objectiveFlowAction, dt) {
  const allScanned = state.relays.every((relay) => relay.scanned);
  if (allScanned && !state.gate.open) {
    state.gate.openProgress = clamp(state.gate.openProgress + dt * 0.75, 0, 1);
    state.status = "Gate opening through the fog.";
    state.prompt = "Reach the bright gate.";
    if (state.gate.openProgress >= 1) {
      state.gate.open = true;
      world.emit(events.GateOpened, { gateId: state.gate.id });
    }
  }

  if (state.gate.open && !state.gate.entered && distance2(state.player, state.gate) <= state.gate.radius * state.gate.radius) {
    state.gate.entered = true;
    state.mode = "complete";
    state.status = "Relay complete.";
    state.prompt = "Signal restored.";
    world.emit(events.GateEntered, { gateId: state.gate.id });
    if (objectiveFlowAction) world.emit(objectiveFlowAction, { action: "enter", gateId: state.gate.id });
  }
}

function updateWraiths(state, world, events, dt) {
  for (const wraith of state.wraiths) {
    wraith.damageCooldown = Math.max(0, Number(wraith.damageCooldown ?? 0) - dt);
    const toPlayer = distance(wraith, state.player);
    const chase = toPlayer < 8.2 && state.mode === "playing";
    wraith.mode = chase ? "chase" : "patrol";
    if (chase) {
      const dx = state.player.x - wraith.x;
      const dz = state.player.z - wraith.z;
      const d = Math.hypot(dx, dz) || 1;
      const speed = 3.7;
      wraith.x += dx / d * speed * dt;
      wraith.z += dz / d * speed * dt;
    } else {
      const t = state.stats.elapsed * 0.58 + wraith.phase;
      wraith.x = wraith.anchorX + Math.cos(t) * wraith.patrolRadius;
      wraith.z = wraith.anchorZ + Math.sin(t * 0.84) * wraith.patrolRadius;
    }

    if (distance(wraith, state.player) < 1.45 && wraith.damageCooldown <= 0 && state.mode === "playing") {
      wraith.damageCooldown = 1.1;
      state.player.health = clamp(state.player.health - 18, 0, 100);
      state.stats.damageTaken += 18;
      state.status = "The fog bites.";
      state.prompt = "Move away from the red wraith.";
      world.emit(events.PlayerDamaged, { amount: 18, health: state.player.health, sourceId: wraith.id });
      if (state.player.health <= 0) {
        state.mode = "failed";
        state.status = "Signal lost.";
        state.prompt = "Press R to restart.";
        world.emit(events.PlayerFailed, { reason: "wraith", sourceId: wraith.id });
      }
    }
  }
}

function updateSequence(state) {
  if (state.mode === "complete") {
    state.sequence = { id: "complete", prompt: "Signal restored." };
  } else if (state.mode === "failed") {
    state.sequence = { id: "failure", prompt: "Press R to restart." };
  } else if (state.gate.open) {
    state.sequence = { id: "gate", prompt: "Reach the open gate." };
  } else if (state.stats.scanned > 0) {
    state.sequence = { id: "relay-chain", prompt: `${state.stats.scanned}/3 relays linked.` };
  } else if (state.wraiths.some((wraith) => wraith.mode === "chase")) {
    state.sequence = { id: "danger", prompt: "Red fog is hunting you." };
  } else {
    state.sequence = { id: "intro", prompt: "Follow the blue signal." };
  }
}

export function createFoglineRelayKit(NexusRealtime, config = {}) {
  const { defineResource, defineEvent, defineRuntimeKit } = NexusRealtime;
  const level = config.level ?? {};
  const FoglineRelayState = defineResource("foglineRelay.state");
  const FoglineRelayInput = defineEvent("foglineRelay.input");
  const RelayScanned = defineEvent("foglineRelay.relayScanned");
  const GateOpened = defineEvent("foglineRelay.gateOpened");
  const GateEntered = defineEvent("foglineRelay.gateEntered");
  const PlayerDamaged = defineEvent("foglineRelay.playerDamaged");
  const PlayerFailed = defineEvent("foglineRelay.playerFailed");

  const events = { RelayScanned, GateOpened, GateEntered, PlayerDamaged, PlayerFailed };

  function resetState(world, previous) {
    const next = createInitialState(level);
    next.stats.restarts = Number(previous?.stats?.restarts ?? 0) + 1;
    world.setResource(FoglineRelayState, next);
    if (config.objectiveFlowReset) world.emit(config.objectiveFlowReset, {});
    return next;
  }

  function system(world) {
    const previous = world.getResource(FoglineRelayState);
    if (!previous) return;
    const dt = clamp(world.__nexusClock?.delta ?? 1 / 60, 0, 1 / 30);
    const inputEvents = world.readEvents(FoglineRelayInput);
    const input = inputEvents[inputEvents.length - 1] ?? previous.input ?? {};

    if (input.restart) {
      resetState(world, previous);
      return;
    }

    const state = clone(previous);
    state.input = { moveX: Number(input.moveX ?? 0), moveZ: Number(input.moveZ ?? 0), turn: Number(input.turn ?? 0), scan: Boolean(input.scan) };
    state.stats.elapsed += dt;

    if (state.mode === "playing") {
      updateMovement(state, input, level, dt);
      updateScan(state, input, level, world, events, config.objectiveFlowAction, dt);
      updateGate(state, world, events, config.objectiveFlowAction, dt);
      updateWraiths(state, world, events, dt);
    }
    updateSequence(state);
    world.setResource(FoglineRelayState, state);
  }

  return defineRuntimeKit({
    id: config.kitId ?? "fogline-relay-kit",
    resources: { FoglineRelayState },
    events: { FoglineRelayInput, RelayScanned, GateOpened, GateEntered, PlayerDamaged, PlayerFailed },
    systems: [{ phase: "simulate", name: "foglineRelaySystem", system }],
    initWorld({ world }) {
      world.setResource(FoglineRelayState, createInitialState(level));
    },
    install({ engine, world }) {
      engine.foglineRelay = {
        input(payload = {}) {
          world.emit(FoglineRelayInput, payload);
          return world.getResource(FoglineRelayState);
        },
        restart() {
          world.emit(FoglineRelayInput, { restart: true });
          return world.getResource(FoglineRelayState);
        },
        getState() {
          return world.getResource(FoglineRelayState);
        },
        resources: { FoglineRelayState },
        events: { FoglineRelayInput, RelayScanned, GateOpened, GateEntered, PlayerDamaged, PlayerFailed }
      };
    },
    metadata: {
      version: FOGLINE_RELAY_KIT_VERSION,
      purpose: "Fogline Relay experiment gameplay: first-person movement intent, relay scanning, gate state, wraith hazards, and sequence prompt state."
    }
  });
}
