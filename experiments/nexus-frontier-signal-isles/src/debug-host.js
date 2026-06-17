export function createSignalIslesDebugHost({ composition, renderer, input }) {
  return {
    engine: composition.engine,
    renderer,
    input,
    tick(dt = 1 / 60) {
      return composition.tick(dt);
    },
    start() {
      return composition.start();
    },
    stop() {
      return composition.stop();
    },
    reset() {
      return composition.reset();
    },
    getState() {
      return composition.getState();
    },
    getKitStates() {
      return composition.getKitStates();
    },
    getRecentEvents() {
      return composition.getRecentEvents();
    },
    getSequenceState() {
      return composition.getSequenceState();
    },
    getObjectiveState() {
      return composition.getObjectiveState();
    },
    getInputState() {
      return composition.getInputState();
    },
    getLastRejection() {
      return composition.getLastRejection();
    },
    getReplaySnapshot() {
      return composition.getReplaySnapshot();
    },
    getRenderSnapshot() {
      return composition.getRenderSnapshot();
    }
  };
}

export default createSignalIslesDebugHost;
