import * as NexusRealtime from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@main/src/index.js";
import { createFoundGearKit, createGenericGridLayoutKit, createGenericNavigationGridAdapterKit, createGenericPlacementReservationKit, createGenericRowFieldLayoutKit, createGenericSpawnLaneKit, createGenericWalkabilityFieldKit, createPressureHordeDirectorKit, createSurvivalRoundKit, createThreatRosterKit } from "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.1/protokits/generic-survival-domain-kits/index.js";
export { NexusRealtime };
export function createKitStack(content) {
const grid = createGenericGridLayoutKit(NexusRealtime, content.gridLayout);
const orchard = createGenericRowFieldLayoutKit(NexusRealtime, content.rowFieldLayout ?? content.orchardBiome);
const placement = createGenericPlacementReservationKit(NexusRealtime, content.placementReservations ?? content.navigation);
const walkability = createGenericWalkabilityFieldKit(NexusRealtime, content.walkabilityField ?? content.navigation);
const spawnLanes = createGenericSpawnLaneKit(NexusRealtime, content.spawnLanes);
const navigationGrid = createGenericNavigationGridAdapterKit(NexusRealtime, content.navigationGrid ?? content.navigation);
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
const monsters = createThreatRosterKit(NexusRealtime, content.threatRoster ?? content.monsterRoster ?? {});
const horde = createPressureHordeDirectorKit(NexusRealtime, content.pressureHorde ?? content.hordeDirector);
const weapons = createFoundGearKit(NexusRealtime, content.foundGear ?? content.foundWeapons);
const kits = [procedural, grid, orchard, placement, walkability, spawnLanes, navigationGrid, navmesh, pathfinding, movement, physics, interaction, camera, combat, objective, collectible, renderDescriptors, realism, rounds, monsters, horde, weapons];
return { kits, refs: { procedural, grid, orchard, placement, walkability, spawnLanes, navigationGrid, navmesh, pathfinding, movement, physics, interaction, camera, combat, objective, collectible, renderDescriptors, realism, rounds, monsters, horde, weapons } };
}
