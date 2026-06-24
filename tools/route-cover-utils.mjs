export function normalizeRouteKey(route) {
  return String(route ?? "")
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/index\.html$/i, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .replace(/\/+$/, "") + "/";
}

export function routeSlug(route) {
  return normalizeRouteKey(route)
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function coverPathForRoute(route, config) {
  return `${config.outputDir}/${routeSlug(route)}.${config.format}`;
}

export function publicCoverPathForRoute(route, config) {
  return `${config.outputDir.replace(/^public\//, "")}/${routeSlug(route)}.${config.format}`;
}

export function routeUrl(baseUrl, route) {
  return new URL(String(route ?? "").replace(/^\.\//, ""), baseUrl).toString();
}

export function createManifestEntry(route, config, status = "ok", extra = {}) {
  return {
    cover: status === "ok" ? publicCoverPathForRoute(route, config) : null,
    capturedAtTick: config.tickCount,
    viewport: [config.viewport.width, config.viewport.height],
    format: config.format,
    quality: config.quality,
    source: "route-cover-capture",
    status,
    ...extra
  };
}
