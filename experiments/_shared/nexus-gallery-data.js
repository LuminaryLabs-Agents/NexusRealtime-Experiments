export const galleryConfig = Object.freeze({
  title: "Experiments",
  subtitle: "NexusRealtime playable routes",
  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments",
  hint: "Drag, swipe, wheel, or use arrows to browse."
});

export const games = Object.freeze([
  {
    id: "fogline-relay",
    title: "Fogline Relay",
    route: "./experiments/fogline-relay/",
    kind: "experiment",
    featured: true,
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [
      { label: "Featured", tone: "gold" },
      { label: "Domain cutover", tone: "green" },
      { label: "Fog", tone: "blue" }
    ],
    description: "First-person survey-pressure loop for scan targets, fog zones, timed pressure, hazard state, and renderer-only visual buckets."
  },
  {
    id: "signal-bastion",
    title: "Signal Bastion",
    route: "./games/signal-bastion/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [
      { label: "Generic DSK", tone: "gold" },
      { label: "Defense", tone: "green" },
      { label: "Canvas", tone: "blue" }
    ],
    description: "Playable 2.5D defense game composed from the generic-defense ProtoKit bundle: paths, build slots, structures, waves, agents, projectiles, currency, and descriptors."
  },
  {
    id: "next-ledge",
    title: "Next Ledge",
    route: "./experiments/next-ledge/",
    kind: "experiment",
    visual: "next",
    playLabel: "Play experiment",
    tags: [
      { label: "Climb", tone: "gold" },
      { label: "Route", tone: "green" },
      { label: "ProtoKit", tone: "blue" }
    ],
    description: "Cinematic grapple-climb validation with action input, ledge routes, swing pressure, feedback descriptors, and a Three.js host."
  },
  {
    id: "sora-the-infinite",
    title: "Sora The Infinite",
    route: "./experiments/sora-the-infinite/",
    kind: "experiment",
    visual: "sora",
    playLabel: "Play experiment",
    tags: [
      { label: "Aerial", tone: "gold" },
      { label: "World", tone: "green" },
      { label: "Three.js", tone: "blue" }
    ],
    description: "Flight-domain validation for terrain patches, updraft volumes, checkpoints, render descriptors, and aerial camera state."
  },
  {
    id: "zombie-orchard",
    title: "Zombie Orchard",
    route: "./experiments/zombie-orchard/",
    kind: "experiment",
    visual: "zombie",
    playLabel: "Play experiment",
    tags: [
      { label: "Survival", tone: "blue" },
      { label: "Horde", tone: "red" },
      { label: "Canvas", tone: "green" }
    ],
    description: "Kit-composed survival slice for rounds, horde pressure, pickups, weapons, orchard content, and debug-friendly runtime state."
  },
  {
    id: "rogue-lite-hellscape-siege",
    title: "Rogue-Lite Hellscape Siege",
    route: "./games/rogue-lite-hellscape-siege/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [
      { label: "Unified", tone: "gold" },
      { label: "Base name", tone: "green" },
      { label: "Defense", tone: "red" }
    ],
    description: "Unified high-fidelity base route for the kit-shaped realm, inventory, harvesting, building, wave-defense, FX, and renderer-only presentation loop."
  }
]);

export function getFeaturedGame() {
  return games.find((game) => game.featured) ?? games[0] ?? null;
}
