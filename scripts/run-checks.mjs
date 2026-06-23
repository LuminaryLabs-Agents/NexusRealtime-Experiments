import { spawnSync } from "node:child_process";

const fullCheckSuites = [
  "tests/js-syntax-smoke.mjs",
  "tests/static-site-smoke.mjs",
  "tests/content-smoke.mjs",
  "tests/next-ledge-grapple-static-smoke.mjs",
  "tests/canonical-game-routes-smoke.mjs",
  "tests/domain-cutover-manifest-smoke.mjs",
  "tests/canonical-route-pruning-map-smoke.mjs",
  "tests/canonical-route-replay-manifest-smoke.mjs",
  "tests/headless-lane-replay-contracts-smoke.mjs",
  "tests/signal-bastion-replay-bridge-smoke.mjs",
  "tests/signal-bastion-route-domain-replay-spec-smoke.mjs",
  "tests/nexus-realtime-loader-smoke.mjs",
  "tests/fogline-three-renderer-smoke.mjs",
  "tests/fogline-environment-content-smoke.mjs",
  "tests/fogline-input-look-smoke.mjs",
  "tests/fogline-movement-basis-smoke.mjs",
  "tests/open-above-static-smoke.mjs",
  "tests/open-above-v2-static-smoke.mjs",
  "tests/signal-bastion-static-smoke.mjs",
  "tests/signal-isles-static-smoke.mjs",
  "tests/signal-isles-data-smoke.mjs",
  "tests/signal-isles-replay-smoke.mjs",
  "tests/aaa-batch-static-smoke.mjs",
  "tests/aaa-batch-gamehost-contract-smoke.mjs",
  "tests/agent-labs-static-smoke.mjs",
  "tests/high-fidelity-meadow-cutover-smoke.mjs",
  "tests/tropical-island-scene-static-smoke.mjs",
  "tests/experiment-flat-routes-smoke.mjs",
  "tests/gallery-coverage-smoke.mjs",
  "tests/contrast-token-smoke.mjs"
];

const deployCheckSuites = [
  "tests/js-syntax-smoke.mjs",
  "tests/static-site-smoke.mjs",
  "tests/canonical-game-routes-smoke.mjs",
  "tests/domain-cutover-manifest-smoke.mjs",
  "tests/canonical-route-pruning-map-smoke.mjs",
  "tests/canonical-route-replay-manifest-smoke.mjs",
  "tests/headless-lane-replay-contracts-smoke.mjs",
  "tests/signal-bastion-replay-bridge-smoke.mjs",
  "tests/signal-bastion-route-domain-replay-spec-smoke.mjs",
  "tests/experiment-flat-routes-smoke.mjs",
  "tests/gallery-coverage-smoke.mjs",
  "tests/contrast-token-smoke.mjs"
];

const suites = process.argv.includes("--deploy") ? deployCheckSuites : fullCheckSuites;

for (const suite of suites) {
  const result = spawnSync(process.execPath, [suite], { stdio: "inherit" });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
