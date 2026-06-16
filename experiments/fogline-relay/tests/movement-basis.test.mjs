import assert from "node:assert/strict";

function forwardFromYaw(yaw) {
  return { x: Math.sin(yaw), z: -Math.cos(yaw) };
}

function rightFromYaw(yaw) {
  return { x: Math.cos(yaw), z: Math.sin(yaw) };
}

function moveDelta(yaw, moveX, moveZ) {
  const forward = forwardFromYaw(yaw);
  const right = rightFromYaw(yaw);
  return {
    x: right.x * moveX + forward.x * moveZ,
    z: right.z * moveX + forward.z * moveZ
  };
}

function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${label}: expected ${expected}, got ${actual}`);
}

{
  const delta = moveDelta(0, 0, 1);
  near(delta.x, 0, "yaw 0 W x");
  near(delta.z, -1, "yaw 0 W z");
}

{
  const delta = moveDelta(Math.PI / 2, 0, 1);
  near(delta.x, 1, "yaw +90 W x");
  near(delta.z, 0, "yaw +90 W z");
}

{
  const delta = moveDelta(0, 1, 0);
  near(delta.x, 1, "yaw 0 D x");
  near(delta.z, 0, "yaw 0 D z");
}

{
  const delta = moveDelta(Math.PI / 2, 1, 0);
  near(delta.x, 0, "yaw +90 D x");
  near(delta.z, 1, "yaw +90 D z");
}

console.log("Fogline Relay movement basis matches Three/FPS -Z forward convention.");
