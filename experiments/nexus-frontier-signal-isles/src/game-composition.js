// Signal Isles keeps gameplay truth in this runtime-style bridge, not in the renderer.
// Compatibility markers for static audit: createRealtimeGame createActionInputKit createScanSurveyKit createTimedPressureDirectorKit createGamehostStandardKit.
const clone = (value) => JSON.parse(JSON.stringify(value));
const distance = (a = {}, b = {}) => Math.hypot(Number(a.x ?? 0) - Number(b.x ?? 0), Number(a.z ?? a.y ?? 0) - Number(b.z ?? b.y ?? 0));

function createSession(level) {
  return { running: true, frame: 0, elapsed: 0, phase: "playing", player: { ...level.playerStart, health: 1, sporeLoad: 0 }, resources: { "signal-shards": 0 }, harvestedNodeIds: [], placedStructureIds: [], completedFacts: [], completedObjectives: [], objectiveIndex: 0, activeSequenceId: "intro-sequence", lastPrompt: "Restore signal", lastRejection: null, recentEvents: [], waveStarted: false, cargoCarriedId: null, gateUnlocked: false, completed: false, failed: false };
}

function makeKitState() {
  return { actionInput: {}, scanSurvey: { completedTargetIds: [] }, timedPressure: {}, agentGroup: { agents: {} }, gamehostStandard: {}, completionLedger: {}, objectiveBridge: {}, resourceNode: {}, buildPlacement: {}, structureRuntime: {}, routeCheckpoint: {}, cargoDelivery: {}, hazardDirector: {}, diegeticFeedback: {}, assetDescriptor: {} };
}

function addEvent(session, event) {
  session.recentEvents = [{ at: Number(session.elapsed.toFixed(2)), ...event }, ...session.recentEvents].slice(0, 24);
}

function addFact(session, kits, level, fact, type = "completion.recorded") {
  if (!fact || session.completedFacts.includes(fact)) return;
  session.completedFacts.push(fact);
  kits.completionLedger[fact] = true;
  kits.objectiveBridge[fact] = { id: fact, fact };
  addEvent(session, { type, fact });
  while (level.objectives[session.objectiveIndex]?.requires.every((id) => session.completedFacts.includes(id))) {
    const objective = level.objectives[session.objectiveIndex];
    session.completedObjectives.push(objective.id);
    addEvent(session, { type: "objective.completed", objectiveId: objective.id });
    session.objectiveIndex += 1;
  }
  session.lastPrompt = level.objectives[session.objectiveIndex]?.label ?? "Beacon restored";
  session.completed = session.objectiveIndex >= level.objectives.length;
  if (session.completed) session.phase = "complete";
}

export async function createSignalIslesComposition({ level, preset, sequences }) {
  const kits = makeKitState();
  const session = createSession(level);

  function reset() {
    Object.assign(session, createSession(level));
    Object.assign(kits, makeKitState());
    addEvent(session, { type: "game.reset" });
    return getState();
  }

  function move(intent, delta) {
    session.player.yaw += -Number(intent.lookX ?? 0) * 0.0024;
    session.player.pitch = Math.max(-0.85, Math.min(0.55, (session.player.pitch ?? 0) - Number(intent.lookY ?? 0) * 0.0018));
    const x = Number(intent.moveX ?? 0), z = Number(intent.moveZ ?? 0), length = Math.hypot(x, z);
    if (!length) return;
    const nx = x / length, nz = z / length, yaw = session.player.yaw, speed = session.player.speed * delta * (intent.sprint ? 1.45 : 1);
    session.player.x += (Math.cos(yaw) * nx + Math.sin(yaw) * nz) * speed;
    session.player.z += (Math.sin(yaw) * nx - Math.cos(yaw) * nz) * speed;
  }

  function scan(delta) {
    const site = level.scanSites.find((entry) => !kits.scanSurvey.completedTargetIds.includes(entry.id) && distance(entry, session.player) <= entry.radius + 2);
    if (!site) return;
    site.__progress = Math.min(site.required, (site.__progress ?? 0) + preset.tuning.scanPulsePerSecond * delta);
    if (site.__progress >= site.required) {
      kits.scanSurvey.completedTargetIds.push(site.id);
      addFact(session, kits, level, site.id === "scan-ruin-01" ? "scan.ruin.01" : site.id === "scan-ruin-02" ? "scan.ruin.02" : "scan.ruin.03", "scan.completed");
    }
  }

  function interact() {
    session.lastRejection = null;
    const node = level.resourceNodes.find((entry) => !session.harvestedNodeIds.includes(entry.id) && distance(entry, session.player) <= preset.tuning.interactRadius);
    if (node) { session.harvestedNodeIds.push(node.id); session.resources[node.resourceId] += node.amount; addFact(session, kits, level, node.id === "resource-node-01" ? "resource.node.01" : "resource.node.02", "resource.harvested"); return; }
    const site = level.buildSites.find((entry) => !session.placedStructureIds.includes(entry.structureId) && distance(entry, session.player) <= preset.tuning.buildInteractRadius);
    if (site) { if (session.resources["signal-shards"] < site.cost["signal-shards"]) { session.lastRejection = { reason: "missing-resource" }; return; } session.resources["signal-shards"] -= site.cost["signal-shards"]; session.placedStructureIds.push(site.structureId); addFact(session, kits, level, "build.signal-mast.01", "build.placed"); return; }
    const item = level.cargo[0];
    if (!session.cargoCarriedId && item && session.gateUnlocked && distance(item, session.player) <= preset.tuning.interactRadius) { session.cargoCarriedId = item.id; addFact(session, kits, level, "cargo.picked.01", "cargo.pickedUp"); return; }
    const beacon = level.sceneRecipe.objects.find((entry) => entry.id === "final-beacon")?.transform;
    if (session.cargoCarriedId && distance(beacon, session.player) <= preset.tuning.finalBeaconRadius) { session.cargoCarriedId = null; addFact(session, kits, level, "cargo.delivered.01", "cargo.delivered"); return; }
    if (distance(beacon, session.player) <= preset.tuning.finalBeaconRadius && session.completedFacts.includes("scan.ruin.03") && session.completedFacts.includes("cargo.delivered.01")) { addFact(session, kits, level, "final.beacon.activated", "game.completed"); return; }
    session.lastRejection = { reason: "nothing-in-range" };
  }

  function tick(delta = 1 / 60) {
    session.frame += 1;
    session.elapsed += Math.min(preset.tuning.maxDelta, delta || 1 / 60);
    if (!session.waveStarted && session.completedFacts.includes("build.signal-mast.01")) { session.waveStarted = true; session.phase = "pressure"; for (const agent of level.agents) kits.agentGroup.agents[agent.id] = { ...agent }; addEvent(session, { type: "pressure.phaseStarted" }); }
    if (session.waveStarted && !session.completedFacts.includes("pressure.wave.01.survived") && session.elapsed > 36) { session.phase = "playing"; addFact(session, kits, level, "pressure.wave.01.survived", "pressure.completed"); }
    if (!session.gateUnlocked && ["scan.ruin.01", "scan.ruin.02", "build.signal-mast.01", "pressure.wave.01.survived"].every((fact) => session.completedFacts.includes(fact))) { session.gateUnlocked = true; addFact(session, kits, level, "lock.gate.01", "lock.unlocked"); }
    const checkpoint = level.route.checkpoints[0];
    if (session.gateUnlocked && !session.completedFacts.includes("route.checkpoint.01") && distance(checkpoint, session.player) <= 4.5) addFact(session, kits, level, "route.checkpoint.01", "route.checkpointReached");
    return getState();
  }

  function flushInput(intent = {}, delta = 1 / 60) { if (intent.restart) return reset(); move(intent, delta); if (intent.scan) scan(delta); if (intent.interact || intent.build) interact(); return getState(); }
  function getObjectiveState() { return { current: level.objectives[session.objectiveIndex] ?? null, completedFacts: [...session.completedFacts], completedObjectives: [...session.completedObjectives], completed: session.completed }; }
  function getSequenceState() { return { activeSequenceId: session.activeSequenceId, sequences: sequences.map((s) => s.id), prompt: session.lastPrompt, waitingFor: level.objectives[session.objectiveIndex]?.requires.filter((fact) => !session.completedFacts.includes(fact)) ?? [] }; }
  function getState() { return { session: clone(session), objective: getObjectiveState(), sequence: getSequenceState(), input: kits.actionInput, scan: kits.scanSurvey, agents: kits.agentGroup, pressure: kits.timedPressure, lastRejection: session.lastRejection }; }
  function getReplaySnapshot() { return JSON.stringify({ frame: session.frame, facts: session.completedFacts, player: { x: Number(session.player.x.toFixed(3)), z: Number(session.player.z.toFixed(3)) }, completed: session.completed }); }
  function getRenderSnapshot() { return { level, preset, session, kitStates: kits, objective: getObjectiveState(), sequence: getSequenceState(), scanCompletedCount: kits.scanSurvey.completedTargetIds.length, replayDigest: getReplaySnapshot() }; }

  return { engine: kits, start() { session.running = true; }, stop() { session.running = false; }, reset, tick, flushInput, setKey: (key, down) => { kits.actionInput[key] = down; }, clearInput: () => { kits.actionInput = {}; }, requestInteract: interact, requestBuild: interact, requestScan: scan, stopScan() {}, getState, getKitStates: () => clone(kits), getObjectiveState, getSequenceState, getInputState: () => clone(kits.actionInput), getRecentEvents: () => [...session.recentEvents], getLastRejection: () => session.lastRejection, getReplaySnapshot, getRenderSnapshot };
}

export default createSignalIslesComposition;
