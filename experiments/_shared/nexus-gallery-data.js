export const galleryConfig = Object.freeze({
  title: "Experiments",
  subtitle: "NexusRealtime playable routes",
  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments",
  hint: "Drag, swipe, wheel, double-click, or use arrows to browse."
});

export const games = Object.freeze([
  {
    id: "the-open-above-harness",
    title: "The Open Above V2",
    route: "./experiments/the-open-above-harness/",
    kind: "experiment",
    featured: true,
    visual: "sora",
    playLabel: "Play harness",
    tags: [{ label: "Flight", tone: "gold" }, { label: "Traversal", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Clean high-fidelity free-flight harness for assisted bird carving, camera-relative sky, terrain patches, scatter, flocking, and validation-first composition."
  },
  {
    id: "high-fidelity-meadow",
    title: "High Fidelity Meadow",
    route: "./experiments/high-fidelity-meadow/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "WebGL", tone: "gold" }, { label: "Procedural", tone: "green" }, { label: "DSK Cutover", tone: "blue" }],
    description: "Experiment-owned procedural WebGL meadow scene composed from current terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target ProtoKit domains."
  },
  {
    id: "fogline-relay",
    title: "Fogline Relay",
    route: "./experiments/fogline-relay/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "First Person", tone: "gold" }, { label: "Scan", tone: "green" }, { label: "Fog", tone: "blue" }],
    description: "First-person survey-pressure loop for scan targets, fog zones, timed pressure, hazard state, and renderer-only visual buckets."
  },
  {
    id: "living-agent-lab",
    title: "Living Agent Lab",
    route: "./experiments/living-agent-lab/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Agent Kit", tone: "gold" }, { label: "Dry Run", tone: "green" }, { label: "No LLM", tone: "blue" }],
    description: "Deterministic dry-run village slice for agent memory, fake harness proposals, validation traces, and in-world dialogue without live model calls."
  },
  {
    id: "onnx-agent-lab",
    title: "ONNX Agent Lab",
    route: "./experiments/onnx-agent-lab/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "ONNX", tone: "gold" }, { label: "Chat", tone: "green" }, { label: "Dispose", tone: "blue" }],
    description: "Browser chat interface that loads Xenova/distilgpt2 through Transformers.js/ONNX, sends prompts, uses fallback output on failure, and disposes the active model session."
  },
  {
    id: "nexus-frontier-signal-isles",
    title: "Nexus Frontier: Signal Isles",
    route: "./experiments/nexus-frontier-signal-isles/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Field Engineer", tone: "gold" }, { label: "Systems", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "3D field-engineer slice built to exercise scan, harvest, build, pressure, gates, route, cargo, beacon, feedback, and debug/replay surfaces."
  },
  {
    id: "signal-bastion",
    title: "Signal Bastion",
    route: "./games/signal-bastion/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Tower Defense", tone: "gold" }, { label: "2.5D Cel", tone: "green" }, { label: "Tactics", tone: "blue" }],
    description: "2.5D cel-style defense game with sleek gameplay-only HUD, 12-card tower panel, upgrade/context panel, placement ghost, range rings, and full AAA content pass."
  },
  {
    id: "next-ledge",
    title: "Next Ledge",
    route: "./experiments/next-ledge/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Grapple", tone: "gold" }, { label: "Climb", tone: "green" }, { label: "Route", tone: "blue" }],
    description: "Cinematic grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, and a Three.js host."
  },
  {
    id: "sora-the-infinite",
    title: "Sora The Infinite",
    route: "./experiments/sora-the-infinite/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Air Race", tone: "gold" }, { label: "Checkpoint", tone: "green" }, { label: "World", tone: "blue" }],
    description: "Aerial checkpoint validation for terrain patches, updraft volumes, checkpoints, render descriptors, and racing camera state."
  },
  {
    id: "zombie-orchard",
    title: "Zombie Orchard",
    route: "./experiments/zombie-orchard/",
    kind: "experiment",
    visual: "zombie",
    playLabel: "Play experiment",
    tags: [{ label: "Survival", tone: "gold" }, { label: "Horde", tone: "red" }, { label: "Scavenge", tone: "green" }],
    description: "Kit-composed survival slice for rounds, horde pressure, pickups, weapons, orchard content, and debug-friendly runtime state."
  },
  {
    id: "rogue-lite-hellscape-siege",
    title: "Rogue-Lite Hellscape Siege",
    route: "./games/rogue-lite-hellscape-siege/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Action RPG", tone: "gold" }, { label: "Base Siege", tone: "green" }, { label: "Harvest", tone: "red" }],
    description: "Unified high-fidelity base route for realm portals, inventory, harvesting, building, wave-defense, FX, and renderer-only presentation loop."
  },
  {
    id: "tideglass-salvage",
    title: "Tideglass Salvage",
    route: "./experiments/tideglass-salvage/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Boat", tone: "gold" }, { label: "Salvage", tone: "green" }, { label: "Water", tone: "blue" }],
    description: "Pilot a glass-hulled salvage skiff through storm ruins, dock near wreckage, and recover relic crates under cargo and weather pressure."
  },
  {
    id: "ember-rail",
    title: "Ember Rail",
    route: "./experiments/ember-rail/",
    kind: "experiment",
    visual: "hell",
    playLabel: "Play experiment",
    tags: [{ label: "Rail Runner", tone: "gold" }, { label: "Lane", tone: "green" }, { label: "Speed", tone: "red" }],
    description: "Surf a molten mag-rail through a collapsing forge canyon by switching rails, jumping gaps, and venting heat at coolant gates."
  },
  {
    id: "skyrig-suture",
    title: "Skyrig Suture",
    route: "./experiments/skyrig-suture/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Tether", tone: "gold" }, { label: "Repair", tone: "green" }, { label: "Sky Rig", tone: "blue" }],
    description: "Repair a floating storm rig by tethering broken conduits before platforms drift apart and battery pressure collapses the repair route."
  },
  {
    id: "core-diver",
    title: "Core Diver",
    route: "./experiments/core-diver/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Underwater", tone: "gold" }, { label: "Oxygen", tone: "green" }, { label: "Reactor", tone: "blue" }],
    description: "Dive into a flooded reactor core, manage oxygen and radiation, grab rods, and surface before the pressure loop peaks."
  },
  {
    id: "starwell-cartographer",
    title: "Starwell Cartographer",
    route: "./experiments/starwell-cartographer/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Survey", tone: "gold" }, { label: "Beacons", tone: "green" }, { label: "Astral", tone: "blue" }],
    description: "Map a shifting astral basin by scanning zones and anchoring beacons before rift drift corrupts the chart."
  },
  {
    id: "gravity-anvil",
    title: "Gravity Anvil",
    route: "./experiments/gravity-anvil/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "Physics", tone: "gold" }, { label: "Sling", tone: "green" }, { label: "Forge", tone: "red" }],
    description: "Forge star-metal by slinging ore through orbiting gravity wells, using trajectory timing and forge windows instead of movement combat."
  },
  {
    id: "mirrorfall-prism",
    title: "Mirrorfall Prism",
    route: "./experiments/mirrorfall-prism/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Beam Puzzle", tone: "gold" }, { label: "Prism", tone: "green" }, { label: "Temple", tone: "blue" }],
    description: "Rotate ancient prisms to redirect moonlight, lock beams, and hold back the eclipse wall before the temple is consumed."
  },
  {
    id: "echo-lock",
    title: "Echo Lock",
    route: "./experiments/echo-lock/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Audio Puzzle", tone: "gold" }, { label: "Tune", tone: "green" }, { label: "Vault", tone: "blue" }],
    description: "Crack a cathedral vault by tuning resonance, pulsing sonic tumblers, and dampening noise before patrol alert closes the window."
  },
  {
    id: "clockwork-verdict",
    title: "Clockwork Verdict",
    route: "./experiments/clockwork-verdict/",
    kind: "experiment",
    visual: "hell",
    playLabel: "Play experiment",
    tags: [{ label: "Courtroom", tone: "gold" }, { label: "Cards", tone: "green" }, { label: "Timing", tone: "red" }],
    description: "Argue before a mechanical court by selecting evidence, objecting during brief windows, and managing credibility before the verdict gears lock."
  },
  {
    id: "orchid-mech-harvest",
    title: "Orchid Mech Harvest",
    route: "./experiments/orchid-mech-harvest/",
    kind: "experiment",
    visual: "zombie",
    playLabel: "Play experiment",
    tags: [{ label: "Mech", tone: "gold" }, { label: "Harvest", tone: "green" }, { label: "Spore", tone: "blue" }],
    description: "Pilot a soft biotech mech, select tool arms, harvest unstable flowers, and vent spores before greenhouse pressure blooms out of control."
  }
]);

export function getFeaturedGame() {
  return games.find((game) => game.featured) ?? games[0] ?? null;
}

export function getGameById(id) {
  return games.find((game) => game.id === id) ?? null;
}
