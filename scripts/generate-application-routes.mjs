import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const root = process.cwd();

function titleFor(app) {
  return `${app.title} — NexusRealtime`;
}

function htmlFor(app) {
  const safeTitle = titleFor(app).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const safeId = app.id.replace(/[^a-z0-9-]/gi, "");
  const safeLabel = app.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="Generated NexusRealtime application route for ${safeLabel}." />
  <title>${safeTitle}</title>
  <style>
    :root{color-scheme:dark;--hud-bg:rgba(4,3,12,.88);--hud-bg-strong:rgba(2,2,8,.94);--hud-text:#fffaf0;--hud-muted:#ffe3a3;--hud-hot:#fff;--hud-outline:rgba(255,255,255,.20)}
    html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#05030d;color:var(--hud-text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}
    #app,#game{position:fixed;inset:0;width:100%;height:100%;display:block}
    #hud{position:fixed;left:18px;top:18px;z-index:4;max-width:min(760px,calc(100vw - 36px));display:grid;gap:8px;pointer-events:none;color:var(--hud-text);text-shadow:0 2px 14px rgba(0,0,0,.86)}
    #title,#status,#readout{width:max-content;max-width:100%;border-radius:16px;background:var(--hud-bg);box-shadow:0 18px 60px rgba(0,0,0,.44),inset 0 0 0 1px var(--hud-outline);-webkit-backdrop-filter:blur(16px) saturate(1.25);backdrop-filter:blur(16px) saturate(1.25)}
    #title{margin:0;padding:10px 13px;color:var(--hud-hot);font-weight:950;letter-spacing:.08em;text-transform:uppercase;font-size:.92rem}
    #status,#readout{margin:0;padding:8px 12px;color:var(--hud-muted);font-size:.82rem;font-weight:750;line-height:1.35}
    #err{position:fixed;z-index:6;inset:18px;overflow:auto;white-space:pre-wrap;padding:16px;color:#fff1ea;background:rgba(42,4,2,.94);border:0;border-radius:18px;box-shadow:0 22px 80px rgba(0,0,0,.54),inset 0 0 0 1px rgba(255,210,190,.22)}
    #err[hidden]{display:none}
    @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  </style>
</head>
<body data-app-id="${safeId}">
  <main id="app" aria-label="${safeLabel} application">
    <canvas id="game" role="application"></canvas>
    <aside id="hud" aria-label="Application HUD">
      <h1 id="title">${safeLabel}</h1>
      <p id="status">Loading…</p>
      <p id="readout"></p>
    </aside>
    <pre id="err" role="alert" hidden></pre>
  </main>
  <script type="module">
    import { startGeneratedApplicationRoute } from "../_shared/generated-app-route.js";
    startGeneratedApplicationRoute("${safeId}");
  </script>
</body>
</html>
`;
}

for (const app of aaaBatchGames) {
  const dir = join(root, "apps", app.id);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), htmlFor(app));
}

console.log(`Generated ${aaaBatchGames.length} promoted application route wrappers.`);
