export function createInputAdapter({ canvas }) {
  const keys = new Set();
  let turn = 0;
  let pitch = 0;
  let restartQueued = false;

  function keyName(event) {
    return event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }

  window.addEventListener("keydown", (event) => {
    const key = keyName(event);
    keys.add(key);
    if (key === "r") restartQueued = true;
    if (["w", "a", "s", "d", "e", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) event.preventDefault();
  });
  window.addEventListener("keyup", (event) => keys.delete(keyName(event)));
  window.addEventListener("blur", () => keys.clear());
  window.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement !== canvas) return;
    turn -= event.movementX * 0.0026;
    pitch -= event.movementY * 0.0021;
  });
  canvas.addEventListener("click", () => {
    if (canvas.requestPointerLock && document.pointerLockElement !== canvas) canvas.requestPointerLock();
  });

  return {
    flush(engine) {
      const keyboardTurn = (keys.has("ArrowLeft") ? 1 : 0) - (keys.has("ArrowRight") ? 1 : 0);
      const keyboardPitch = (keys.has("ArrowUp") ? 1 : 0) - (keys.has("ArrowDown") ? 1 : 0);
      const payload = {
        moveX: (keys.has("a") ? 1 : 0) - (keys.has("d") ? 1 : 0),
        moveZ: (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0),
        turn: turn + keyboardTurn * 0.045,
        pitch: pitch + keyboardPitch * 0.038,
        scan: keys.has("e"),
        restart: restartQueued
      };
      turn = 0;
      pitch = 0;
      restartQueued = false;
      engine.foglineRelay.input(payload);
      return payload;
    },
    getState() {
      return { keys: Array.from(keys), pointerLocked: document.pointerLockElement === canvas };
    }
  };
}
