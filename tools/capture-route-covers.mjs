#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { coverCaptureConfig } from "./cover-capture.config.mjs";
import {
  coverPathForRoute,
  createManifestEntry,
  normalizeRouteKey,
  routeUrl
} from "./route-cover-utils.mjs";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const updateManifestOnly = args.has("--manifest-only");

async function loadRoutes() {
  const moduleUrl = new URL("../experiments/_shared/nexus-gallery-data.js", import.meta.url);
  const gallery = await import(moduleUrl.href);
  return (gallery.apps ?? [])
    .filter((app) => app?.route && !app.disabled)
    .map((app) => ({ id: app.id, title: app.title, route: app.route }));
}

async function loadExistingManifest(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return {};
  }
}

async function writeManifest(path, manifest) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    throw new Error("Playwright is required for real cover capture. Install it or run with --dry-run.", { cause: error });
  }
}

async function captureRoute(browser, route, config) {
  const page = await browser.newPage({
    viewport: config.viewport,
    deviceScaleFactor: config.deviceScaleFactor
  });

  try {
    await page.goto(routeUrl(config.baseUrl, route.route), {
      waitUntil: "networkidle",
      timeout: config.timeoutMs
    });

    await page.waitForFunction(() => {
      return Boolean(window.GameHost && typeof window.GameHost.tick === "function");
    }, { timeout: config.timeoutMs });

    await page.evaluate(() => {
      window.GameHost.stop?.();
      window.GameHost.setCoverCamera?.();
      window.GameHost.hideHudForCapture?.();
    });

    await page.waitForFunction(() => {
      const host = window.GameHost;
      if (!host) return false;
      if (typeof host.captureReady !== "function") return true;
      return Boolean(host.captureReady());
    }, { timeout: config.timeoutMs });

    for (let index = 0; index < config.tickCount; index += 1) {
      await page.evaluate((dt) => window.GameHost.tick(dt), config.dt);
    }

    await page.evaluate(() => new Promise(requestAnimationFrame));

    const canvas = await page.$("canvas");
    if (!canvas) throw new Error("No canvas found after route became capture-ready.");

    const outputPath = coverPathForRoute(route.route, config);
    await mkdir(dirname(outputPath), { recursive: true });
    await canvas.screenshot({
      path: outputPath,
      type: config.format,
      quality: config.quality
    });

    return createManifestEntry(route.route, config, "ok");
  } catch (error) {
    return createManifestEntry(route.route, config, "failed", {
      reason: String(error?.message ?? error)
    });
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const config = coverCaptureConfig;
  const routes = await loadRoutes();
  const manifest = await loadExistingManifest(config.manifestPath);
  manifest._meta = {
    purpose: "Generated route cover manifest consumed by the NexusRealtime gallery.",
    defaultCaptureTick: config.tickCount,
    viewport: [config.viewport.width, config.viewport.height],
    format: config.format,
    quality: config.quality,
    fallbackPolicy: ["generated cover", "route-defined static cover", "quiet procedural placeholder", "text-only row"]
  };

  if (dryRun || updateManifestOnly) {
    for (const route of routes) {
      const key = normalizeRouteKey(route.route);
      manifest[key] ??= createManifestEntry(route.route, config, "pending", {
        reason: dryRun ? "dry-run" : "manifest-only"
      });
    }
    await writeManifest(config.manifestPath, manifest);
    console.log(`Prepared cover manifest entries for ${routes.length} routes.`);
    return;
  }

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  try {
    for (const route of routes) {
      const key = normalizeRouteKey(route.route);
      manifest[key] = await captureRoute(browser, route, config);
      console.log(`${manifest[key].status.padEnd(7)} ${key}`);
    }
  } finally {
    await browser.close();
  }

  await writeManifest(config.manifestPath, manifest);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
