import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {
  createInputIntentKit,
  createCameraRelativeMovementKit,
  createQuaternionFacingKit,
  createAimRayKit,
  createControlDebugOverlayKit,
  createSoftTargetFollowCameraKit
} from "../_kits/riftbound/riftbound-shared-kits.js";

const canvas = document.querySelector("#game");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090b10);
scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x111822, 1.2));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(8, 14, 10);
scene.add(key);

const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 180);
camera.position.set(0, 6, 10);

const grid = new THREE.GridHelper(48, 48, 0x4f6f96, 0x1d2938);
scene.add(grid);

const player = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.3, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffd66e, emissive: 0x332100, emissiveIntensity: 0.2 }));
player.position.set(0, 1, 5);
scene.add(player);

const dummy = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 16), new THREE.MeshStandardMaterial({ color: 0xff4ecb, emissive: 0x330022, emissiveIntensity: 0.25 }));
dummy.position.set(0, 0.65, -6);
scene.add(dummy);

const input = createInputIntentKit().install({ target: window, element: canvas });
const movement = createCameraRelativeMovementKit({ speed: 5.2 }).install({ THREE, camera });
const facing = createQuaternionFacingKit({ turnSpeed: 14 }).install({ THREE });
const aimRay = createAimRayKit().install({ THREE, camera, groundY: 0, targets: [dummy] });
const cameraRig = createSoftTargetFollowCameraKit({ targetFocusStrength: 0.35, aimFocusStrength: 0.25 }).install({ THREE, camera });
const debug = createControlDebugOverlayKit({ visible: true }).install({ THREE, scene });

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const intent = input.update();
  if (intent.debugPressed) debug.toggle();
  const move = movement.applyToObject({ object: player, input: intent, dt, speed: intent.sprint ? 7 : 5 });
  if (intent.dashPressed && move.hasInput) player.position.addScaledVector(move.direction, 2);
  player.position.y = 1;

  const aim = aimRay.compute({ pointer: intent.pointer, origin: player.position.clone(), targetObjects: [dummy] });
  facing.faceDirection(player, intent.castPressed ? aim.aimDirection : move.direction, { dt });
  cameraRig.update({
    player,
    aimPoint: aim.aimPoint,
    softTarget: dummy,
    movementDirection: move.hasInput ? move.direction : dummy.position.clone().sub(player.position).setY(0).normalize(),
    isDashing: intent.dashPressed,
    dt
  });
  const cameraForward = new THREE.Vector3();
  camera.getWorldDirection(cameraForward);
  const targetDirection = dummy.position.clone().sub(player.position);
  targetDirection.y = 0;
  if (targetDirection.lengthSq() > 0) targetDirection.normalize();
  debug.update({
    playerPosition: player.position,
    cameraForward,
    movementDirection: move.direction,
    aimDirection: aim.aimDirection,
    targetDirection,
    aimPoint: aim.aimPoint
  });
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

globalThis.ControlLab = { input, movement, facing, aimRay, cameraRig };
