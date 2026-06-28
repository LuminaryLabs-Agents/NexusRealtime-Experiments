export const galleryConfig = Object.freeze({
  title: "Experiments",
  subtitle: "NexusRealtime playable routes",
  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments",
  hint: "Browse the 10 collective experiment cards. Older removed routes live under deprecated/."
});

export const games = Object.freeze([
  {
    id: "vr-platformer-board",
    tab: "experiments",
    title: "VR Platformer Board",
    route: "./experiments/vr-platformer-board/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "VR Board", tone: "gold" }, { label: "Platformer", tone: "green" }, { label: "6DOF", tone: "blue" }],
    description: "Floating platformer board validation for XR pose, input, comfort, spatial anchor, stereo descriptors, and renderer-neutral ProtoKit state."
  },
  {
    id: "the-open-above-harness",
    tab: "experiments",
    title: "The Open Above",
    route: "./experiments/the-open-above-harness/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play harness",
    tags: [{ label: "Flight", tone: "gold" }, { label: "Traversal", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Free-flight harness for bird carving, camera-relative sky, terrain patches, scatter, flocking, and validation-first composition."
  },
  {
    id: "high-fidelity-meadow",
    tab: "experiments",
    title: "High Fidelity Meadow",
    route: "./experiments/high-fidelity-meadow/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [{ label: "WebGL", tone: "gold" }, { label: "Procedural", tone: "green" }, { label: "DSK Cutover", tone: "blue" }],
    description: "Procedural meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target ProtoKit domains."
  },
  {
    id: "fogline-relay",
    tab: "experiments",
    title: "Fogline Relay",
    route: "./experiments/fogline-relay/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "First Person", tone: "gold" }, { label: "Scan", tone: "green" }, { label: "Fog", tone: "blue" }],
    description: "First-person survey loop for scan targets, fog zones, timed pressure, hazard state, and renderer-only visual buckets."
  },
  {
    id: "nexus-frontier-signal-isles",
    tab: "experiments",
    title: "Nexus Frontier: Signal Isles",
    route: "./experiments/nexus-frontier-signal-isles/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [{ label: "Field Engineer", tone: "gold" }, { label: "Systems", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Field-engineer slice for scan, harvest, build, pressure, gates, route, cargo, beacon, feedback, and debug/replay surfaces."
  },
  {
    id: "signal-bastion",
    tab: "games",
    title: "Signal Bastion",
    route: "./games/signal-bastion/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Tower Defense", tone: "gold" }, { label: "2.5D Cel", tone: "green" }, { label: "Tactics", tone: "blue" }],
    description: "2.5D cel-style defense game with gameplay HUD, tower cards, context panel, placement ghost, range rings, and content pass."
  },
  {
    id: "next-ledge",
    tab: "experiments",
    title: "Next Ledge",
    route: "./experiments/next-ledge/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [{ label: "Grapple", tone: "gold" }, { label: "Climb", tone: "green" }, { label: "Route", tone: "blue" }],
    description: "Grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, and a Three.js host."
  },
  {
    id: "sora-the-infinite",
    tab: "experiments",
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
    tab: "experiments",
    title: "Zombie Orchard",
    route: "./experiments/zombie-orchard/",
    kind: "experiment",
    visual: "zombie",
    playLabel: "Play experiment",
    tags: [{ label: "Survival", tone: "gold" }, { label: "Horde", tone: "red" }, { label: "Scavenge", tone: "green" }],
    description: "Survival slice for rounds, pressure, pickups, weapons, orchard content, and debug-friendly runtime state."
  },
  {
    id: "rogue-lite-hellscape-siege",
    tab: "games",
    title: "Rogue-Lite Hellscape Siege",
    route: "./games/rogue-lite-hellscape-siege/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [{ label: "Action RPG", tone: "gold" }, { label: "Base Siege", tone: "green" }, { label: "Harvest", tone: "red" }],
    description: "Base route for realm portals, inventory, harvesting, building, wave-defense, FX, and renderer-only presentation loop."
  }
]);

export const tabs = Object.freeze([
  { id: "experiments", label: "Experiments", count: games.filter((app) => app.tab === "experiments").length },
  { id: "games", label: "Games", count: games.filter((app) => app.tab === "games").length }
]);

export const apps = games;
