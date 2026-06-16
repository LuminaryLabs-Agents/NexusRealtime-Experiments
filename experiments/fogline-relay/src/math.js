export const TAU = Math.PI * 2;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
export const distance2 = (a, b) => {
  const dx = Number(a?.x ?? 0) - Number(b?.x ?? 0);
  const dz = Number(a?.z ?? 0) - Number(b?.z ?? 0);
  return dx * dx + dz * dz;
};
export const distance = (a, b) => Math.sqrt(distance2(a, b));
export const wrapAngle = (angle) => {
  let out = Number(angle) || 0;
  while (out < -Math.PI) out += TAU;
  while (out > Math.PI) out -= TAU;
  return out;
};
export function normalize2(x, z) {
  const length = Math.hypot(Number(x) || 0, Number(z) || 0);
  return length > 0.0001 ? { x: x / length, z: z / length } : { x: 0, z: 0 };
}
export function forwardFromYaw(yaw) {
  return { x: Math.sin(yaw), z: -Math.cos(yaw) };
}
export function rightFromYaw(yaw) {
  return { x: Math.cos(yaw), z: Math.sin(yaw) };
}
