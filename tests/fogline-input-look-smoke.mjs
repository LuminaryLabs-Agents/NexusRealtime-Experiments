import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const input = readFileSync("experiments/fogline-relay/src/input-adapter.js", "utf8");
const kit = readFileSync("experiments/fogline-relay/src/fogline-relay-kit.js", "utf8");
const renderer = readFileSync("experiments/fogline-relay/src/three-renderer.js", "utf8");

assert.ok(input.includes("turn += event.movementX"), "mouse right should increase yaw and mouse left should decrease yaw");
assert.ok(input.includes("pitch -= event.movementY"), "mouse vertical movement should create pitch input");
assert.ok(input.includes("ArrowUp") && input.includes("ArrowDown"), "keyboard pitch fallback should exist");
assert.ok(input.includes("ArrowRight") && input.includes("ArrowLeft"), "keyboard yaw fallback should exist");
assert.ok(input.includes("pitch:"), "input payload should include pitch");

assert.ok(kit.includes("pitch: clamp"), "player state should initialize clamped pitch");
assert.ok(kit.includes("eyeHeight: 1.82"), "player should use about 2m body height with first-person eye height");
assert.ok(kit.includes("Number(input.pitch"), "relay kit should consume pitch input");
assert.ok(renderer.includes("player.pitch"), "renderer should read player pitch");
assert.ok(renderer.includes("Math.sin(pitch)"), "renderer should look up/down from pitch");

console.log("Fogline input look smoke passed.");
