import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
import { createFoundWeaponKit, createHordeDirectorKit, createMonsterRosterKit, createOrchardBiomeKit, createSurvivalRoundKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@zombie-orchard-protokits/protokits/zombie-orchard/index.js";

export { NexusRealtime };

export function createKitStack(content) {
  const movement = NexusRealtime.createCharacterMovementKit({ id: "zo-movement", bounds: content.bounds, respawnPoint: content.player.spawn, speed: 8.2, sprintSpeed: 12.8, dashSpeed: 15, dashBoost: 8.5, groundOffset: 1.1 });
  const interaction = NexusRealtime.createCharacterInteractionKit({ id: "zo-interaction" });
  const camera = NexusRealtime.createCharacterCameraKit({ id: "zo-camera", characterStateResource: movement.resources.PlayerState, distance: 23, height: 24, lookAhead: 5, sway: 1.4 });
  const physics = NexusRealtime.createWorldPhysicsKit({ id: "zo-physics", playerStateResource: movement.resources.PlayerState, worldBounds: content.bounds, respawnPoint: content.player.spawn, groundOffset: 1.1 });
  const combat = NexusRealtime.createLightCombatKit({ id: "zo-combat", enemyHealth: 3, strikeDamage: 1 });
  const objective = NexusRealtime.createObjectiveFlowKit(content.objectiveFlow);
  const collectible = NexusRealtime.createCollectibleKit(content.collectibles);
  const renderDescriptors = NexusRealtime.createRenderDescriptorKit(content.renderDescriptors);
  const procedural = NexusRealtime.createProceduralKit(content.procedural);
  const navmesh = NexusRealtime.createNavMeshKit({ id: "zo-navmesh" });
  const pathfinding = NexusRealtime.createPathfindingKit({ id: "zo-pathfinding", mode: "grid", grid: { diagonal: true } });
  const realism = NexusRealtime.createRealismKit(content.realism);
  const rounds = createSurvivalRoundKit(NexusRealtime, content.survivalRounds);
  const orchard = createOrchardBiomeKit(NexusRealtime, content.orchardBiome);
  const monsters = createMonsterRosterKit(NexusRealtime, content.monsterRoster ?? {});
  const horde = createHordeDirectorKit(NexusRealtime, content.hordeDirector);
  const weapons = createFoundWeaponKit(NexusRealtime, content.foundWeapons);
  return { kits: [procedural, navmesh, pathfinding, movement, physics, interaction, camera, combat, objective, collectible, renderDescriptors, realism, rounds, orchard, monsters, horde, weapons], refs: { movement, physics, interaction, camera, combat, objective, collectible, renderDescriptors, procedural, navmesh, pathfinding, realism, rounds, orchard, monsters, horde, weapons } };
}
