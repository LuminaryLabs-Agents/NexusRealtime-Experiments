export const ORBIT_CAMERA_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createOrbitCameraKit(config = {}) {
  let state = { angle: toNumber(config.angle, 0.35), pitch: toNumber(config.pitch, 0.55), distance: toNumber(config.distance, 42), target: config.target ?? { x: 0, y: 2, z: 0 }, autoRotate: config.autoRotate ?? true };
  return {
    id: "orbit-camera-kit",
    version: ORBIT_CAMERA_KIT_VERSION,
    domain: "orbit-camera",
    provides: ["camera:orbit", "camera:target", "camera:input"],
    setInput(input = {}) {
      state.angle += toNumber(input.dragX, 0) * 0.006;
      state.pitch = Math.max(0.18, Math.min(1.08, state.pitch + toNumber(input.dragY, 0) * 0.004));
      state.distance = Math.max(18, Math.min(80, state.distance + toNumber(input.zoom, 0)));
    },
    tick(delta = 1 / 60) {
      if (state.autoRotate) state.angle += delta * 0.045;
      return this.getState();
    },
    getState() {
      const x = Math.cos(state.angle) * state.distance;
      const z = Math.sin(state.angle) * state.distance;
      const y = Math.sin(state.pitch) * state.distance * 0.45 + state.target.y;
      return { ...state, position: { x, y, z }, forward: { x: -x, y: state.target.y - y, z: -z } };
    }
  };
}

export default createOrbitCameraKit;
