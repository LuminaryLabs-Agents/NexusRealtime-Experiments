#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_MODEL = "z-ai/glm-5.1";
const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const TEXT_EXTENSIONS = new Set([".js", ".mjs", ".json", ".md", ".html", ".css", ".txt"]);
const MAX_FILE_BYTES = 24_000;
const MAX_GAME_FILES = 48;

function parseArgs(argv) {
  const options = {
    game: "",
    feedback: "",
    out: "",
    model: DEFAULT_MODEL,
    baseUrl: DEFAULT_BASE_URL,
    callNim: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--game") options.game = argv[++index] ?? "";
    else if (arg === "--feedback") options.feedback = argv[++index] ?? "";
    else if (arg === "--out") options.out = argv[++index] ?? "";
    else if (arg === "--model") options.model = argv[++index] ?? DEFAULT_MODEL;
    else if (arg === "--base-url") options.baseUrl = argv[++index] ?? DEFAULT_BASE_URL;
    else if (arg === "--call-nim") options.callNim = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function printHelp() {
  console.log(`NexusRealtime-KitInjector

Usage:
  npm run kit:inject -- --game games/rogue-lite-hellscape-siege --feedback feedback/rogue-lite-hellscape-siege/kit-extraction-feedback.md

Options:
  --game <path>       Existing game or experiment folder to review.
  --feedback <path>   Feedback markdown packet for the route.
  --out <path>        Output folder. Defaults to feedback/<route>/kit-injector.
  --call-nim          Call NVIDIA NIM. Default only writes context-packet.md.
  --model <name>      Default: ${DEFAULT_MODEL}
  --base-url <url>    Default: ${DEFAULT_BASE_URL}
`);
}

function repoRoot() {
  return process.cwd();
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function routeSlug(gamePath) {
  return path.basename(path.resolve(repoRoot(), gamePath));
}

function resolveOutDir(options) {
  if (options.out) return path.resolve(repoRoot(), options.out);
  const slug = routeSlug(options.game);
  return path.resolve(repoRoot(), "feedback", slug, "kit-injector");
}

async function readMaybe(relativePath) {
  const absolutePath = path.resolve(repoRoot(), relativePath);
  if (!existsSync(absolutePath)) return null;
  return {
    path: relativePath,
    content: await readTextLimited(absolutePath)
  };
}

async function readTextLimited(absolutePath) {
  const info = await stat(absolutePath);
  const raw = await readFile(absolutePath, "utf8");
  if (info.size <= MAX_FILE_BYTES) return raw;
  return `${raw.slice(0, MAX_FILE_BYTES)}\n\n[truncated at ${MAX_FILE_BYTES} bytes]\n`;
}

async function listTextFiles(rootPath) {
  const results = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      const ext = path.extname(entry.name);
      if (!TEXT_EXTENSIONS.has(ext)) continue;
      results.push(absolute);
      if (results.length >= MAX_GAME_FILES) return;
    }
  }
  await walk(rootPath);
  return results.slice(0, MAX_GAME_FILES);
}

async function readGameFiles(gamePath) {
  const absoluteGame = path.resolve(repoRoot(), gamePath);
  if (!existsSync(absoluteGame)) throw new Error(`Game path not found: ${gamePath}`);
  const files = await listTextFiles(absoluteGame);
  return Promise.all(files.map(async (absolute) => ({
    path: toPosix(path.relative(repoRoot(), absolute)),
    content: await readTextLimited(absolute)
  })));
}

async function listKitFolders(relativeRoot) {
  const absoluteRoot = path.resolve(repoRoot(), relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  const entries = await readdir(absoluteRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => toPosix(path.join(relativeRoot, entry.name)))
    .sort();
}

async function collectContext(options) {
  if (!options.game) throw new Error("--game is required");
  const files = [];
  for (const relativePath of [
    "goal.md",
    "memory.md",
    "README.md",
    ".agent/START_HERE.md",
    ".agent/cycle-state.md",
    ".agent/protokit-map.md",
    ".agent/architecture.md",
    options.feedback
  ].filter(Boolean)) {
    const file = await readMaybe(relativePath);
    if (file) files.push(file);
  }

  const gameFiles = await readGameFiles(options.game);
  const localKitFolders = await listKitFolders("protokits");
  const siblingProtoKitFolders = await listKitFolders("../NexusRealtime-ProtoKits/protokits");

  return {
    generatedAt: new Date().toISOString(),
    repo: path.basename(repoRoot()),
    branch: await gitValue(["branch", "--show-current"]),
    head: await gitValue(["rev-parse", "--short=12", "HEAD"]),
    game: toPosix(options.game),
    feedback: options.feedback ? toPosix(options.feedback) : "",
    files,
    gameFiles,
    localKitFolders,
    siblingProtoKitFolders
  };
}

async function gitValue(args) {
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync("git", args, { cwd: repoRoot(), encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "unknown";
}

function fenced(file) {
  return `### ${file.path}\n\n\`\`\`${path.extname(file.path).slice(1) || "txt"}\n${file.content.trim()}\n\`\`\``;
}

function renderPrompt(context) {
  const kitList = [
    "## Local Kit Folders",
    context.localKitFolders.length ? context.localKitFolders.map((entry) => `- ${entry}`).join("\n") : "- none found",
    "",
    "## Sibling ProtoKit Folders",
    context.siblingProtoKitFolders.length ? context.siblingProtoKitFolders.map((entry) => `- ${entry}`).join("\n") : "- sibling ProtoKits checkout not found"
  ].join("\n");

  return `# NexusRealtime Kit Injection Request

You are building a conservative kit-injection proposal for NexusRealtime.

Repo: ${context.repo}
Branch: ${context.branch}
Head: ${context.head}
Game: ${context.game}
Feedback: ${context.feedback || "not provided"}

Hard constraints:
- Do not remove functionality.
- Do not mutate existing game files in the proposal.
- Reusable implementation belongs in ProtoKits unless the repo explicitly needs a local proof fixture.
- Keep browser, DOM, Canvas, WebGL, Three.js, pointer input, audio, asset loading, and route-specific copy local.
- Prefer one reversible kit seam at a time.
- Require preservation checks before any source migration.

Required output:
1. Current game diagnosis.
2. Kit extraction candidates ordered by safety.
3. Exact files that should stay local.
4. Exact files or folders that should be added later.
5. Validation commands and human-view checks needed.
6. A first bounded implementation slice that preserves behavior.

${kitList}

## Repo Memory And Feedback

${context.files.map(fenced).join("\n\n")}

## Current Game Files

${context.gameFiles.map(fenced).join("\n\n")}
`;
}

async function callNim(options, prompt) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("Set NVIDIA_API_KEY or NVIDIA_NIM_API_KEY before using --call-nim");
  }
  const response = await fetch(`${options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        {
          role: "system",
          content: "You are a careful software architecture agent. Produce concise, file-grounded migration proposals. Never suggest deleting gameplay before parity checks exist."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4096
    })
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`NIM request failed (${response.status}): ${body}`);
  }
  const data = JSON.parse(body);
  return data.choices?.[0]?.message?.content ?? body;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const context = await collectContext(options);
  const prompt = renderPrompt(context);
  const outDir = resolveOutDir(options);
  await mkdir(outDir, { recursive: true });
  const packetPath = path.join(outDir, "context-packet.md");
  await writeFile(packetPath, prompt, "utf8");

  console.log(`Wrote ${toPosix(path.relative(repoRoot(), packetPath))}`);
  console.log(`Game files included: ${context.gameFiles.length}`);
  console.log(`Local kit folders: ${context.localKitFolders.length}`);
  console.log(`Sibling ProtoKit folders: ${context.siblingProtoKitFolders.length}`);

  if (!options.callNim) {
    console.log("Dry run complete. Pass --call-nim with NVIDIA_API_KEY to request a GLM 5.1 proposal.");
    return;
  }

  const proposal = await callNim(options, prompt);
  const responsePath = path.join(outDir, "response.md");
  await writeFile(responsePath, `${proposal.trim()}\n`, "utf8");
  console.log(`Wrote ${toPosix(path.relative(repoRoot(), responsePath))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
