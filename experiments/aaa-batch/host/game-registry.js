export const aaaBatchGames = Object.freeze([
  {
    id: "ember-rail",
    title: "Ember Rail",
    route: "./experiments/aaa-batch/ember-rail/",
    fantasy: "Surf a molten mag-rail through a collapsing forge canyon.",
    verb: "Switch rails and vent heat",
    pressureLoop: "Speed rises, rails fracture, heat climbs, missed vents cause derail.",
    visualIdentity: "Orange-black foundry, molten rivers, sparks, rail glow, heat shimmer.",
    controls: "A/D switch rail, Space jump gaps, E vent at coolant gates, R restart.",
    kitStack: ["action-input-kit", "route-checkpoint-kit", "resource-pressure-kit", "visual-fidelity-maker-kit"],
    palette: ["#130604", "#ff7a2f", "#ffd166", "#1c0f0b"],
    smoke: ["switchLane:right", "jump", "vent"]
  },
  {
    id: "tideglass-salvage",
    title: "Tideglass Salvage",
    route: "./experiments/aaa-batch/tideglass-salvage/",
    fantasy: "Pilot a glass-hulled salvage skiff through storm ruins and extract relic crates.",
    verb: "Sail, dock, and recover",
    pressureLoop: "Wind drift, wave impact, cargo instability, storm timer.",
    visualIdentity: "Teal storm sea, glass reflections, sunken towers, foam trails, lightning silhouettes.",
    controls: "W/S throttle, A/D rudder, Shift trim sail, E recover at wreck, R restart.",
    kitStack: ["action-input-kit", "cargo-delivery-kit", "timed-pressure-director-kit", "water-surface-kit"],
    palette: ["#04191d", "#1dd3c7", "#9ef7ff", "#08293b"],
    smoke: ["throttle:1", "steer:right", "recover"]
  },
  {
    id: "echo-lock",
    title: "Echo Lock",
    route: "./experiments/aaa-batch/echo-lock/",
    fantasy: "Crack a cathedral vault by matching sonic tumblers before patrols hear you.",
    verb: "Tune resonance",
    pressureLoop: "Noise increases alert; wrong pulses scramble tumblers; patrol sweep closes.",
    visualIdentity: "Violet-gold vault rings, waveform lines, candlelit stone, pulse ripples.",
    controls: "Mouse tune cursor, A/D shift frequency, Space pulse, E dampen, R restart.",
    kitStack: ["action-input-kit", "timed-pressure-director-kit", "audio-event-feedback-maker-kit", "scenario-qa-harness"],
    palette: ["#12071d", "#b46cff", "#ffe36d", "#25142d"],
    smoke: ["tune:1", "pulse", "dampen"]
  },
  {
    id: "hollow-warden",
    title: "Hollow Warden",
    route: "./experiments/aaa-batch/hollow-warden/",
    fantasy: "Defend a dying forest beacon by placing living wards against corruption.",
    verb: "Place and rotate wards",
    pressureLoop: "Corruption waves split lanes; beacon charge drains; bad placement leaks damage.",
    visualIdentity: "Emerald-black grove, luminous roots, ward sigils, creeping shadow veins.",
    controls: "Mouse place ward, Q/E rotate, 1/2/3 select ward type, Space channel beacon, R restart.",
    kitStack: ["zone-field-kit", "hazard-director-kit", "resource-pressure-kit", "gamehost-standard-kit"],
    palette: ["#06160d", "#38d47a", "#caff75", "#081f13"],
    smoke: ["selectWard:root", "placeWard", "channel"]
  },
  {
    id: "skyrig-suture",
    title: "Skyrig Suture",
    route: "./experiments/aaa-batch/skyrig-suture/",
    fantasy: "Repair a floating storm rig by tethering broken conduits before platforms shear away.",
    verb: "Tether and repair",
    pressureLoop: "Platforms drift apart; conduit arcs destabilize; battery drains while tethered.",
    visualIdentity: "Blue-white sky platforms, brass rigging, electric cables, cloud abyss, repair sparks.",
    controls: "WASD move, mouse aim, Click fire tether, Hold E repair, Space jump, R restart.",
    kitStack: ["action-input-kit", "route-field-kit", "resource-pressure-kit", "camera-cinematic-maker-kit"],
    palette: ["#071526", "#7bdff2", "#ffd166", "#17324d"],
    smoke: ["move:conduit", "fireTether", "repair"]
  },
  {
    id: "mirage-stalker",
    title: "Mirage Stalker",
    route: "./experiments/aaa-batch/mirage-stalker/",
    fantasy: "Cross a sun-blasted palace by blinking between shadows while sentries scan.",
    verb: "Shadow-step",
    pressureLoop: "Exposure rises in light; guard cones sweep; blink charges recover only in shade.",
    visualIdentity: "Gold desert palace, blue shadow pools, heat haze, white sun shafts, sentinel masks.",
    controls: "WASD move, Click shadow-step to valid shade, E throw decoy, Shift crouch, R restart.",
    kitStack: ["action-input-kit", "spatial-guidance-kit", "agent-group-kit", "hazard-director-kit"],
    palette: ["#1d1407", "#f3bd37", "#57c7ff", "#3d260a"],
    smoke: ["blink:shade", "crouch", "decoy"]
  },
  {
    id: "core-diver",
    title: "Core Diver",
    route: "./experiments/aaa-batch/core-diver/",
    fantasy: "Dive into a flooded reactor core to extract rods before radiation peaks.",
    verb: "Dive, grab, and surface",
    pressureLoop: "Oxygen falls, radiation climbs with depth, current pushes player off route.",
    visualIdentity: "Cyan reactor pool, green radiation bloom, bubbles, red warning strobes, metallic depth layers.",
    controls: "WASD swim, Space dive/surface axis, E grab rod, Shift burst swim, R restart.",
    kitStack: ["water-surface-kit", "resource-pressure-kit", "cargo-delivery-kit", "scenario-qa-harness"],
    palette: ["#031416", "#00d5ff", "#6bf0b8", "#10252a"],
    smoke: ["vertical:down", "grab", "vertical:up"]
  },
  {
    id: "starwell-cartographer",
    title: "Starwell Cartographer",
    route: "./experiments/aaa-batch/starwell-cartographer/",
    fantasy: "Map a shifting astral basin by anchoring beacons before the rift folds shut.",
    verb: "Survey and anchor",
    pressureLoop: "Rift drift corrupts map coverage; anchors stabilize zones but consume charge.",
    visualIdentity: "Indigo starfield terrain, luminous grid lines, floating islands, compass beams, cosmic fog.",
    controls: "WASD move cursor/ship, Click place anchor, Q scan pulse, E recall anchor, R restart.",
    kitStack: ["scan-survey-kit", "route-field-kit", "resource-pressure-kit", "deterministic-replay-harness"],
    palette: ["#090b24", "#7c6cff", "#f5f1ff", "#14154a"],
    smoke: ["scan", "placeAnchor", "placeAnchor"]
  }
]);

export const aaaBatchGalleryGames = Object.freeze(aaaBatchGames.map((game) => ({
  id: `aaa-${game.id}`,
  title: game.title,
  route: game.route,
  kind: "experiment",
  visual: "showcase",
  playLabel: "Play seed",
  tags: [
    { label: "AAA seed", tone: "gold" },
    { label: game.verb.split(" ")[0], tone: "green" },
    { label: game.kitStack[0], tone: "blue" }
  ],
  description: `${game.fantasy} ${game.pressureLoop}`
})));

export function getAaaBatchGame(id) {
  return aaaBatchGames.find((game) => game.id === id) ?? null;
}
