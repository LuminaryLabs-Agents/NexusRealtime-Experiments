import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  signalBastionMaps,
  signalBastionTowers,
  signalBastionEnemies,
  signalBastionWaves,
  signalBastionRewards,
  signalBastionCampaign
} from "../games/signal-bastion/presets/content.js";
import { signalBastionPresets, resolveSignalBastionPreset } from "../games/signal-bastion/presets/index.js";

const requiredFiles = [
  "games/signal-bastion/index.html",
  "games/signal-bastion/src/boot.js",
  "games/signal-bastion/src/input-host.js",
  "games/signal-bastion/src/renderer-canvas.js",
  "games/signal-bastion/presets/content.js",
  "games/signal-bastion/presets/default.js",
  "games/signal-bastion/presets/hard.js",
  "games/signal-bastion/presets/endless.js",
  "games/signal-bastion/presets/debug.js",
  "games/signal-bastion/presets/index.js"
];

for (const file of requiredFiles) assert.ok(existsSync(file), `${file} exists`);

assert.equal(Object.keys(signalBastionMaps).length, 3, "three maps");
assert.equal(Object.keys(signalBastionTowers).length, 12, "twelve towers");
assert.ok(Object.keys(signalBastionEnemies).length >= 15, "twelve enemies plus bosses");
assert.equal(Object.values(signalBastionEnemies).filter((enemy) => enemy.boss).length, 3, "three bosses");
assert.equal(signalBastionWaves.length, 30, "thirty authored waves");
assert.ok(signalBastionRewards.length >= 10, "reward pool exists");
assert.equal(signalBastionCampaign.nodes.length, 3, "campaign has one node per map");
assert.deepEqual(Object.keys(signalBastionPresets).sort(), ["debug", "default", "endless", "hard"]);
assert.equal(resolveSignalBastionPreset("?preset=hard").mode, "hard");
assert.equal(resolveSignalBastionPreset("?preset=endless").level.waves.length, 60);

const index = readFileSync("games/signal-bastion/index.html", "utf8");
assert.match(index, /src\/boot\.js\?v=aaa-dsk-phase/);

const boot = readFileSync("games/signal-bastion/src/boot.js", "utf8");
assert.match(boot, /generic-defense-aaa-kits/);
assert.match(boot, /resolveSignalBastionPreset/);
assert.match(boot, /getRewards/);
assert.match(boot, /getCampaign/);

const input = readFileSync("games/signal-bastion/src/input-host.js", "utf8");
assert.match(input, /defenseBuild/);
assert.match(input, /defenseWaves/);

const renderer = readFileSync("games/signal-bastion/src/renderer-canvas.js", "utf8");
assert.match(renderer, /draw\(snapshot/);
assert.doesNotMatch(renderer, /createRealtimeGame/);

console.log("signal-bastion full content static smoke passed");
