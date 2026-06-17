import { aaaBatchGalleryGames } from "../aaa-batch/host/game-registry.js";

export const galleryConfig = Object.freeze({
  title: "Experiments",
  subtitle: "NexusRealtime playable routes",
  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments",
  hint: "Drag, swipe, wheel, or use arrows to browse."
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
    tags: [
      { label: "Harness", tone: "gold" },
      { label: "Composed", tone: "green" },
      { label: "Flight", tone: "blue" }
    ],
    description: "Clean high-fidelity flight harness for assisted bird carving, camera-relative sky, terrain patches, scatter, flocking, and validation-first NexusRealtime composition."
  },
  {
    id: "fogline-relay",
    title: "Fogline Relay",
    route: "./experiments/fogline-relay/",
    kind: "experiment",
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
    id: "nexus-frontier-signal-isles",
    title: "Nexus Frontier: Signal Isles",
    route: "./experiments/nexus-frontier-signal-isles/",
    kind: "experiment",
    visual: "fogline",
    playLabel: "Play experiment",
    tags: [
      { label: "Kit Showcase", tone: "gold" },
      { label: "Signal Isles", tone: "green" },
      { label: "3D", tone: "blue" }
    ],
    description: "3D field-engineer slice built to exercise the broad NexusRealtime kit graph: scan, harvest, build, pressure, gates, route, cargo, beacon, feedback, and debug/replay surfaces."
  },
  {
    id: "signal-bastion",
    title: "Signal Bastion",
    route: "./games/signal-bastion/",
    kind: "game",
    visual: "hell",
    playLabel: "Play game",
    tags: [
      { label: "2.5D Cel", tone: "gold" },
      { label: "Generic DSK", tone: "green" },
      { label: "Tower UI", tone: "blue" }
    ],
    description: "2.5D cel-style defense game with sleek gameplay-only HUD, 12-card tower panel, upgrade/context panel, placement ghost, range rings, and full AAA content pass."
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
  },
  ...aaaBatchGalleryGames
]);

export function getFeaturedGame() {
  return games.find((game) => game.featured) ?? games[0] ?? null;
}
