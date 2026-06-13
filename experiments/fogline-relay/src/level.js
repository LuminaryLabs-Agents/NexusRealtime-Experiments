export function createFoglineRelayLevel() {
  const relays = [
    { id: "relay-01", x: -8, z: 11, label: "Northwest relay" },
    { id: "relay-02", x: 9, z: 18, label: "Canopy relay" },
    { id: "relay-03", x: -2, z: 30, label: "Gate relay" }
  ];
  const gate = { id: "gate-01", x: 0, z: 42, radius: 3.3 };
  const wraiths = [
    { id: "wraith-01", x: 6, z: 12, patrolRadius: 4.5, phase: 0.1 },
    { id: "wraith-02", x: -10, z: 24, patrolRadius: 5.2, phase: 1.8 },
    { id: "wraith-03", x: 7, z: 34, patrolRadius: 4.1, phase: 3.4 }
  ];
  const route = [
    { x: 0, z: 0 },
    { x: -8, z: 11 },
    { x: 9, z: 18 },
    { x: -2, z: 30 },
    { x: 0, z: 42 }
  ];

  return {
    id: "fogline-relay",
    title: "Fogline Relay",
    spawn: { x: 0, z: -4, yaw: 0 },
    bounds: { minX: -18, maxX: 18, minZ: -8, maxZ: 48 },
    relays,
    gate,
    wraiths,
    route,
    sceneRecipe: {
      id: "fogline-relay-scene",
      objects: [
        { id: "ground", archetype: "terrain", transform: { x: 0, y: 0, z: 20, w: 42, d: 60 }, visual: { layer: "terrain", material: "fogline-ground", mesh: "ground-plane" } },
        { id: "distance-mist", archetype: "fog-volume", transform: { x: 0, y: 0, z: 28 }, visual: { layer: "transparent-fog", material: "mist-volume", radius: 36, density: 0.18 } },
        ...relays.map((relay) => ({
          id: relay.id,
          kit: "interaction-target",
          archetype: "relay",
          action: "scan",
          interaction: { action: "scan", count: 1 },
          transform: { x: relay.x, y: 0, z: relay.z, scale: 1 },
          visual: { layer: "interactive", material: "relay-emissive", mesh: "relay-pylon", emissive: "#77f3ff", sortBias: 4 },
          metadata: { label: relay.label, scanRadius: 3.2, light: { type: "cone", color: "#77f3ff", length: 22, radius: 5, density: 0.34 } }
        })),
        {
          id: gate.id,
          archetype: "gate",
          transform: { x: gate.x, y: 0, z: gate.z, scale: 1.4 },
          visual: { layer: "interactive", material: "gate-emissive", mesh: "gate-arch", emissive: "#bafcff", sortBias: 6 },
          metadata: { requires: relays.map((relay) => relay.id), light: { type: "cone", color: "#bafcff", length: 30, radius: 7, density: 0.26 } }
        },
        ...wraiths.map((wraith) => ({
          id: wraith.id,
          archetype: "wraith",
          transform: { x: wraith.x, y: 0, z: wraith.z, scale: 1 },
          visual: { layer: "character", material: "wraith-smoke", mesh: "wraith-billboard", transparent: true, sortBias: 12 },
          metadata: { patrolRadius: wraith.patrolRadius }
        }))
      ]
    },
    visualDataset: {
      palette: {
        fog: "#102333",
        relay: "#77f3ff",
        gate: "#bafcff",
        danger: "#ff5068"
      },
      materials: []
    },
    steps: [
      { id: "scan-relays", label: "Link three relays", requiredAction: "scan", target: 3 },
      { id: "enter-gate", label: "Cross the opened gate", requiredAction: "enter", target: 1 }
    ]
  };
}
