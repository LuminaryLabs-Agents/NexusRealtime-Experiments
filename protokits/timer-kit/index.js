export const TIMER_KIT_VERSION = "0.1.0";

const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createTimerKit(config = {}) {
  const timers = new Map((config.timers ?? []).map((timer) => [timer.id, { ...timer, elapsed: 0, fired: false }]));
  return {
    id: "timer-kit",
    version: TIMER_KIT_VERSION,
    domain: "timer",
    provides: ["timer:events", "timer:schedule", "timer:loop"],
    schedule(id, delay, payload = {}) {
      timers.set(String(id), { id: String(id), delay: Math.max(0, toNumber(delay, 1)), elapsed: 0, fired: false, payload });
    },
    tick(delta = 1 / 60) {
      const events = [];
      for (const timer of timers.values()) {
        if (timer.fired) continue;
        timer.elapsed += Math.max(0, toNumber(delta, 0));
        if (timer.elapsed >= timer.delay) {
          timer.fired = true;
          events.push({ type: "timer.fired", id: timer.id, payload: timer.payload });
        }
      }
      return events;
    },
    getTimers() {
      return [...timers.values()].map((timer) => ({ ...timer }));
    }
  };
}

export default createTimerKit;
