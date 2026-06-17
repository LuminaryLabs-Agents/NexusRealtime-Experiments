export const signalIslesSequences = Object.freeze([
  {
    id: "intro-sequence",
    purpose: "Teach the player that the beacon restoration loop starts with scanning.",
    start: "game.ready",
    steps: Object.freeze([
      { id: "show-restore-marker", type: "feedback", signalId: "beacon-marker", text: "Restore signal" },
      { id: "wait-first-scan", type: "waitForFact", fact: "scan.ruin.01" },
      { id: "start-first-resource", type: "startSequence", sequenceId: "first-resource-tutorial" }
    ])
  },
  {
    id: "first-scan-tutorial",
    purpose: "Point the scanner at ruins and hold scan until confidence completes.",
    start: "scan.ready",
    steps: Object.freeze([
      { id: "prompt-hold-scan", type: "prompt", text: "Hold F to scan ruins" },
      { id: "wait-scan-two", type: "waitForFacts", facts: ["scan.ruin.01", "scan.ruin.02"] }
    ])
  },
  {
    id: "first-resource-tutorial",
    purpose: "Harvest signal shards through resource-node state.",
    start: "scan.ruin.01",
    steps: Object.freeze([
      { id: "mark-crystals", type: "feedback", signalId: "resource-spark", text: "Harvest shards" },
      { id: "wait-resources", type: "waitForFacts", facts: ["resource.node.01", "resource.node.02"] }
    ])
  },
  {
    id: "first-build-tutorial",
    purpose: "Build the signal mast when resource state has enough charge.",
    start: "resources.ready",
    steps: Object.freeze([
      { id: "mark-build-pad", type: "feedback", signalId: "build-ring", text: "Build mast" },
      { id: "wait-build", type: "waitForFact", fact: "build.signal-mast.01" }
    ])
  },
  {
    id: "first-pressure-wave",
    purpose: "Start pressure and agent domain state after the mast exists.",
    start: "build.signal-mast.01",
    steps: Object.freeze([
      { id: "start-pressure", type: "emit", event: "pressure.phaseStarted", phaseId: "wave-01" },
      { id: "wait-survive", type: "waitForFact", fact: "pressure.wave.01.survived" }
    ])
  },
  {
    id: "gate-unlock-sequence",
    purpose: "Unlock route only when scans and build facts exist.",
    start: "pressure.wave.01.survived",
    steps: Object.freeze([
      { id: "open-gate", type: "waitForFact", fact: "lock.gate.01" },
      { id: "wait-checkpoint", type: "waitForFact", fact: "route.checkpoint.01" }
    ])
  },
  {
    id: "cargo-delivery-sequence",
    purpose: "Carry signal cargo from the route to the final beacon.",
    start: "route.checkpoint.01",
    steps: Object.freeze([
      { id: "pickup-cargo", type: "waitForFact", fact: "cargo.picked.01" },
      { id: "deliver-cargo", type: "waitForFact", fact: "cargo.delivered.01" }
    ])
  },
  {
    id: "final-beacon-completion",
    purpose: "Activate the final beacon after delivery and final scan.",
    start: "cargo.delivered.01",
    steps: Object.freeze([
      { id: "scan-final", type: "waitForFact", fact: "scan.ruin.03" },
      { id: "activate-final", type: "waitForFact", fact: "final.beacon.activated" },
      { id: "complete-game", type: "emit", event: "game.completed" }
    ])
  },
  {
    id: "failure-recovery-sequence",
    purpose: "Keep recovery authored and inspectable instead of renderer-owned.",
    start: "game.failed",
    steps: Object.freeze([{ id: "prompt-retreat", type: "prompt", text: "Retreat from spores and rebuild signal" }])
  },
  {
    id: "restart-sequence",
    purpose: "Reset all domain state through public APIs.",
    start: "game.reset",
    steps: Object.freeze([{ id: "reset-complete", type: "emit", event: "game.ready" }])
  }
]);

export default signalIslesSequences;
