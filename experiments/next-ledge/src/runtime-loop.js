export function startLoop({ session, input, renderer, hud, synth }) {
  let last = performance.now();
  let running = true;
  let lastSnapshot = session.snapshot();

  function tick(dt, command = {}) {
    lastSnapshot = session.update(dt, command);
    renderer.draw(lastSnapshot);
    hud.draw(lastSnapshot);
    synth?.update?.(lastSnapshot, command);
    return lastSnapshot;
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
    last = now;
    const command = input.read(renderer, lastSnapshot);
    tick(dt, command);
    requestAnimationFrame(frame);
  }

  window.GameHost = {
    engine: session.engine,
    session,
    renderer,
    getState: () => session.snapshot(),
    tick: (dt = 1 / 60, command = {}) => tick(dt, command),
    restart: () => session.restart(),
    advanceSector: () => session.advanceSector(),
    stop() { running = false; },
    start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  };

  tick(0, {});
  requestAnimationFrame(frame);
}
