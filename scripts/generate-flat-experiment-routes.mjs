import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const root = process.cwd();

function titleFor(game) {
  return `${game.title} — NexusRealtime`;
}

function htmlFor(game) {
  const safeTitle = titleFor(game).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const safeId = game.id.replace(/[^a-z0-9-]/gi, "");
  const safeLabel = game.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body data-game-id="${safeId}">
  <main id="app" aria-label="${safeLabel} experiment">
    <canvas id="game" role="application"></canvas>
    <aside id="hud" aria-label="Experiment HUD">
      <h1 id="title">${safeLabel}</h1>
      <p id="status">Loading…</p>
      <p id="readout"></p>
    </aside>
    <pre id="err" role="alert" hidden></pre>
  </main>
  <script type="module">
    import { startFlatAaaExperimentRoute } from "../_shared/aaa-flat-route.js";
    startFlatAaaExperimentRoute("${safeId}");
  </script>
</body>
</html>
`;
}

for (const game of aaaBatchGames) {
  const dir = join(root, "experiments", game.id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), htmlFor(game));
}

console.log(`Generated ${aaaBatchGames.length} flat experiment route wrappers.`);
