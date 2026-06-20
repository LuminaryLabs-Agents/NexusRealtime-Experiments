const errorPanel = document.querySelector("#errorPanel");

function showFatal(error) {
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack ?? error?.message ?? error);
  console.error(error);
}

async function boot() {
  const [sessionModule, rendererModule, inputModule, hudModule, loopModule, synthModule] = await Promise.all([
    import("./session-visual-upgrade.js"),
    import("./renderer-three-fidelity.js"),
    import("./input.js"),
    import("./hud.js"),
    import("./runtime-loop.js"),
    import("./synth.js")
  ]);

  const canvas = document.querySelector("#game");
  const session = sessionModule.createNextLedgeSession();
  const renderer = rendererModule.createThreeRenderer({ canvas });
  const input = inputModule.createInputController({ canvas, leftPad: document.querySelector("#leftPad"), rightPad: document.querySelector("#rightPad") });
  const hud = hudModule.createHud({ status: document.querySelector("#status"), readout: document.querySelector("#readout") });
  const synth = synthModule.createCinematicSynth();

  loopModule.startLoop({ session, input, renderer, hud, synth });
}

boot().catch(showFatal);
