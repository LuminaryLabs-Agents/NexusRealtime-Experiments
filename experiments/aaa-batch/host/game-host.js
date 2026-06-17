import { createActionContract } from "./action-contract.js";
import { createAffordanceContract } from "./affordance-contract.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeNodes(game) {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `${game.id}-node-${index + 1}`,
    x: 120 + index * 170,
    y: 160 + ((index * 83) % 230),
    charge: 0,
    secured: false
  }));
}

export function createAaaBatchGameHost(game) {
  const actionContract = createActionContract(game);
  const affordanceContract = createAffordanceContract(game);
  const state = {
    id: game.id,
    title: game.title,
    mode: "active",
    completed: false,
    failed: false,
    time: 0,
    score: 0,
    progress: 0,
    pressure: 0,
    resource: 100,
    resources: {
      primary: {
        id: "primary",
        label: `${game.verb} resource`,
        value: 100,
        min: 0,
        max: 100,
        empty: false,
        full: true
      }
    },
    player: { x: 90, y: 280, lane: 1, depth: 0 },
    nodes: makeNodes(game),
    recentEvents: ["booted"],
    kitStack: [...game.kitStack],
    objective: actionContract.smokeActions.join(" -> "),
    actionContract: {
      actions: actionContract.actions.map((action) => ({ ...action })),
      controls: [...actionContract.controls]
    },
    affordances: {
      available: affordanceContract.getAvailableAffordances({ mode: "active" }).map((affordance) => ({ ...affordance })),
      descriptors: affordanceContract.affordances.map((affordance) => ({ ...affordance, descriptor: { ...affordance.descriptor } }))
    },
    lastRejectionReason: null
  };

  function syncResources() {
    state.resources.primary.value = Number(state.resource.toFixed(3));
    state.resources.primary.empty = state.resource <= state.resources.primary.min;
    state.resources.primary.full = state.resource >= state.resources.primary.max;
  }

  function event(label) {
    state.recentEvents.unshift(label);
    state.recentEvents = state.recentEvents.slice(0, 8);
  }

  function completeNode(amount = 34) {
    const node = state.nodes.find((entry) => !entry.secured);
    if (!node) return;
    node.charge = Math.min(100, node.charge + amount);
    if (node.charge >= 100) {
      node.secured = true;
      state.score += 100;
      event(`${game.verb}: node secured`);
    }
  }

  function dispatch(action, payload = {}) {
    if (state.mode !== "active") return getState();
    const actionResult = actionContract.validateAction(action, payload, state);
    if (!actionResult.ok) {
      state.lastRejectionReason = actionResult.rejectionReason;
      event(`rejected:${action}`);
      return getState();
    }
    if (payload.targetId) {
      const affordanceResult = affordanceContract.validateTargetAffordance(actionResult.actionId, payload.targetId, state);
      if (!affordanceResult.ok) {
        state.lastRejectionReason = affordanceResult.rejectionReason;
        event(`rejected:${actionResult.actionId}`);
        return getState();
      }
    }
    state.lastRejectionReason = null;
    action = actionResult.actionId;
    payload = actionResult.payload;
    event(action);
    if (["vent", "recover", "dampen", "channel", "repair", "crouch", "grab", "scan"].includes(action)) {
      state.resource = Math.min(100, state.resource + 8);
      completeNode(42);
    } else if (["jump", "fireTether", "blink", "placeAnchor", "placeWard", "pulse"].includes(action)) {
      state.resource = Math.max(0, state.resource - 6);
      completeNode(31);
    } else {
      completeNode(18);
    }
    if (action === "switchLane") state.player.lane = payload.direction === "left" ? Math.max(0, state.player.lane - 1) : Math.min(2, state.player.lane + 1);
    if (action === "vertical") state.player.depth = payload.direction === "up" ? Math.max(0, state.player.depth - 1) : Math.min(3, state.player.depth + 1);
    syncResources();
    return tick(1 / 30);
  }

  function tick(dt = 1 / 60) {
    if (state.mode !== "active") return getState();
    state.time += dt;
    state.pressure = Math.min(100, state.pressure + dt * 3.2);
    state.resource = Math.max(0, state.resource - dt * 1.4);
    state.player.x = Math.min(790, state.player.x + dt * 42);
    state.player.y = 280 + Math.sin(state.time * 1.7) * 42;
    state.progress = state.nodes.filter((node) => node.secured).length / state.nodes.length;
    if (state.progress >= 1) {
      state.mode = "completed";
      state.completed = true;
      event("completed");
    } else if (state.pressure >= 100 || state.resource <= 0) {
      state.mode = "failed";
      state.failed = true;
      event("failed");
    }
    state.affordances.available = affordanceContract.getAvailableAffordances(state).map((affordance) => ({ ...affordance }));
    syncResources();
    return getState();
  }

  function runSmoke() {
    for (let frame = 0; frame < 120; frame++) tick(1 / 60);
    for (const step of actionContract.smokeActions) {
      const [action, value] = step.split(":");
      dispatch(action, { direction: value, value });
      for (let frame = 0; frame < 20; frame++) tick(1 / 60);
    }
    while (state.mode === "active" && state.progress < 1) {
      completeNode(45);
      tick(1 / 15);
    }
    return getValidationState();
  }

  function getState() {
    return clone(state);
  }

  function getValidationState() {
    return {
      id: state.id,
      title: state.title,
      mode: state.mode,
      progress: Number(state.progress.toFixed(2)),
      pressure: Number(state.pressure.toFixed(2)),
      resource: Number(state.resource.toFixed(2)),
      resources: clone(state.resources),
      completed: state.completed,
      failed: state.failed,
      score: state.score,
      lastRejectionReason: state.lastRejectionReason,
      recentEvents: [...state.recentEvents],
      affordances: clone(state.affordances),
      kitStack: [...state.kitStack]
    };
  }

  return {
    game,
    getState,
    getValidationState,
    dispatch,
    tick,
    runSmoke,
    restart() {
      return createAaaBatchGameHost(game);
    }
  };
}
