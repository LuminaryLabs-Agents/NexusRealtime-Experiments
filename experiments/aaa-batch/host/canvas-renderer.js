export function createAaaBatchRenderer({ canvas, game, host }) {
  const ctx = canvas.getContext("2d");

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const state = host.getState();
    const [bg, primary, accent, deep] = game.palette;
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, bg);
    gradient.addColorStop(0.55, deep);
    gradient.addColorStop(1, "#030407");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.scale(width / 900, height / 560);
    ctx.strokeStyle = `${primary}55`;
    ctx.lineWidth = 1;
    for (let x = -120; x < 960; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x + 160, 540);
      ctx.stroke();
    }

    for (const node of state.nodes) {
      ctx.beginPath();
      ctx.fillStyle = node.secured ? accent : primary;
      ctx.strokeStyle = node.secured ? "#ffffff" : accent;
      ctx.lineWidth = node.secured ? 5 : 2;
      ctx.arc(node.x, node.y, 20 + node.charge * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.arc(state.player.x, state.player.y, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  window.addEventListener("resize", resize);
  resize();
  return { draw, resize };
}
