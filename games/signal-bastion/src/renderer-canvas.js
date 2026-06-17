export function createSignalBastionCanvasRenderer({ canvas, statusEl, errorPanel, errorText }) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const view = { scale: 1, offsetX: 0, offsetY: 0, width: 960, height: 540 };
  let hover = null;

  function resize() {
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(globalThis.innerWidth * dpr);
    canvas.height = Math.floor(globalThis.innerHeight * dpr);
    canvas.style.width = `${globalThis.innerWidth}px`;
    canvas.style.height = `${globalThis.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view.scale = Math.min(globalThis.innerWidth / view.width, globalThis.innerHeight / view.height);
    view.offsetX = (globalThis.innerWidth - view.width * view.scale) * 0.5;
    view.offsetY = (globalThis.innerHeight - view.height * view.scale) * 0.5;
  }

  function showFatal(error) {
    errorPanel.hidden = false;
    errorText.textContent = String(error?.stack ?? error?.message ?? error);
    console.error(error);
  }

  function screenToWorld(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - view.offsetX) / view.scale,
      y: (event.clientY - rect.top - view.offsetY) / view.scale
    };
  }

  function worldToScreen(point) {
    return {
      x: view.offsetX + Number(point?.x ?? 0) * view.scale,
      y: view.offsetY + Number(point?.y ?? 0) * view.scale
    };
  }

  function color(hex, alpha = 1) {
    if (!hex || !String(hex).startsWith("#")) return `rgba(255,255,255,${alpha})`;
    const value = hex.slice(1);
    const bigint = parseInt(value.length === 3 ? value.split("").map((c) => c + c).join("") : value, 16);
    return `rgba(${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255},${alpha})`;
  }

  function circle(point, radius, fill, stroke = null, lineWidth = 1, glow = 0) {
    const p = worldToScreen(point);
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * view.scale, 0, Math.PI * 2);
    ctx.shadowBlur = glow;
    ctx.shadowColor = stroke || fill;
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = lineWidth * view.scale;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();
  }

  function label(text, point, fill = "rgba(236,251,255,.9)", size = 12) {
    const p = worldToScreen(point);
    ctx.save();
    ctx.font = `${Math.max(10, size * view.scale)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = fill;
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = 7;
    ctx.fillText(text, p.x, p.y);
    ctx.restore();
  }

  function drawPolyline(points, width, stroke, glow = 0) {
    if (!points?.length) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width * view.scale;
    ctx.strokeStyle = stroke;
    ctx.shadowBlur = glow;
    ctx.shadowColor = stroke;
    ctx.beginPath();
    for (const [index, point] of points.entries()) {
      const p = worldToScreen(point);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function findHit(worldPoint, snapshot) {
    for (const structure of Object.values(snapshot?.structures?.structures ?? {})) {
      if (Math.hypot(worldPoint.x - structure.x, worldPoint.y - structure.y) <= 26) return { kind: "structure", id: structure.id };
    }
    for (const slot of Object.values(snapshot?.map?.slots ?? {})) {
      if (Math.hypot(worldPoint.x - slot.x, worldPoint.y - slot.y) <= (slot.radius ?? 26)) return { kind: "slot", id: slot.id };
    }
    return null;
  }

  function draw(snapshot, activeBlueprint = "bolt") {
    ctx.clearRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    const gradient = ctx.createLinearGradient(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    gradient.addColorStop(0, "#071017");
    gradient.addColorStop(0.55, "#0d1620");
    gradient.addColorStop(1, "#030609");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);

    const path = snapshot?.map?.path ?? [];
    drawPolyline(path, 32, "rgba(38,58,68,.9)");
    drawPolyline(path, 9, "rgba(118,231,255,.25)", 18);
    drawPolyline(path, 3, "rgba(255,227,109,.45)", 10);

    const session = snapshot?.session ?? {};
    const structures = Object.values(snapshot?.structures?.structures ?? {});
    const agents = Object.values(snapshot?.agents?.active ?? {});
    const occupied = new Set(structures.map((structure) => structure.slotId));

    for (const slot of Object.values(snapshot?.map?.slots ?? {})) {
      const isHover = hover?.kind === "slot" && hover.id === slot.id;
      const selected = session.selectedId === slot.id;
      circle(slot, slot.radius ?? 26, occupied.has(slot.id) ? "rgba(255,255,255,.04)" : "rgba(102,240,184,.08)", selected ? "rgba(255,227,109,.95)" : isHover ? "rgba(139,211,255,.95)" : occupied.has(slot.id) ? "rgba(255,255,255,.12)" : "rgba(102,240,184,.48)", 1.5, isHover || selected ? 18 : 3);
    }

    const vital = snapshot?.map?.vital;
    if (vital) {
      const hp = Math.max(0, vital.health / Math.max(1, vital.maxHealth));
      circle(vital, 34, "rgba(255,227,109,.10)", "rgba(255,227,109,.9)", 2, 24);
      circle(vital, 20 + 12 * hp, `rgba(255,227,109,${0.18 + hp * 0.28})`, null, 1, 16);
      label("CORE", { x: vital.x, y: vital.y - 52 }, "rgba(255,227,109,.9)", 12);
    }

    for (const structure of structures) {
      const selected = session.selectedId === structure.id;
      if (selected) circle(structure, structure.range, "rgba(139,211,255,.035)", "rgba(139,211,255,.22)", 1, 4);
      circle(structure, 20 + structure.level * 2, color(structure.color, 0.25), color(structure.color, selected ? 1 : 0.72), 2, selected ? 22 : 10);
      label(String(structure.level), structure, "rgba(4,8,12,.95)", 12);
    }

    for (const agent of agents) {
      const hp = Math.max(0, agent.health / Math.max(1, agent.maxHealth));
      circle(agent, agent.radius + (agent.boss ? 4 : 0), color(agent.color, agent.boss ? 0.42 : 0.34), color(agent.color, 0.9), 1.5, agent.boss ? 20 : 8);
      const p = worldToScreen({ x: agent.x, y: agent.y - agent.radius - 8 });
      ctx.fillStyle = "rgba(0,0,0,.58)";
      ctx.fillRect(p.x - 14 * view.scale, p.y, 28 * view.scale, 3 * view.scale);
      ctx.fillStyle = agent.boss ? "rgba(255,227,109,.92)" : "rgba(132,240,164,.9)";
      ctx.fillRect(p.x - 14 * view.scale, p.y, 28 * hp * view.scale, 3 * view.scale);
    }

    for (const projectile of Object.values(snapshot?.combat?.projectiles ?? {})) circle(projectile, 4.5, color(projectile.color, 0.9), null, 1, 10);
    for (const effect of snapshot?.combat?.effects ?? []) {
      const t = Math.max(0, 1 - (effect.age ?? 0) / Math.max(0.001, effect.life ?? 1));
      circle(effect, (effect.radius ?? (effect.type === "death" ? 24 : 14)) * (1 + (1 - t) * 0.8), color(effect.color, 0.05 * t), color(effect.color, 0.45 * t), 1, 18 * t);
    }

    const hud = snapshot?.render?.hud ?? {};
    const blueprint = snapshot?.level?.blueprints?.[activeBlueprint]?.label ?? activeBlueprint;
    statusEl.textContent = `Wave ${hud.wave ?? "1/5"} · Core ${hud.core ?? "--"} · ${hud.currency ?? 0}cr · ${blueprint}`;
    if (hud.message) label(hud.message, { x: 480, y: 502 }, "rgba(236,251,255,.82)", 12);
    if (session.status === "planning") label("SPACE: start wave", { x: 480, y: 38 }, "rgba(255,227,109,.82)", 13);
    if (session.status === "won") label("BASTION SECURE", { x: 480, y: 38 }, "rgba(102,240,184,.95)", 18);
    if (session.status === "lost") label("CORE BREACHED · R to restart", { x: 480, y: 38 }, "rgba(255,118,132,.95)", 18);
  }

  resize();
  return { resize, showFatal, screenToWorld, findHit, draw, setHover(hit) { hover = hit; } };
}
