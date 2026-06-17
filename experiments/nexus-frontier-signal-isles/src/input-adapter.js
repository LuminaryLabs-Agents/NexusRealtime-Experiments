export function createSignalIslesInputAdapter({ canvas, composition, renderer }) {
  const keys = new Set();
  const pressed = new Set();
  let lookX = 0;
  let lookY = 0;
  let hover = null;

  const normalizeKey = (event) => event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();

  function keydown(event) {
    const key = normalizeKey(event);
    if (!keys.has(key)) pressed.add(key);
    keys.add(key);
    composition.setKey(key, true, { source: "keyboard" });
    if ([" ", "w", "a", "s", "d", "e", "b", "f", "r"].includes(key)) event.preventDefault();
  }

  function keyup(event) {
    const key = normalizeKey(event);
    keys.delete(key);
    composition.setKey(key, false, { source: "keyboard" });
  }

  function mousemove(event) {
    if (document.pointerLockElement === canvas) {
      lookX += event.movementX || 0;
      lookY += event.movementY || 0;
    }
  }

  function pointermove(event) {
    hover = renderer.pick(event);
  }

  function pointerdown(event) {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
    hover = renderer.pick(event);
    pressed.add("pointer0");
    keys.add("pointer0");
    composition.setKey("pointer0", true, { source: "pointer" });
  }

  function pointerup() {
    keys.delete("pointer0");
    composition.setKey("pointer0", false, { source: "pointer" });
  }

  function blur() {
    keys.clear();
    pressed.clear();
    lookX = 0;
    lookY = 0;
    composition.clearInput({ source: "window.blur" });
  }

  function edge(key) {
    return pressed.has(key);
  }

  function flush(delta) {
    const moveX = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
    const moveZ = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
    const intent = {
      moveX,
      moveZ,
      lookX,
      lookY,
      sprint: keys.has("shift"),
      scan: keys.has("f") || keys.has("pointer0"),
      interact: edge("e"),
      build: edge("b"),
      restart: edge("r"),
      debugAdvance: edge("n"),
      hoverId: hover?.id ?? null
    };
    composition.flushInput(intent, delta);
    lookX = 0;
    lookY = 0;
    pressed.clear();
    return intent;
  }

  window.addEventListener("keydown", keydown, { passive: false });
  window.addEventListener("keyup", keyup);
  window.addEventListener("mousemove", mousemove);
  window.addEventListener("blur", blur);
  canvas.addEventListener("pointermove", pointermove);
  canvas.addEventListener("pointerdown", pointerdown);
  window.addEventListener("pointerup", pointerup);

  return {
    flush,
    getState() {
      return { keys: [...keys], hover, pointerLocked: document.pointerLockElement === canvas };
    },
    dispose() {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("blur", blur);
      canvas.removeEventListener("pointermove", pointermove);
      canvas.removeEventListener("pointerdown", pointerdown);
      window.removeEventListener("pointerup", pointerup);
    }
  };
}

export default createSignalIslesInputAdapter;
