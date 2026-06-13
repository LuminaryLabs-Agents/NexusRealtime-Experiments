export function createCinematicSynth() {
  let ctx = null;
  const seen = new Set();

  function init() {
    if (ctx) return ctx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
    return ctx;
  }

  function tone(freq, duration, type = "sine", gainValue = 0.12, endFreq = null) {
    const audio = init();
    if (!audio) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration);
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  function playEvent(type) {
    if (type === "grapple-fired") tone(900, 0.2, "sawtooth", 0.18, 150);
    else if (type === "grapple-latched") { tone(1200, 0.25, "sine", 0.18, 250); tone(80, 0.3, "triangle", 0.18); }
    else if (type === "released" || type === "wall-bounce") tone(110, 0.15, "triangle", 0.16, 45);
    else if (type === "restored") tone(440, 0.5, "sine", 0.08, 880);
    else if (type === "failed") tone(150, 1.0, "sawtooth", 0.22, 30);
    else if (type === "summit-reached") [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => setTimeout(() => tone(f, 0.38, "sine", 0.09), i * 80));
  }

  return {
    update(snapshot, command = {}) {
      if (command.userGesture) init()?.resume?.();
      for (const event of snapshot?.recentEvents ?? []) {
        const key = `${event.at}:${event.type}:${event.targetId ?? event.reason ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        playEvent(event.type);
      }
      if (seen.size > 80) {
        const keep = [...seen].slice(-40);
        seen.clear();
        keep.forEach((key) => seen.add(key));
      }
    }
  };
}
