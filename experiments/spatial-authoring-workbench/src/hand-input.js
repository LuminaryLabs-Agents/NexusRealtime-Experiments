const PINCH_ON_METERS = 0.035;
const PINCH_OFF_METERS = 0.055;

export function createWebXRHandInput({ renderer, spatialRenderer, status }) {
  const state = { supported: false, hands: new Map(), lastCommands: [], lastScaleDistance: null };

  function jointPose(frame, referenceSpace, hand, jointName) {
    const joint = hand?.get?.(jointName);
    if (!joint) return null;
    const pose = frame.getJointPose?.(joint, referenceSpace);
    if (!pose) return null;
    return { x: pose.transform.position.x, y: pose.transform.position.y, z: pose.transform.position.z, radius: pose.radius ?? 0.01 };
  }

  function distance(a, b) {
    if (!a || !b) return Infinity;
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  function normalize(v) {
    const len = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }

  function buildRay(wrist, indexTip) {
    if (!indexTip) return null;
    const origin = { x: indexTip.x, y: indexTip.y, z: indexTip.z };
    const raw = wrist ? { x: indexTip.x - wrist.x, y: indexTip.y - wrist.y, z: indexTip.z - wrist.z } : { x: 0, y: 0, z: -1 };
    return { origin, direction: normalize(raw) };
  }

  function read(frame) {
    const referenceSpace = spatialRenderer.getReferenceSpace?.();
    if (!frame || !referenceSpace) return [];
    const session = renderer.xr.getSession();
    const commands = [];
    for (const inputSource of session?.inputSources ?? []) {
      if (!inputSource.hand) continue;
      state.supported = true;
      const hand = inputSource.handedness || "unknown";
      const indexTip = jointPose(frame, referenceSpace, inputSource.hand, "index-finger-tip");
      const thumbTip = jointPose(frame, referenceSpace, inputSource.hand, "thumb-tip");
      const wrist = jointPose(frame, referenceSpace, inputSource.hand, "wrist");
      const palm = jointPose(frame, referenceSpace, inputSource.hand, "palm") ?? wrist;
      const pinchDistance = distance(indexTip, thumbTip);
      const previous = state.hands.get(hand) ?? { pinching: false };
      const pinching = previous.pinching ? pinchDistance < PINCH_OFF_METERS : pinchDistance < PINCH_ON_METERS;
      const gesture = !previous.pinching && pinching ? "pinchStart" : previous.pinching && pinching ? "pinchMove" : previous.pinching && !pinching ? "pinchEnd" : "point";
      const ray = buildRay(wrist, indexTip);
      const hit = ray ? spatialRenderer.pick(ray) : null;
      const command = {
        type: `hand.${gesture}`,
        actorId: "user",
        hand,
        gesture,
        referenceSpace: "local-floor",
        confidence: indexTip && thumbTip ? 0.95 : 0.35,
        ray,
        pinch: { active: pinching, indexThumbDistance: Number.isFinite(pinchDistance) ? pinchDistance : null, strength: Math.max(0, Math.min(1, 1 - pinchDistance / PINCH_OFF_METERS)) },
        pose: { wrist, palm, indexTip, thumbTip },
        hit
      };
      state.hands.set(hand, { pinching, command });
      commands.push(command);
    }

    const left = state.hands.get("left")?.command;
    const right = state.hands.get("right")?.command;
    if (left?.pinch?.active && right?.pinch?.active && left.pose?.indexTip && right.pose?.indexTip) {
      const scaleDistance = distance(left.pose.indexTip, right.pose.indexTip);
      const previous = state.lastScaleDistance ?? scaleDistance;
      state.lastScaleDistance = scaleDistance;
      commands.push({ type: "hand.twoHandScale", actorId: "user", hand: "both", gesture: "twoHandScale", referenceSpace: "local-floor", confidence: 0.92, scalar: Math.max(0.2, Math.min(4, scaleDistance / Math.max(previous, 0.001))), left, right });
    } else {
      state.lastScaleDistance = null;
    }

    state.lastCommands = commands;
    spatialRenderer.drawHandRays(commands);
    if (status && !commands.length && state.supported) status.textContent = "Hand tracking active. Show both hands and pinch panels.";
    if (status && !state.supported) status.textContent = "Waiting for WebXR hand tracking. Use headset browser immersive mode with hands visible.";
    return commands;
  }

  return { read, getState: () => state };
}
