export const FALL_MOTION_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export function createFallMotionKit(config = {}) {
  const gravity = toNumber(config.gravity, 9.8);
  return {
    id: "fall-motion-kit",
    version: FALL_MOTION_KIT_VERSION,
    domain: "fall-motion",
    provides: ["fall:motion", "fall:gravity", "fall:landing"],
    release(object = {}, velocity = {}) {
      return { ...clone(object), state: "falling", velocity: { x: toNumber(velocity.x, 0), y: toNumber(velocity.y, 0), z: toNumber(velocity.z, 0) } };
    },
    tick(objects = [], delta = 1 / 60, groundHeight = () => 0) {
      return objects.map((object) => {
        if (object.state !== "falling") return object;
        const velocity = { ...object.velocity, y: toNumber(object.velocity?.y, 0) - gravity * delta };
        const position = {
          x: toNumber(object.position?.x, 0) + toNumber(velocity.x, 0) * delta,
          y: toNumber(object.position?.y, 0) + toNumber(velocity.y, 0) * delta,
          z: toNumber(object.position?.z, 0) + toNumber(velocity.z, 0) * delta
        };
        const ground = groundHeight(position.x, position.z) + toNumber(object.radius, 0.25);
        if (position.y <= ground) return { ...object, state: "landed", position: { ...position, y: ground }, velocity: { x: velocity.x * 0.35, y: 0, z: velocity.z * 0.35 }, landed: true };
        return { ...object, position, velocity, landed: false };
      });
    }
  };
}

export default createFallMotionKit;
