import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {
  createInputIntentKit,
  createCameraRelativeMovementKit,
  createQuaternionFacingKit,
  createAimRayKit,
  createControlDebugOverlayKit,
  createSoftTargetFollowCameraKit,
  createGameStateKit,
  createRedMountainBackdropKit,
  createRiftArenaKit,
  createMagicProjectileKit,
  createDuelBotKit,
  createCombatHudKit
} from "../_kits/riftbound/riftbound-shared-kits.js";

const canvas = document.querySelector("#game");
const reticle = document.querySelector("#reticle");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x09030f);
scene.fog = new THREE.FogExp2(0x2b0b18, 0.019);

const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 220);
camera.position.set(0, 7, 12);

scene.add(new THREE.HemisphereLight(0xffd7ad, 0x160515, 1.05));
const key = new THREE.DirectionalLight(0xfff2dd, 2.1);
key.position.set(-12, 18, 12);
scene.add(key);

const state = {
  playerHp: 120,
  playerMaxHp: 120,
  botHp: 120,
  botMaxHp: 120,
  mana: 100,
  maxMana: 100,
  debug: false,
  castCooldown: 0,
  parryWindow: 0,
  guard: false,
  dashTime: 0,
  message: ""
};

function makeMage({ color, emissive, entityId, isBot = false }) {
  const group = new THREE.Group();
  group.userData.entityId = entityId;
  group.userData.hitRadius = 0.85;
  group.userData.isBot = isBot;
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.22, roughness: 0.48, metalness: 0.04 });
  const ghostMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.25, 8, 16), bodyMaterial);
  body.position.y = 0.9;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 12), bodyMaterial);
  head.position.y = 1.76;
  const aura = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 12), ghostMaterial);
  aura.position.y = 0.95;
  group.add(aura, body, head);
  return group;
}

const player = makeMage({ color: 0xffd66e, emissive: 0x5b2b00, entityId: "player" });
player.position.set(0, 0, 8);
scene.add(player);

const bot = makeMage({ color: 0xff4ecb, emissive: 0x4b0032, entityId: "bot", isBot: true });
bot.position.set(0, 0, -9);
scene.add(bot);

const gameState = createGameStateKit({ initialPhase: "playing" }).install();
const input = createInputIntentKit().install({ target: window, element: canvas });
const movement = createCameraRelativeMovementKit({ speed: 5.2, sprintScale: 1.3 }).install({ THREE, camera });
const facing = createQuaternionFacingKit({ turnSpeed: 16 }).install({ THREE });
const aimRay = createAimRayKit({ maxRange: 82 }).install({ THREE, camera, groundY: 0, targets: [bot] });
const cameraRig = createSoftTargetFollowCameraKit({
  distance: 9.2,
  height: 5.3,
  shoulderOffset: 1.15,
  targetFocusStrength: 0.36,
  aimFocusStrength: 0.28
}).install({ THREE, camera });
const debugOverlay = createControlDebugOverlayKit().install({ THREE, scene });
const mountains = createRedMountainBackdropKit({ radius: 88, layers: 5, height: 25 }).install({ THREE, scene });
const arena = createRiftArenaKit({ radius: 29 }).install({ THREE, scene });
const hud = createCombatHudKit().install({ root: document.body });

const projectiles = createMagicProjectileKit({
  speed: 20,
  radius: 0.28,
  life: 2.4,
  damage: 12
}).install({
  THREE,
  scene,
  onHit({ projectile, target }) {
    if (target.userData.entityId === "bot") {
      state.botHp = Math.max(0, state.botHp - projectile.damage);
      bot.scale.setScalar(1.08);
      state.message = "Hit. Keep weaving.";
      if (state.botHp <= 0) {
        bot.userData.dead = true;
        gameState.transition("victory");
        state.message = "Victory. Press R to restart.";
      }
    } else if (target.userData.entityId === "player") {
      const guarded = state.guard;
      const parried = state.parryWindow > 0;
      if (parried) {
        state.mana = Math.min(state.maxMana, state.mana + 18);
        state.message = "Parry. Mana restored.";
        return;
      }
      state.playerHp = Math.max(0, state.playerHp - projectile.damage * (guarded ? 0.35 : 1));
      state.message = guarded ? "Guard absorbed the bolt." : "You were hit.";
      if (state.playerHp <= 0) {
        gameState.transition("defeat");
        state.message = "Defeat. Press R to restart.";
      }
    }
  }
});

const botBrain = createDuelBotKit({
  preferredRange: 9,
  retreatRange: 3.5,
  castCooldown: 1.1,
  speed: 3.0
}).install({
  THREE,
  bot,
  target: player,
  spawnProjectile: projectiles.spawn
});

function restart() {
  state.playerHp = state.playerMaxHp;
  state.botHp = state.botMaxHp;
  state.mana = state.maxMana;
  state.castCooldown = 0;
  state.parryWindow = 0;
  state.guard = false;
  state.dashTime = 0;
  state.message = "";
  player.position.set(0, 0, 8);
  bot.position.set(0, 0, -9);
  bot.scale.setScalar(1);
  player.scale.setScalar(1);
  bot.userData.dead = false;
  gameState.transition("playing");
}

function resize() {
  const width = innerWidth;
  const height = innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

function applyPlayerInput(intent, dt, aim) {
  state.guard = Boolean(intent.guard);
  state.castCooldown = Math.max(0, state.castCooldown - dt);
  state.parryWindow = Math.max(0, state.parryWindow - dt);
  state.dashTime = Math.max(0, state.dashTime - dt);

  if (intent.parryPressed) {
    state.parryWindow = 0.28;
    state.message = "Parry window opened.";
  }

  const move = movement.applyToObject({
    object: player,
    input: intent,
    dt,
    speed: state.guard ? 3.2 : 5.4,
    sprintScale: 1.22
  });

  if (intent.dashPressed && move.hasInput) {
    state.dashTime = 0.16;
    player.position.addScaledVector(move.direction, 2.2);
  }

  arena.collideSphere(player.position, 0.45);

  const faceDir = intent.castPressed || intent.guard ? aim.aimDirection : move.direction;
  facing.faceDirection(player, faceDir, { dt, mode: intent.castPressed ? "instant" : "smooth" });

  if (intent.castPressed && state.castCooldown <= 0 && state.mana >= 8 && gameState.is("playing")) {
    state.castCooldown = 0.22;
    state.mana -= 8;
    projectiles.spawn({
      ownerId: "player",
      from: player.position.clone().add(new THREE.Vector3(0, 1.05, 0)),
      direction: aim.aimDirection.clone(),
      color: 0xffd66e,
      damage: 12,
      hostile: false
    });
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const phaseTick = gameState.tick(dt);
  const intent = input.update();
  if (intent.debugPressed) {
    state.debug = debugOverlay.toggle();
  }
  if (intent.restartPressed) restart();

  state.mana = Math.min(state.maxMana, state.mana + dt * 8);

  const aim = aimRay.compute({
    pointer: intent.pointer,
    origin: player.position.clone().add(new THREE.Vector3(0, 1.05, 0)),
    targetObjects: [bot]
  });

  if (gameState.is("playing")) {
    applyPlayerInput(intent, dt, aim);
    botBrain.update(dt);
    arena.collideSphere(bot.position, 0.45);
    projectiles.update(dt, [player, bot]);
  }

  bot.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
  player.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
  mountains.update(dt);
  arena.update(dt);

  const botDirection = bot.position.clone().sub(player.position);
  if (botDirection.lengthSq() > 1e-6) botDirection.normalize();
  const cameraForward = new THREE.Vector3();
  camera.getWorldDirection(cameraForward);
  const moveForCamera = movement.compute(intent);
  cameraRig.update({
    player,
    aimPoint: aim.aimPoint,
    softTarget: bot.userData.dead ? null : bot,
    movementDirection: moveForCamera.hasInput ? moveForCamera.direction : botDirection,
    isDashing: state.dashTime > 0,
    dt
  });

  const rect = canvas.getBoundingClientRect();
  reticle.style.left = `${((intent.pointer.x + 1) * 0.5 * rect.width) + rect.left}px`;
  reticle.style.top = `${((-intent.pointer.y + 1) * 0.5 * rect.height) + rect.top}px`;

  debugOverlay.update({
    playerPosition: player.position,
    cameraForward,
    movementDirection: moveForCamera.direction,
    aimDirection: aim.aimDirection,
    targetDirection: botDirection,
    aimPoint: aim.aimPoint
  });

  hud.update({
    playerHp: state.playerHp,
    playerMaxHp: state.playerMaxHp,
    mana: state.mana,
    maxMana: state.maxMana,
    botHp: state.botHp,
    botMaxHp: state.botMaxHp,
    phase: phaseTick.phase,
    message: state.message
  });

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

globalThis.GameHost = {
  title: "Riftbound Duel",
  mode: "single-player-bot",
  getState: () => ({ ...state, game: gameState.getState(), bot: botBrain.getState(), projectiles: projectiles.getState() }),
  restart
};

requestAnimationFrame(frame);
