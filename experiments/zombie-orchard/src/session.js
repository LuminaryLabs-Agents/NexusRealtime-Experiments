import { CONTENT, appleEffect, equippedLabel, weaponRange } from "./content.js";
import { createKitStack, NexusRealtime } from "./kit-stack.js";
import { createOrchardWalkabilitySnapshot } from "./navigation-content.js";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a = {}, b = {}) => Math.hypot(n(a.x) - n(b.x), n(a.z ?? a.y) - n(b.z ?? b.y));
const payloads = (batch = []) => batch.map((r) => r.payload ?? r).filter(Boolean);
function nearest(items, pos, radius, pick = (x) => x.position) { let best = null, bestD = Infinity; for (const item of items ?? []) { const d = dist(pos, pick(item)); if (d <= radius && d < bestD) { best = item; bestD = d; } } return best ? { ...best, distance: bestD } : null; }
function setPair(world, a, b, value) { world.setResource(a, value); if (b && b.name !== a.name) world.setResource(b, value); }
function equipped(state) { return (state?.inventory ?? []).find((w) => w.instanceId === state?.equippedId) ?? null; }

export function createZombieOrchardSession(content = CONTENT) {
  const { kits, refs } = createKitStack(content);
  const engine = NexusRealtime.createRealtimeGame({ kits, renderer: NexusRealtime.createRenderer("headless") });
  engine.world.setResource(NexusRealtime.CommonGameResources.ProceduralSnapshot, createOrchardWalkabilitySnapshot(engine.zombieOrchard.orchardBiome.snapshot(), content.navigation));
  const state = { health: 1, stamina: 1, score: 0, apples: 0, clears: 0, recentHits: 0, recentClears: 0, recentApples: 0, scoreMomentum: 0, message: "The orchard wakes. Collect apples, scavenge gear, survive the rows.", messageTime: 6, paused: false, gameOver: false, nextPath: 0, nextContact: 0, bossWarned: false };
  const spawns = engine.eventSurface(refs.monsters.events.MonsterSpawnRequested, { label: "zo-spawns" });
  const boss = engine.eventSurface(refs.monsters.events.BossMonsterQueued, { label: "zo-boss" });
  spawns.subscribe((batch) => payloads(batch).forEach(spawnMonster));
  boss.subscribe((batch) => { if (payloads(batch).length) { msg("The Orchard Keeper is in the rows.", 5); objective("boss-warning"); state.bossWarned = true; } });

  function msg(text, seconds = 2.4) { state.message = text; state.messageTime = seconds; }
  function objective(action, payload = {}) { engine.world.emit(refs.objective.events.ObjectiveFlowAction, { action, payload }); }
  function player() { return engine.world.getResource(refs.movement.resources.PlayerState) ?? { position: content.player.spawn, facing: { x: 0, z: -1 } }; }
  function weaponState() { return engine.zombieOrchard.foundWeapons.getState(); }
  function activeWeapon() { return equipped(weaponState()); }
  function monsters() { const out = []; for (const e of engine.world.query(NexusRealtime.CommonGameComponents.Position, refs.monsters.components.MonsterArchetype, refs.monsters.components.MonsterThreat)) { const p = engine.world.getComponent(e, NexusRealtime.CommonGameComponents.Position); const a = engine.world.getComponent(e, refs.monsters.components.MonsterArchetype); const t = engine.world.getComponent(e, refs.monsters.components.MonsterThreat); out.push({ entity: e, position: p, archetype: a, threat: t, archetypeId: a.id, label: a.label, boss: Boolean(a.boss), elite: Boolean(a.elite) }); } return out; }
  function nearApple() { return nearest(engine.zombieOrchard.orchardBiome.snapshot()?.activeApples ?? [], player().position, content.player.collectRadius); }
  function nearPickup() { return nearest((weaponState()?.pickups ?? []).filter((p) => p.active !== false), player().position, content.player.pickupRadius); }
  function nearMonster(range) { return nearest(monsters(), player().position, range, (m) => m.position); }

  function spawnMonster(spawn) {
    const e = engine.world.addEntity();
    const archetype = spawn.components?.MonsterArchetype ?? { id: spawn.archetypeId, label: spawn.archetypeLabel, boss: Boolean(spawn.archetype?.boss), elite: Boolean(spawn.archetype?.elite) };
    const threat = spawn.components?.MonsterThreat ?? { threat: spawn.archetype?.threat ?? 1, health: spawn.archetype?.health ?? 3, speed: spawn.archetype?.speed ?? 1 };
    engine.world.setComponent(e, NexusRealtime.CommonGameComponents.Position, { x: n(spawn.location?.x), y: 0, z: n(spawn.location?.z) });
    engine.world.setComponent(e, NexusRealtime.CommonGameComponents.NavigationAgent, { speed: 3.8 + n(threat.speed, 1) * 1.6, path: [], pathIndex: 0, arrived: false });
    engine.world.setComponent(e, refs.monsters.components.MonsterArchetype, archetype);
    engine.world.setComponent(e, refs.monsters.components.MonsterThreat, { ...threat, healthRemaining: n(threat.health, 3) });
  }

  function movement(input, dt) { const moving = Math.abs(input.moveX) + Math.abs(input.moveZ) > 0.01; const sprint = input.sprint && moving && state.stamina > 0.08; const dash = input.dash && state.stamina > 0.16; state.stamina = clamp(state.stamina + dt * (sprint ? -0.18 : 0.13) - (dash ? 0.12 : 0), 0, 1); setPair(engine.world, refs.movement.resources.ActionInput, refs.movement.resources.CharacterInput, { x: input.moveX, z: input.moveZ, sprint, dash, jump: false, glide: false, recover: false }); }
  function prompt(input) { const a = nearApple(), w = nearPickup(), target = a ?? w; setPair(engine.world, refs.interaction.resources.InteractionInput, refs.interaction.resources.CharacterInteractionInput, { activate: Boolean(input.interact && target), gather: Boolean(input.interact && a), scan: false, target: target?.id ?? null, prompt: a ? `Collect ${a.label}` : w ? `Pick up ${w.weaponId}` : "", actions: target ? ["interact"] : [] }); }
  function interact(input) { if (!input.interact) return; const a = nearApple(); if (a) { const fx = appleEffect(a.typeId); engine.zombieOrchard.orchardBiome.collectApple(a.id, { typeId: a.typeId, label: a.label }); objective("collect-apple", { apple: a }); state.apples += 1; state.recentApples += 1; state.score += n(fx.score, 10); state.scoreMomentum = clamp(state.scoreMomentum + n(fx.score) / 180, -1, 1); state.health = clamp(state.health + n(fx.heal), 0, 1); state.stamina = clamp(state.stamina + n(fx.stamina), 0, 1); engine.zombieOrchard.hordeDirector.setPressureBias(n(fx.bias)); msg(`${a.label}: ${fx.label}`); return; } const w = nearPickup(); if (w) { engine.zombieOrchard.foundWeapons.pickup(w.id); objective("pick-weapon", { pickup: w }); msg(`Scavenging ${w.weaponId.replaceAll("-", " ")}.`); return; } msg("Nothing close enough to grab.", 1.2); }
  function swap(slot) { if (slot == null) return; const w = weaponState()?.inventory?.[slot]; if (!w) return msg(`Slot ${slot + 1} is empty.`, 1.2); engine.zombieOrchard.foundWeapons.swap(w.instanceId); msg(`Equipped ${w.label}.`, 1.4); }
  function useGear(input) { engine.world.setResource(refs.combat.resources.CombatInput, { strike: Boolean(input.useGear) }); if (!input.useGear) return; const w = activeWeapon(); engine.zombieOrchard.foundWeapons.use({ target: "nearest-monster", durabilityCost: 1, ammoCost: 1 }); if (!w) return msg("No gear equipped.", 1.1); if (w.ammo != null && w.ammo <= 0) return msg(`${w.label} is empty.`, 1.1); const target = nearMonster(weaponRange(w)); if (!target) return msg(`${w.label} cuts through fog.`, 1.1); engine.zombieOrchard.monsterRoster.defeat({ archetypeId: target.archetypeId, round: engine.zombieOrchard.survivalRounds.getState()?.round, count: 1 }); engine.world.removeEntity(target.entity); state.clears += 1; state.recentClears += 1; state.score += Math.round(22 + n(target.threat?.threat, 1) * 18 + (target.boss ? 250 : 0)); state.scoreMomentum = clamp(state.scoreMomentum + 0.18 + n(target.threat?.threat, 1) * 0.04, -1, 1); objective("defeat-monster", { monster: target }); msg(`${w.label} cleared ${target.label}.`); }
  function paths() { if (engine.clock.elapsed < state.nextPath) return; state.nextPath = engine.clock.elapsed + 0.7; const p = player(); for (const m of monsters()) if (dist(m.position, p.position) > 1.2) engine.navigation.requestPath({ mode: "grid", start: m.position, goal: p.position, agent: m.entity }); }
  function feed() { const p = player(); engine.zombieOrchard.hordeDirector.feedPlayerSnapshot({ position: { x: p.position.x, z: p.position.z }, health01: state.health, stamina01: state.stamina, scoreMomentum: state.scoreMomentum, hitsTakenRecently: state.recentHits, killsRecently: state.recentClears, applesRecently: state.recentApples }); }
  function contact() { if (engine.clock.elapsed < state.nextContact) return; const touching = monsters().filter((m) => dist(m.position, player().position) <= content.player.touchRadius); if (!touching.length) return; state.health = clamp(state.health - touching.reduce((s, m) => s + 0.045 * n(m.threat?.threat, 1), 0), 0, 1); state.recentHits += touching.length; state.nextContact = engine.clock.elapsed + 0.7; msg(`${touching[0].label} is on you! Move!`, 1.2); if (state.health <= 0 && !state.gameOver) { state.gameOver = true; engine.zombieOrchard.survivalRounds.failRun("overrun-in-the-orchard"); msg("The orchard claimed you.", 8); } }
  function roundKey(input) { if (!input.nextRound) return; const r = engine.zombieOrchard.survivalRounds.getState(); if (r?.status === "active") { engine.zombieOrchard.survivalRounds.completeRound("manual-skip"); msg("Round pushed into breathing room."); } else { engine.zombieOrchard.survivalRounds.startRound(r?.nextRound ?? 1, "manual-start"); msg("The next wave is coming now."); } }
  function decay(dt) { state.messageTime = Math.max(0, state.messageTime - dt); state.recentHits *= Math.exp(-dt * 0.9); state.recentClears *= Math.exp(-dt * 0.45); state.recentApples *= Math.exp(-dt * 0.42); state.scoreMomentum *= Math.exp(-dt * 0.65); if (state.messageTime <= 0) state.message = ""; }

  function update(delta, input = {}) { if (input.pause) state.paused = !state.paused; if (state.paused) return snapshot(); const dt = clamp(n(delta, 1 / 60), 0, 1 / 20); if (!state.gameOver) { movement(input, dt); prompt(input); roundKey(input); interact(input); swap(input.swapSlot); useGear(input); feed(); paths(); engine.tick(dt); contact(); feed(); const r = engine.zombieOrchard.survivalRounds.getState(); if (r?.bossWave && !state.bossWarned) { objective("boss-warning", { round: r }); state.bossWarned = true; } } else engine.tick(0); decay(dt); return snapshot(); }
  function snapshot() { const w = weaponState(), aw = equipped(w), h = engine.zombieOrchard.hordeDirector.getState(); return { clock: { ...engine.clock }, player: player(), orchard: engine.zombieOrchard.orchardBiome.snapshot() ?? {}, weapons: w, weaponLabel: equippedLabel(w), round: engine.zombieOrchard.survivalRounds.getState(), horde: h, objective: engine.objectiveFlow?.getState?.(), monsters: monsters(), targetMonster: nearMonster(weaponRange(aw)), nearestApple: nearApple(), nearestWeapon: nearPickup(), health01: state.health, stamina01: state.stamina, score: state.score, appleCount: state.apples, clears: state.clears, message: state.message, paused: state.paused, gameOver: state.gameOver, danger: state.health < 0.32 || h?.mode === "panic", cameraZoom: state.health < 0.32 ? 10.2 : 8.4 }; }
  function destroy() { engine.unregisterSurface(spawns); engine.unregisterSurface(boss); }
  return { engine, refs, update, snapshot, destroy };
}
