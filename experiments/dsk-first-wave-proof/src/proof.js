import { createRealtimeGame } from "../../../../NexusRealtime/src/index.js";
import {
  createNHazardDirectorKit,
  createNResourcePressureKit,
  createNRouteCheckpointKit,
  createNScanSurveyKit,
  createNZoneFieldKit
} from "../../../../NexusRealtime-ProtoKits/protokits/domain-foundation/index.js";
import { createNCompletionLedgerKit } from "../../../../NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js";

export function createDskFirstWaveProof() {
  const engine = createRealtimeGame({
    kits: [
      createNZoneFieldKit(),
      createNScanSurveyKit({ radius: 4 }),
      createNRouteCheckpointKit(),
      createNResourcePressureKit(),
      createNHazardDirectorKit(),
      createNCompletionLedgerKit()
    ]
  });

  engine.n.zoneField.registerZone({ id: "proof-zone", x: 0, y: 0, radius: 5 });
  engine.n.zoneField.setEntityPosition("player", { x: 1, y: 0 });
  engine.n.scanSurvey.registerTarget({ id: "proof-relay", x: 2, y: 0, radius: 0.5, required: 1 });
  engine.n.scanSurvey.pulse({ origin: { x: 0, y: 0 }, radius: 4, amount: 1, commandId: "proof-scan" });
  engine.n.routeCheckpoint.registerRoute({ id: "proof-route", checkpoints: ["gate-a"] });
  engine.n.routeCheckpoint.enter("gate-a");
  engine.n.resourcePressure.register({ id: "signal", value: 1, min: 0, max: 1, rate: -0.25 });
  engine.n.hazardDirector.register({ id: "proof-hazard" });
  engine.n.hazardDirector.activate("proof-hazard");
  engine.n.completionLedger.completeInteraction("proof-relay");
  engine.tick(0.5);

  return {
    installed: Object.keys(engine.n).sort(),
    scanCompleted: engine.n.scanSurvey.getSnapshot().completedTargetIds,
    routeProgress: engine.n.routeCheckpoint.getSnapshot().progressByRouteId["proof-route"],
    signal: engine.n.resourcePressure.getSnapshot().resources.signal.value,
    hazardActive: engine.n.hazardDirector.getSnapshot().hazards["proof-hazard"].active,
    ledgerCompleted: engine.n.completionLedger.getSnapshot().domain.interaction.completed,
    zoneSample: engine.n.zoneField.sample({ x: 1, y: 0 })
  };
}

export function runDskFirstWaveProof(root = globalThis.document) {
  const proof = createDskFirstWaveProof();
  const target = root?.getElementById?.("proof-status");
  if (target) {
    target.textContent = JSON.stringify(proof, null, 2);
  }
  return proof;
}

if (typeof document !== "undefined") {
  runDskFirstWaveProof(document);
}
