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
  const state = {
    id: game.id,
    title: game.title,
    mode: "active",
    time: 0,
    score: 0,
    progress: 0,
    pressure: 0,
    resource: 100,
    player: { x: 90, y: 280, lane: 1, depth: 0 },
    nodes: makeNodes(game),
    recentEvents: ["booted"],
    kitStack: [...game.kitStack],
    objective: game.smoke.join(" -> ")
  };

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
      event("completed");
    } else if (state.pressure >= 100 || state.resource <= 0) {
      state.mode = "failed";
      event("failed");
    }
    return getState();
  }

  function runSmoke() {
    for (let frame = 0; frame < 120; frame++) tick(1 / 60);
    for (const step of game.smoke) {
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
      score: state.score,
      recentEvents: [...state.recentEvents],
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
