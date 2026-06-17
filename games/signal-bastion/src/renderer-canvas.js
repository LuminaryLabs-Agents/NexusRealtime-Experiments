export function createSignalBastionCanvasRenderer({ canvas, statStripEl, towerPanelEl, contextPanelEl, errorPanel, errorText }) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const view = { scale: 1, offsetX: 0, offsetY: 0, width: 960, height: 540, yCompression: 0.78 };
  let hover = null;

  function resize() {
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(globalThis.innerWidth * dpr);
    canvas.height = Math.floor(globalThis.innerHeight * dpr);
    canvas.style.width = `${globalThis.innerWidth}px`;
    canvas.style.height = `${globalThis.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view.scale = Math.min(globalThis.innerWidth / view.width, globalThis.innerHeight / (view.height * view.yCompression));
    view.offsetX = (globalThis.innerWidth - view.width * view.scale) * 0.5;
    view.offsetY = (globalThis.innerHeight - view.height * view.yCompression * view.scale) * 0.5 + 24;
  }

  function showFatal(error) {
    errorPanel.hidden = false;
    errorText.textContent = String(error?.stack ?? error?.message ?? error);
    console.error(error);
  }

  function worldToScreen(point = {}) {
    return {
      x: view.offsetX + Number(point.x ?? 0) * view.scale,
      y: view.offsetY + Number(point.y ?? 0) * view.yCompression * view.scale - Number(point.z ?? 0) * view.scale * 0.72
    };
  }

  function screenToWorld(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - view.offsetX) / view.scale,
      y: (event.clientY - rect.top - view.offsetY) / (view.scale * view.yCompression)
    };
  }

  function color(hex, alpha = 1) {
    if (!hex || !String(hex).startsWith("#")) return `rgba(255,255,255,${alpha})`;
    const value = hex.slice(1);
    const bigint = parseInt(value.length === 3 ? value.split("").map((c) => c + c).join("") : value, 16);
    return `rgba(${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255},${alpha})`;
  }

  function ellipse(point, rx, ry, fill, stroke = null, lineWidth = 1, glow = 0) {
    const p = worldToScreen(point);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rx * view.scale, ry * view.scale, 0, 0, Math.PI * 2);
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

  function polygon(points, fill, stroke = null, lineWidth = 1) {
    if (!points.length) return;
    ctx.save();
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
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

  function drawBackdrop() {
    const g = ctx.createLinearGradient(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    g.addColorStop(0, "#07121b");
    g.addColorStop(0.5, "#102332");
    g.addColorStop(1, "#030609");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, globalThis.innerWidth, globalThis.innerHeight);
    ctx.save();
    ctx.globalAlpha = 0.24;
    for (let i = 0; i < 7; i += 1) {
      const y = globalThis.innerHeight * (0.18 + i * 0.1);
      ctx.fillStyle = i % 2 ? "#0d2638" : "#102b3f";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(globalThis.innerWidth, y - 42 + i * 4);
      ctx.lineTo(globalThis.innerWidth, y + 34);
      ctx.lineTo(0, y + 58);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(presentation) {
    const raw = presentation.rawSnapshot ?? presentation;
    const ground = presentation.ground ?? [];
    const pathDescriptor = ground.find((item) => item.kind === "ground-path") ?? { points: raw?.map?.path ?? [], width: 38, fill: "rgba(35,56,68,.88)", edge: "rgba(255,227,109,.30)" };
    drawPolyline(pathDescriptor.points, pathDescriptor.width + 16, "rgba(4,8,12,.62)");
    drawPolyline(pathDescriptor.points, pathDescriptor.width, pathDescriptor.fill);
    drawPolyline(pathDescriptor.points, 7, "rgba(120,226,255,.26)", 12);
    drawPolyline(pathDescriptor.points, 2, pathDescriptor.edge, 6);

    const placement = presentation.placement;
    for (const affordance of ground.filter((item) => item.kind === "build-affordance")) {
      if (!placement?.active && affordance.hiddenUntilPlacement) continue;
      ellipse(affordance, affordance.radius, affordance.radius * 0.55, affordance.status === "occupied" ? "rgba(255,255,255,.035)" : "rgba(107,240,184,.08)", affordance.status === "occupied" ? "rgba(255,255,255,.12)" : "rgba(107,240,184,.36)", 1.2, 8);
    }
  }

  function drawRangeRings(presentation) {
    for (const ring of presentation.rangeRings ?? []) {
      ellipse(ring, ring.radius, ring.radius * 0.55, "rgba(139,211,255,.025)", color(ring.color ?? "#8bd3ff", ring.opacity ?? 0.24), 1.4, 8);
    }
  }

  function drawPlacement(presentation) {
    const placement = presentation.placement;
    if (!placement?.active || !placement.worldPoint) return;
    const p = placement.worldPoint;
    ellipse(p, 28, 16, placement.valid ? "rgba(107,240,184,.18)" : "rgba(255,122,92,.16)", placement.valid ? "rgba(107,240,184,.88)" : "rgba(255,122,92,.88)", 2, 18);
    const top = worldToScreen({ ...p, z: 46 });
    const base = worldToScreen(p);
    const c = placement.valid ? "#6bf0b8" : "#ff7a5c";
    polygon([
      { x: base.x - 15 * view.scale, y: base.y },
      { x: base.x + 15 * view.scale, y: base.y },
      { x: top.x + 9 * view.scale, y: top.y },
      { x: top.x - 9 * view.scale, y: top.y }
    ], color(c, 0.42), color(c, 0.92), 2);
  }

  function drawTower(unit, presentation) {
    const identity = presentation.towerIdentities?.[unit.towerType] ?? {};
    const p = worldToScreen(unit);
    const base = worldToScreen({ x: unit.x, y: unit.y, z: 0 });
    const c = unit.color ?? identity.color ?? "#8bd3ff";
    ellipse({ x: unit.x, y: unit.y, z: 0 }, 25, 13, "rgba(0,0,0,.34)");
    ellipse({ x: unit.x, y: unit.y, z: 2 }, 22, 12, color(c, 0.34), "#071017", 2);
    const height = (34 + Number(unit.level ?? 1) * 8) * view.scale;
    const width = 14 * view.scale;
    if (identity.silhouette?.includes("spire") || identity.silhouette?.includes("needle") || identity.silhouette?.includes("lance")) {
      polygon([{ x: p.x, y: p.y - height }, { x: p.x + width, y: base.y - 6 * view.scale }, { x: p.x, y: base.y + 5 * view.scale }, { x: p.x - width, y: base.y - 6 * view.scale }], color(c, 0.92), "#071017", 2.4);
      polygon([{ x: p.x, y: p.y - height + 8 * view.scale }, { x: p.x + width * 0.5, y: base.y - 8 * view.scale }, { x: p.x, y: base.y }, { x: p.x - width * 0.5, y: base.y - 8 * view.scale }], color("#ffffff", 0.18));
    } else if (identity.silhouette?.includes("drum") || identity.silhouette?.includes("bell") || identity.silhouette?.includes("mortar")) {
      ellipse({ x: unit.x, y: unit.y, z: 36 }, 18, 10, color(c, 0.95), "#071017", 2.4);
      polygon([{ x: p.x - 16 * view.scale, y: p.y - 36 * view.scale }, { x: p.x + 16 * view.scale, y: p.y - 36 * view.scale }, { x: base.x + 12 * view.scale, y: base.y - 6 * view.scale }, { x: base.x - 12 * view.scale, y: base.y - 6 * view.scale }], color(c, 0.75), "#071017", 2.2);
    } else {
      polygon([{ x: p.x - width, y: base.y - 4 * view.scale }, { x: p.x + width, y: base.y - 4 * view.scale }, { x: p.x + width * 0.7, y: p.y - height }, { x: p.x - width * 0.7, y: p.y - height }], color(c, 0.86), "#071017", 2.3);
      ellipse({ x: unit.x, y: unit.y, z: 44 }, 13, 7, color(c, 1), "#071017", 2);
    }
  }

  function drawEnemy(unit) {
    const c = unit.color ?? (unit.boss ? "#ffe36d" : "#ff7f7a");
    const radius = (unit.boss ? 17 : 10) * (unit.scale ?? 1);
    ellipse({ x: unit.x, y: unit.y, z: 0 }, radius + 5, (radius + 5) * 0.42, "rgba(0,0,0,.30)");
    ellipse(unit, radius, radius * 0.72, color(c, unit.boss ? 0.92 : 0.82), unit.boss ? "#241018" : "#17090b", unit.boss ? 3 : 2, unit.boss ? 14 : 5);
    const hp = Math.max(0, Number(unit.health ?? 0) / Math.max(1, Number(unit.maxHealth ?? 1)));
    if (hp < 0.98 || unit.boss) {
      const p = worldToScreen({ x: unit.x, y: unit.y, z: unit.boss ? 34 : 22 });
      ctx.fillStyle = "rgba(0,0,0,.54)";
      ctx.fillRect(p.x - 18 * view.scale, p.y, 36 * view.scale, 4 * view.scale);
      ctx.fillStyle = unit.boss ? "rgba(255,227,109,.96)" : "rgba(107,240,184,.92)";
      ctx.fillRect(p.x - 18 * view.scale, p.y, 36 * hp * view.scale, 4 * view.scale);
    }
  }

  function drawUnits(presentation) {
    const units = [...(presentation.units ?? [])].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
    for (const unit of units) {
      if (unit.entityType === "tower") drawTower(unit, presentation);
      else drawEnemy(unit, presentation);
    }
  }

  function drawVfx(presentation) {
    for (const vfx of presentation.vfx ?? []) {
      const p = worldToScreen(vfx);
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = color(vfx.color ?? "#ffffff", vfx.type === "projectile-trail" ? 0.36 : 0.24);
      ctx.strokeStyle = color(vfx.color ?? "#ffffff", 0.82);
      ctx.lineWidth = 1.5 * view.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (vfx.radius ?? 12) * view.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function renderStats(descriptor) {
    if (!statStripEl || !descriptor) return;
    statStripEl.innerHTML = (descriptor.fields ?? []).map((field) => `<div class="stat"><b>${field.value}</b><span>${field.label}</span></div>`).join("");
  }

  function renderTowerPanel(descriptor) {
    if (!towerPanelEl || !descriptor) return;
    towerPanelEl.innerHTML = (descriptor.cards ?? []).map((card, index) => `
      <button class="tower-card ${card.selected ? "selected" : ""} ${card.affordable ? "" : "locked"}" data-blueprint-id="${card.id}" title="${card.label}">
        <i class="tower-icon" style="background:${card.color}"></i>
        <strong>${index + 1}. ${card.label}</strong>
        <span>${card.cost} CR · ${card.role}</span>
      </button>
    `).join("");
  }

  function renderContext(ui) {
    if (!contextPanelEl) return;
    const context = ui.find((item) => item.kind === "ui-selection-context");
    const upgrade = ui.find((item) => item.kind === "ui-upgrade-tree");
    if (!context?.visible) {
      contextPanelEl.classList.remove("visible");
      contextPanelEl.innerHTML = "";
      return;
    }
    contextPanelEl.classList.add("visible");
    const stats = Object.entries(context.stats ?? {}).map(([key, value]) => `<div><b>${value ?? "--"}</b><span>${key}</span></div>`).join("");
    const upgrades = upgrade?.empty ? "" : `<section class="upgrade-list">${(upgrade?.branches ?? []).map((branch) => `<div class="upgrade-node ${branch.affordable ? "affordable" : ""}"><strong>${branch.label} · ${branch.cost} CR</strong><span>${Object.entries(branch.statDeltas ?? {}).map(([k, v]) => `${k} ${v}`).join(" · ")}</span></div>`).join("")}<div class="upgrade-node"><strong>Sell</strong><span>Refund ${upgrade?.sell?.refund ?? 0} CR</span></div></section>`;
    contextPanelEl.innerHTML = `<h2>${context.title}</h2><section class="context-grid">${stats}</section>${upgrades}`;
  }

  function drawUi(presentation) {
    const ui = presentation.ui ?? [];
    renderStats(ui.find((item) => item.kind === "ui-stat-strip"));
    renderTowerPanel(ui.find((item) => item.kind === "ui-tower-selection-panel"));
    renderContext(ui);
  }

  function findHit(worldPoint, presentation) {
    const raw = presentation?.rawSnapshot ?? presentation;
    for (const structure of Object.values(raw?.structures?.structures ?? {})) {
      if (Math.hypot(worldPoint.x - structure.x, worldPoint.y - structure.y) <= 28) return { kind: "structure", id: structure.id };
    }
    for (const slot of Object.values(raw?.map?.slots ?? {})) {
      if (Math.hypot(worldPoint.x - slot.x, worldPoint.y - slot.y) <= 48) return { kind: "slot", id: slot.id };
    }
    return null;
  }

  function draw(presentation, activeBlueprint = "bolt") {
    const safe = presentation?.rawSnapshot ? presentation : { rawSnapshot: presentation ?? {} };
    drawBackdrop();
    drawGround(safe);
    drawRangeRings(safe);
    drawPlacement(safe);
    drawUnits(safe);
    drawVfx(safe);
    drawUi(safe);
  }

  resize();
  return { resize, showFatal, screenToWorld, findHit, draw, setHover(hit) { hover = hit; } };
}
