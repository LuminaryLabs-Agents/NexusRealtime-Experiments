import assert from "node:assert/strict";
import { normalizeMoveAxes } from "../_kits/riftbound/riftbound-shared-kits.js";
import { computeCameraRelativeMoveFromVectors } from "../_kits/riftbound/riftbound-shared-kits.js";
import { yawFromDirection } from "../_kits/riftbound/riftbound-shared-kits.js";
import { normalizedPointerToNdc } from "../_kits/riftbound/riftbound-shared-kits.js";

const diag = normalizeMoveAxes(1, 1);
assert.ok(Math.abs(Math.hypot(diag.moveX, diag.moveY) - 1) < 1e-9, "diagonal input is normalized");

const forward = { x: 0, y: 0, z: -1 };
const right = { x: 1, y: 0, z: 0 };
assert.deepEqual(computeCameraRelativeMoveFromVectors({ forward, right, moveX: 0, moveY: 1 }), { x: 0, y: 0, z: -1, length: 1 });
assert.deepEqual(computeCameraRelativeMoveFromVectors({ forward, right, moveX: 1, moveY: 0 }), { x: 1, y: 0, z: 0, length: 1 });

assert.ok(Math.abs(yawFromDirection({ x: 1, z: 0 }) - Math.PI / 2) < 1e-9, "right-facing yaw is 90 degrees");
assert.equal(yawFromDirection({ x: 0, z: 0 }), null, "zero vector has no facing yaw");

assert.deepEqual(normalizedPointerToNdc({ x: 2, y: -2 }), { x: 1, y: -1 });

console.log("control math smoke passed");
