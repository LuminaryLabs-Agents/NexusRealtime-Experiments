import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";
import { aaaBatchGames } from "../experiments/aaa-batch/host/game-registry.js";

const ROOT = process.cwd();
const DATA_PATH = join(ROOT, "experiments/_shared/nexus-gallery-data.js");
const INDEX_PATH = join(ROOT, "index.html");
const PROMOTED_APP_IDS = new Set(aaaBatchGames.map((app) => app.id));
const SEARCH_ROOTS = [
  { dir: "experiments", kind: "experiment", subtype: "experiment", tab: "experiments", tabLabel: "Experiments", playLabel: "Open experiment" },
  { dir: "apps", kind: "app", subtype: "game", playLabel: "Open app" },
  { dir: "games", kind: "app", subtype: "game", playLabel: "Open app", legacy: true }
];
const IGNORE = new Set(["_shared", "aaa-batch", "assets"]);

const CURATED = {
  "the-open-above-harness": {
    title: "The Open Above V2",
    featured: true,
    visual: "sora",
    subtype: "harness",
    tab: "experiments",
    playLabel: "Open harness",
    tags: [{ label: "Experiment", tone: "gold" }, { label: "Flight", tone: "green" }, { label: "3D", tone: "blue" }],
    description: "Clean high-fidelity free-flight harness for assisted bird carving, camera-relative sky, terrain patches, scatter, flocking, and validation-first composition."
  },
  "high-fidelity-meadow": {
    visual: "sora",
    subtype: "scene",
    tags: [{ label: "Experiment", tone: "gold" }, { label: "Procedural", tone: "green" }, { label: "Scene", tone: "blue" }],
    description: "Experiment-owned procedural WebGL meadow scene composed from terrain, wind, vegetation, creature, fur, sky, VFX, and visual-target domains."
  },
  "fogline-relay": {
    visual: "fogline",
    subtype: "experiment",
    tags: [{ label: "Experiment", tone: "gold" }, { label: "First Person", tone: "green" }, { label: "Fog", tone: "blue" }],
    description: "First-person survey-pressure loop for scan targets, fog zones, timed pressure, hazard state, and renderer-only visual buckets."
  },
  "living-agent-lab": {
    visual: "fogline",
    subtype: "lab",
    tags: [{ label: "Experiment", tone: "gold" }, { label: "Agent Lab", tone: "green" }, { label: "No LLM", tone: "blue" }],
    description: "Deterministic dry-run agent slice for memory, harness proposals, validation traces, and in-world dialogue without live model calls."
  },
  "onnx-agent-lab": {
    title: "ONNX Companion Workshop",
    visual: "sora",
    subtype: "workshop",
    tab: "experiments",
    tags: [{ label: "Experiment", tone: "gold" }, { label: "Workshop", tone: "green" }, { label: "ONNX", tone: "blue" }],
    description: "Walkable Three.js ONNX companion workshop where physical objects can be clicked, reviewed, questioned, and returned to their spawn positions."
  },
  "signal-bastion": {
    visual: "hell",
    subtype: "game",
    tags: [{ label: "App", tone: "gold" }, { label: "Game", tone: "green" }, { label: "Tactics", tone: "blue" }],
    description: "2.5D cel-style defense application with gameplay-only HUD, tower placement, upgrades, range rings, and a high-fidelity content pass."
  },
  "rogue-lite-hellscape-siege": {
    visual: "hell",
    subtype: "game",
    tags: [{ label: "App", tone: "gold" }, { label: "Game", tone: "green" }, { label: "Siege", tone: "red" }],
    description: "Unified high-fidelity base route for realm portals, inventory, harvesting, building, wave-defense, FX, and renderer-only presentation loop."
  }
};

function titleCase(slug) {
  return slug.split("-").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function getTitleFromHtml(html, slug) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
  return title && !/^NexusRealtime/i.test(title) ? title : h1 || titleCase(slug);
}

function getDescriptionFromHtml(html, slug, title) {
  const meta = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  const paragraph = html.match(/<p[^>]*>([\s\S]{20,240}?)<\/p>/i)?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return meta || paragraph || `NexusRealtime ${title || titleCase(slug)} route.`;
}

function visualFor(slug, title) {
  const text = `${slug} ${title}`.toLowerCase();
  if (/hell|ember|anvil|siege|verdict|forge/.test(text)) return "hell";
  if (/fog|signal|relay|core|underwater|echo/.test(text)) return "fogline";
  if (/zombie|orchid|mech|harvest/.test(text)) return "zombie";
  if (/ledge|mirror|prism|lock/.test(text)) return "next";
  return "sora";
}

function subtypeFor(slug, root) {
  if (root.kind === "experiment") return "experiment";
  if (/workshop|forge|builder|broker/.test(slug)) return "workshop";
  if (/cartographer|sim|calibrator|physics|orbit|gyro|magnetist|anvil|tideglass|core-diver|trench|distiller/.test(slug)) return "simulation";
  if (/agent|onnx|companion/.test(slug)) return "companion";
  return "game";
}

function tabFor(kind, subtype) {
  if (kind === "experiment") return "experiments";
  if (subtype === "tool" || subtype === "editor") return "tools";
  if (subtype === "simulator" || subtype === "simulation") return "simulations";
  if (subtype === "workshop" || subtype === "companion") return "workshops";
  return "games";
}

function labelForTab(tab) {
  return ({ experiments: "Experiments", games: "Games", workshops: "Workshops", simulations: "Simulations", tools: "Tools" })[tab] ?? titleCase(tab);
}

function tagsFor(slug, kind, subtype) {
  const words = slug.split("-").filter(Boolean);
  const first = words[0] ? words[0][0].toUpperCase() + words[0].slice(1) : subtype;
  return [
    { label: kind === "experiment" ? "Experiment" : "App", tone: "gold" },
    { label: titleCase(subtype), tone: "green" },
    { label: first, tone: "blue" }
  ];
}

function routeExists(route) {
  return existsSync(join(ROOT, route.replace(/^\.\//, ""), "index.html"));
}

function shouldSkipEntry(root, entryName) {
  if (IGNORE.has(entryName) || entryName.startsWith(".")) return true;
  return root.dir === "experiments" && PROMOTED_APP_IDS.has(entryName);
}

function discoverRoutes() {
  const routes = [];
  const seen = new Set();
  for (const root of SEARCH_ROOTS) {
    const absRoot = join(ROOT, root.dir);
    if (!existsSync(absRoot)) continue;
    for (const entry of readdirSync(absRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || shouldSkipEntry(root, entry.name)) continue;
      const indexPath = join(absRoot, entry.name, "index.html");
      if (!existsSync(indexPath)) continue;
      const id = entry.name;
      const route = `./${posix.join(root.dir, id)}/`;
      const key = `${root.dir}:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const html = readFileSync(indexPath, "utf8");
      const curated = CURATED[id] ?? {};
      const title = curated.title ?? getTitleFromHtml(html, id);
      const kind = curated.kind ?? root.kind;
      const subtype = curated.subtype ?? subtypeFor(id, root);
      const tab = curated.tab ?? root.tab ?? tabFor(kind, subtype);
      const app = {
        id,
        title,
        route,
        kind,
        subtype,
        tab,
        tabLabel: curated.tabLabel ?? root.tabLabel ?? labelForTab(tab),
        featured: Boolean(curated.featured),
        visual: curated.visual ?? visualFor(id, title),
        playLabel: curated.playLabel ?? root.playLabel,
        tags: curated.tags ?? tagsFor(id, kind, subtype),
        description: curated.description ?? getDescriptionFromHtml(html, id, title)
      };
      if (!routeExists(app.route)) throw new Error(`Generated missing route: ${app.route}`);
      routes.push(app);
    }
  }
  const tabOrder = { experiments: 0, games: 1, workshops: 2, simulations: 3, tools: 4 };
  routes.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const tabDiff = (tabOrder[a.tab] ?? 99) - (tabOrder[b.tab] ?? 99);
    if (tabDiff) return tabDiff;
    return a.title.localeCompare(b.title);
  });
  if (routes.length > 0 && !routes.some((route) => route.featured)) routes[0].featured = true;
  return routes;
}

function buildTabs(routes) {
  const tabOrder = ["experiments", "games", "workshops", "simulations", "tools"];
  const tabs = [];
  for (const tab of tabOrder) {
    const items = routes.filter((route) => route.tab === tab);
    if (!items.length) continue;
    tabs.push({ id: tab, label: labelForTab(tab), count: items.length });
  }
  for (const route of routes) {
    if (!tabs.some((tab) => tab.id === route.tab)) tabs.push({ id: route.tab, label: route.tabLabel ?? labelForTab(route.tab), count: routes.filter((item) => item.tab === route.tab).length });
  }
  return tabs;
}

function jsString(value) {
  return JSON.stringify(value, null, 2)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function writeGalleryData(routes) {
  const tabs = buildTabs(routes);
  const content = `// Auto-generated by scripts/generate-gallery-data.mjs.\n// Do not hand-curate this file; add real experiments/apps with index.html or update the generator metadata.\n\nexport const galleryConfig = Object.freeze({\n  title: "NexusRealtime Applications",\n  subtitle: "Experiments, apps, tools, workshops, simulations, and realtime routes",\n  repoUrl: "https://github.com/LuminaryLabs-Agents/NexusRealtime-Experiments",\n  hint: "Choose a tab, then drag, swipe, wheel, double-click, or use arrows to browse."\n});\n\nexport const tabs = Object.freeze(${jsString(tabs)});\n\nexport const apps = Object.freeze(${jsString(routes)});\n\nexport const games = apps;\n\nexport function getFeaturedGame(tabId = "experiments") {\n  return apps.find((app) => app.tab === tabId && app.featured) ?? apps.find((app) => app.tab === tabId) ?? apps[0] ?? null;\n}\n\nexport function getGameById(id) {\n  return apps.find((app) => app.id === id) ?? null;\n}\n`;
  writeFileSync(DATA_PATH, content);
}

function updateIndex(routes) {
  if (!existsSync(INDEX_PATH)) return;
  const index = readFileSync(INDEX_PATH, "utf8");
  const byTab = buildTabs(routes).map((tab) => {
    const links = routes.filter((route) => route.tab === tab.id).map((route) => `        <li><a href="${route.route.replace(/^\.\//, "./")}">${escapeHtml(route.title)}</a></li>`).join("\n");
    return `      <h2>${escapeHtml(tab.label)} (${tab.count})</h2>\n      <ul>\n${links}\n      </ul>`;
  }).join("\n");
  const noscript = `  <noscript>\n    <section class="nexus-noscript">\n      <h1>NexusRealtime Applications</h1>\n      <p>JavaScript is required for the interactive tabbed gallery. All generated main-branch routes are listed below.</p>\n${byTab}\n    </section>\n  </noscript>`;
  const version = `main-app-gallery-${routes.length}`;
  let next = index.replace(/  <noscript>[\s\S]*?  <\/noscript>/, noscript);
  next = next.replace(/nexus-experiments-shell\.js\?v=[^"']+/, `nexus-experiments-shell.js?v=${version}`);
  writeFileSync(INDEX_PATH, next);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const routes = discoverRoutes();
writeGalleryData(routes);
updateIndex(routes);
console.log(`Generated gallery data for ${routes.length} routes across ${buildTabs(routes).length} tabs.`);
