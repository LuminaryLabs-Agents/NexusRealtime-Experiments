import assert from "node:assert/strict";
import {
  coverPathForRoute,
  createManifestEntry,
  normalizeRouteKey,
  publicCoverPathForRoute,
  routeSlug,
  routeUrl
} from "../tools/route-cover-utils.mjs";

const config = {
  baseUrl: "http://127.0.0.1:4173/",
  outputDir: "public/generated-covers",
  viewport: { width: 1280, height: 720 },
  tickCount: 90,
  format: "webp",
  quality: 82
};

assert.equal(normalizeRouteKey("./experiments/fogline-relay/"), "experiments/fogline-relay/");
assert.equal(routeSlug("./games/example-route/"), "games-example-route");
assert.equal(coverPathForRoute("./experiments/fogline-relay/", config), "public/generated-covers/experiments-fogline-relay.webp");
assert.equal(publicCoverPathForRoute("./experiments/fogline-relay/", config), "generated-covers/experiments-fogline-relay.webp");
assert.equal(routeUrl(config.baseUrl, "./experiments/fogline-relay/"), "http://127.0.0.1:4173/experiments/fogline-relay/");

const entry = createManifestEntry("./experiments/fogline-relay/", config);
assert.equal(entry.cover, "generated-covers/experiments-fogline-relay.webp");
assert.equal(entry.capturedAtTick, 90);
assert.equal(entry.status, "ok");
