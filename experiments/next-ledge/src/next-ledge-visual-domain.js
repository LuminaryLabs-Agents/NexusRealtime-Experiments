const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, n(value, min)));

function currentRegion(snapshot = {}) {
  if (snapshot.completed || snapshot.mode === "won") return "summit";
  if (["falling", "launched", "retracting"].includes(snapshot.mode)) return "danger-fall";
  if ((snapshot.stamina ?? 100) / Math.max(1, snapshot.constants?.maxStamina ?? 100) < 0.24) return "low-stamina";
  if ((snapshot.player?.y ?? 0) > 1600) return "cloud-ascent";
  return "cliff-default";
}

function routeDecorationTargets(snapshot = {}) {
  const chunks = (snapshot.route?.chunks ?? []).slice(-10).map((chunk, index) => ({
    id: `cliff-depth-${chunk.id ?? index}`,
    kind: "cliff-silhouette",
    layer: index % 2 ? "mid-static" : "far-static",
    depthPlane: index % 2 ? "mid" : "far",
    parallaxLayerId: index % 2 ? "mid-cliff" : "distant-cliff",
    styleId: index % 2 ? "cliff-default" : "distant-blue-haze",
    transform: { x: index % 2 ? -265 : 235, y: n(chunk.y) + n(chunk.h) * 0.5, z: -110, scale: 1 + (index % 3) * 0.12 },
    visual: { layer: index % 2 ? "mid-static" : "far-static", mesh: "cliff-card", material: "cliff-shadow" }
  }));

  const ledges = (snapshot.route?.ledges ?? []).map((ledge) => ({
    id: `ledge-style-${ledge.id}`,
    kind: ledge.type === "summit" ? "summit-anchor" : ledge.type === "rest" ? "rest-anchor" : "climb-anchor",
    layer: "interactive",
    depthPlane: "gameplay",
    parallaxLayerId: "gameplay",
    styleId: ledge.type === "summit" ? "summit-gold" : ledge.type === "rest" ? "safe-rest" : "cliff-default",
    transform: { x: ledge.x, y: ledge.y, z: 0, scale: 1 },
    visual: { layer: "interactive", material: ledge.type === "summit" ? "summit-gold" : ledge.type === "rest" ? "rest-green" : "anchor-cyan" }
  }));

  return [...chunks, ...ledges];
}

export function createNextLedgeVisualTargets(snapshot = {}) {
  return [
    { id: "sky-dome", kind: "sky-gradient", layer: "sky", depthPlane: "sky", parallaxLayerId: "sky", styleId: "cold-night-sky" },
    { id: "far-cloud-band", kind: "cloud-band", layer: "far-static", depthPlane: "far", parallaxLayerId: "far-clouds", styleId: currentRegion(snapshot) === "summit" ? "summit-gold" : "cloud-ascent" },
    { id: "distant-cliff-band", kind: "cliff-band", layer: "far-static", depthPlane: "far", parallaxLayerId: "distant-cliff", styleId: "distant-blue-haze" },
    { id: "foreground-vines", kind: "foreground-mask", layer: "near-static", depthPlane: "foreground", parallaxLayerId: "foreground", styleId: "foreground-silhouette" },
    { id: "player-readable", kind: "player", layer: "character", depthPlane: "gameplay", parallaxLayerId: "gameplay", styleId: currentRegion(snapshot) === "danger-fall" ? "danger-fall" : "player-readable" },
    ...routeDecorationTargets(snapshot)
  ];
}

export function createNextLedgeParallaxInput(snapshot = {}) {
  const region = currentRegion(snapshot);
  const cam = snapshot.camera ?? {};
  const y = n(snapshot.player?.y, 0);
  return {
    activeProfileId: region === "summit" ? "summit-parallax" : "vertical-climb-parallax",
    camera: { x: n(cam.x), y: n(cam.y, y), zoom: 1, trauma: clamp(cam.trauma, 0, 1), mode: snapshot.mode ?? "swinging" },
    viewport: { width: 1280, height: 720 },
    profiles: [
      {
        id: "vertical-climb-parallax",
        fog: { color: "#9ec8d7", density: region === "danger-fall" ? 0.18 : region === "cloud-ascent" ? 0.14 : 0.08 },
        depthPlanes: [
          { id: "sky", depth: 0.04, factorX: 0.015, factorY: 0.006, fogReceive: 0.95, shakeInfluence: 0.04 },
          { id: "far", depth: 0.16, factorX: 0.09, factorY: 0.045, fogReceive: 0.75, shakeInfluence: 0.12 },
          { id: "mid", depth: 0.48, factorX: 0.34, factorY: 0.18, fogReceive: 0.38, shakeInfluence: 0.32 },
          { id: "gameplay", depth: 1, factorX: 1, factorY: 1, fogReceive: 0.1, shakeInfluence: 0.7 },
          { id: "foreground", depth: 1.36, factorX: 1.22, factorY: 1.08, fogReceive: 0.03, shakeInfluence: 1.1 }
        ],
        layers: [
          { id: "sky", depthPlane: "sky", renderLayer: "sky", scrollX: -0.0008, alpha: 1 },
          { id: "far-clouds", depthPlane: "far", renderLayer: "far-static", scrollX: -0.014, repeat: { x: true, tileWidth: 780 }, styleId: "cloud-ascent" },
          { id: "distant-cliff", depthPlane: "far", renderLayer: "far-static", scrollX: -0.002, repeat: { x: true, tileWidth: 620 }, styleId: "distant-blue-haze" },
          { id: "mid-cliff", depthPlane: "mid", renderLayer: "mid-static", scrollX: 0.001, styleId: "cliff-default" },
          { id: "gameplay", depthPlane: "gameplay", renderLayer: "interactive", styleId: "readable-climb-plane" },
          { id: "foreground", depthPlane: "foreground", renderLayer: "near-static", scrollX: 0.006, repeat: { x: true, tileWidth: 560 }, styleId: "foreground-silhouette", occlusion: { fadeNearActor: true, revealRadius: 120 } }
        ],
        budget: { maxTilesPerLayer: 9, maxDescriptors: 700 }
      },
      {
        id: "summit-parallax",
        extends: "vertical-climb-parallax",
        fog: { color: "#ffd65a", density: 0.16 }
      }
    ],
    objects: createNextLedgeVisualTargets(snapshot)
  };
}

export function createNextLedgeRenderStyleInput(snapshot = {}, parallaxSnapshot = null) {
  const region = currentRegion(snapshot);
  return {
    defaultStyle: "cliff-default",
    mode: snapshot.mode ?? "swinging",
    region,
    scene: "next-ledge",
    parallaxSnapshot,
    targets: createNextLedgeVisualTargets(snapshot),
    profiles: [
      {
        id: "cliff-default",
        layers: {
          sky: { palette: "cold-night", alpha: 1 },
          "far-static": { fog: 0.72, alpha: 0.82, colorGrade: "blue-haze" },
          "mid-static": { fog: 0.32, alpha: 1, contrast: 0.9 },
          "near-static": { fog: 0.08, alpha: 0.78, contrast: 1.1 },
          interactive: { readable: true, glow: 1.15 },
          character: { readable: true, contrast: 1.25, rim: "#ffb83d" },
          "world-ui": { readable: true, alpha: 0.94 }
        },
        fog: { color: "#9ec8d7", density: 0.08 },
        light: { key: "#00f0ff", fill: "#132a40", bloom: 0.5 }
      },
      {
        id: "cloud-ascent",
        extends: "cliff-default",
        layers: { "far-static": { fog: 0.55, alpha: 0.9, softness: 0.92 }, sky: { palette: "cloud-moon" } },
        fog: { color: "#cfe8ff", density: 0.14 },
        light: { key: "#bfeaff", bloom: 0.65 }
      },
      {
        id: "danger-fall",
        extends: "cliff-default",
        layers: { "far-static": { motionStreaks: 0.6 }, "near-static": { motionStreaks: 1.2, alpha: 0.68 }, interactive: { glow: 1.6 }, character: { rim: "#ff3858" } },
        fog: { color: "#ff3858", density: 0.16 },
        light: { key: "#ff3858", bloom: 0.78 },
        motion: { speedLines: true, fallStreaks: true }
      },
      {
        id: "summit-gold",
        extends: "cliff-default",
        layers: { sky: { palette: "gold-dawn" }, "far-static": { fog: 0.42, alpha: 0.92 }, interactive: { glow: 2.2 }, character: { rim: "#ffd65a" }, "world-ui": { color: "#fff4b8" } },
        fog: { color: "#ffd65a", density: 0.18 },
        light: { key: "#ffd65a", bloom: 1.4 }
      },
      { id: "foreground-silhouette", extends: "cliff-default", layers: { "near-static": { alpha: 0.62, contrast: 1.35, revealNearPlayer: true } } },
      { id: "distant-blue-haze", extends: "cliff-default", layers: { "far-static": { alpha: 0.48, fog: 0.85 } } },
      { id: "safe-rest", extends: "cliff-default", layers: { interactive: { glow: 1.8, color: "#3dffa3" } } },
      { id: "player-readable", extends: "cliff-default", layers: { character: { contrast: 1.4, rim: "#ffb83d" } } }
    ],
    designations: [
      { when: { mode: "falling" }, style: "danger-fall", priority: 80 },
      { when: { mode: "launched" }, style: "danger-fall", priority: 72 },
      { when: { mode: "retracting" }, style: "danger-fall", priority: 70 },
      { when: { region: "summit" }, style: "summit-gold", priority: 90 },
      { when: { region: "cloud-ascent" }, style: "cloud-ascent", priority: 55 },
      { when: { layer: "near-static" }, style: "foreground-silhouette", priority: 35 },
      { when: { parallaxLayer: "far-clouds" }, style: "cloud-ascent", priority: 40 }
    ]
  };
}

export function createNextLedgeVisualQualityReport(snapshot = {}, parallaxSnapshot = null, styleSnapshot = null) {
  return {
    version: "next-ledge-visual-fidelity-0.3.0",
    uses: ["parallax-kit", "configurable-render-layer-kit"],
    region: currentRegion(snapshot),
    parallaxLayers: parallaxSnapshot?.layers?.length ?? 0,
    styledTargets: styleSnapshot?.targets?.length ?? 0,
    rendererContract: "renderer reads descriptor snapshots only"
  };
}
