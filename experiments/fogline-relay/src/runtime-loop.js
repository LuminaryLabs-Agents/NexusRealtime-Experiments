export function startLoop(session, input, renderer, hud) {
  const engine = session.engine;
  let last = performance.now();
  let running = true;

  function frame(now) {
    if (!running) return;
    const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
    last = now;

    input.flush(engine);
    session.prepareFrame();
    engine.tick(dt);
    const snapshot = session.snapshot();
    renderer.draw(snapshot);
    hud.draw(snapshot);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return {
    stop() { running = false; },
    start() {
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
    },
    tick(dt = 1 / 60) {
      input.flush(engine);
      session.prepareFrame();
      engine.tick(dt);
      const snapshot = session.snapshot();
      renderer.draw(snapshot);
      hud.draw(snapshot);
      return snapshot;
    }
  };
}
