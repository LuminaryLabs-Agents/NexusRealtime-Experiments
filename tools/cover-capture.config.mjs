export const coverCaptureConfig = Object.freeze({
  baseUrl: process.env.NEXUS_COVER_BASE_URL ?? "http://127.0.0.1:4173/",
  outputDir: process.env.NEXUS_COVER_OUTPUT_DIR ?? "generated-covers",
  manifestPath: process.env.NEXUS_COVER_MANIFEST_PATH ?? "experiments/_shared/generated-cover-manifest.json",
  viewport: Object.freeze({ width: 1280, height: 720 }),
  deviceScaleFactor: 1,
  tickCount: Number(process.env.NEXUS_COVER_TICKS ?? 90),
  dt: 1 / 60,
  format: "webp",
  quality: 82,
  timeoutMs: 15000
});
