function makeNoiseBuffer(ctx, seconds = 3) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.sin(i * 12.9898) * 0.35 + (Math.random() * 2 - 1) * 0.65;
  return buffer;
}

export function createAudioEngine(audio) {
  let ctx, master, music, ambience, animals, windSource, windFilter, windGain, started = 0, timer = 0, enabled = false, chord = -1;
  const sectionAt = (elapsed) => audio.sections.find((s) => elapsed % audio.durationSeconds >= s.start && elapsed % audio.durationSeconds < s.end) ?? audio.sections[0];
  function tone(freq, duration, level, output, type = "sine", attack = 0.05) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(output);
    osc.start(now);
    osc.stop(now + duration + 0.25);
  }
  function chirp(level) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200 + Math.random() * 1600, now);
    osc.frequency.exponentialRampToValueAtTime(1900 + Math.random() * 2400, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(ambience);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  function tick() {
    if (!enabled) return;
    const elapsed = ctx.currentTime - started;
    const section = sectionAt(elapsed);
    const now = ctx.currentTime;
    music.gain.setTargetAtTime(audio.mixer.music * (0.2 + section.pad), now, 3.0);
    ambience.gain.setTargetAtTime(audio.mixer.ambience, now, 3.0);
    animals.gain.setTargetAtTime(audio.mixer.animal, now, 3.0);
    windGain.gain.setTargetAtTime(0.025 + section.wind * 0.16, now, 3.0);
    windFilter.frequency.setTargetAtTime(360 + section.wind * 920, now, 4.0);
    const nextChord = Math.floor(elapsed / 28) % 5;
    if (nextChord !== chord) {
      chord = nextChord;
      for (const offset of [0, 2, 4]) tone(audio.scale.frequencies[(chord + offset) % audio.scale.frequencies.length] * 0.5, 24, 0.008 + section.pad * 0.018, music, "triangle", 5.5);
    }
    if (Math.random() < section.pluck * 0.18) tone(audio.scale.frequencies[Math.floor(Math.random() * audio.scale.frequencies.length)], 2.2, 0.012 + section.pluck * 0.025, music, "triangle", 0.035);
    if (Math.random() < section.birds * 0.18) chirp(0.006 + section.birds * 0.008);
    if (Math.random() < section.crickets * 0.22) for (let i = 0; i < 4; i += 1) setTimeout(() => tone(5200 + Math.random() * 900, 0.045, 0.0025 + section.crickets * 0.003, ambience, "square", 0.005), i * 52);
    if (Math.random() < 0.026) tone(140 + Math.random() * 55, 0.55, 0.008, animals, "sawtooth", 0.08);
  }
  async function start() {
    if (enabled) return;
    ctx = ctx ?? new AudioContext();
    await ctx.resume();
    master = master ?? ctx.createGain();
    music = music ?? ctx.createGain();
    ambience = ambience ?? ctx.createGain();
    animals = animals ?? ctx.createGain();
    master.gain.value = audio.mixer.master;
    if (!windSource) {
      windSource = ctx.createBufferSource();
      windSource.buffer = makeNoiseBuffer(ctx, 4);
      windSource.loop = true;
      windFilter = ctx.createBiquadFilter();
      windFilter.type = "lowpass";
      windGain = ctx.createGain();
      windSource.connect(windFilter).connect(windGain).connect(ambience);
      windSource.start();
    }
    music.connect(master);
    ambience.connect(master);
    animals.connect(master);
    master.connect(ctx.destination);
    started = ctx.currentTime;
    enabled = true;
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    tick();
  }
  return { start, getState: () => ({ enabled, section: ctx && enabled ? sectionAt(ctx.currentTime - started).id : "silent" }) };
}
