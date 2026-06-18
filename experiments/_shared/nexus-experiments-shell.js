import { galleryConfig, games, getFeaturedGame } from "./nexus-gallery-data.js?v=onnx-chat-lab-20260618";
import { startNexusGalleryShader } from "./nexus-gallery-shader.js";

const STYLE_ID = "nexus-experiments-shell-style";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function injectStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      color-scheme: dark;
      --bg:#020304;
      --line:rgba(236,242,245,.18);
      --text:#f4f7f8;
      --muted:#a9b5bb;
      --blue:#83d8ff;
      --gold:#ffe36d;
      --green:#6bf0b8;
      --red:#ff8b7b;
      --card:clamp(300px,29vw,380px);
      --selected-scale:1.13;
    }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; }
    body {
      min-height:100svh;
      overflow-x:hidden;
      color:var(--text);
      background:#030404;
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    body::after {
      position:fixed;
      inset:0;
      z-index:0;
      pointer-events:none;
      content:"";
      background:
        radial-gradient(circle at 50% 18%, rgba(255,255,255,.10), transparent 26rem),
        radial-gradient(circle at 50% 80%, rgba(255,227,109,.055), transparent 34rem),
        linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.56));
      opacity:.88;
      mix-blend-mode:screen;
    }
    a { color:inherit; }
    .nexus-gallery-background {
      position:fixed;
      inset:0;
      z-index:0;
      width:100vw;
      height:100vh;
      display:block;
      pointer-events:none;
      background:radial-gradient(circle at 50% 35%, rgba(231,235,232,.13), transparent 31rem), linear-gradient(145deg,#010202,#151819 66%,#030404);
    }
    .nexus-gallery-background.is-fallback {
      background:radial-gradient(circle at 50% 35%, rgba(231,235,232,.13), transparent 31rem), linear-gradient(145deg,#010202,#151819 66%,#030404);
    }
    .nexus-shell {
      position:relative;
      z-index:1;
      width:min(100% - 28px,1680px);
      min-height:100svh;
      margin:0 auto;
      padding:22px 0 26px;
      display:grid;
      grid-template-rows:auto auto minmax(0,1fr);
      gap:16px;
    }
    .nexus-topbar {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      padding:14px 18px;
      border:1px solid var(--line);
      border-radius:22px;
      background:linear-gradient(180deg,rgba(18,22,24,.76),rgba(5,7,8,.54));
      box-shadow:0 24px 80px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
      backdrop-filter:blur(18px);
    }
    .nexus-brand strong {
      display:block;
      color:var(--gold);
      font-size:1.08rem;
      font-weight:950;
      letter-spacing:.18em;
      text-transform:uppercase;
      text-shadow:0 0 22px rgba(255,227,109,.22);
    }
    .nexus-brand span {
      display:block;
      margin-top:3px;
      color:var(--muted);
      font-size:.88rem;
    }
    .nexus-top-actions,
    .nexus-gallery-controls { display:flex; align-items:center; gap:8px; }
    .nexus-repo-button,
    .nexus-launch-button,
    .nexus-scroll-button {
      border:1px solid rgba(255,227,109,.56);
      border-radius:999px;
      color:var(--gold);
      background:rgba(255,227,109,.06);
      font-weight:950;
      letter-spacing:.08em;
      text-transform:uppercase;
      text-decoration:none;
      box-shadow:0 14px 34px rgba(0,0,0,.22);
      cursor:pointer;
    }
    .nexus-repo-button,
    .nexus-launch-button { flex:0 0 auto; padding:10px 16px; font-size:.78rem; }
    .nexus-launch-button {
      color:#07110d;
      background:linear-gradient(90deg,#ffe36d,#6bf0b8);
      border-color:rgba(255,227,109,.86);
    }
    .nexus-repo-button:hover,
    .nexus-repo-button:focus-visible,
    .nexus-launch-button:hover,
    .nexus-launch-button:focus-visible,
    .nexus-scroll-button:hover,
    .nexus-scroll-button:focus-visible {
      outline:none;
      box-shadow:0 0 32px rgba(255,227,109,.18),0 14px 34px rgba(0,0,0,.28);
      border-color:rgba(255,227,109,.9);
    }
    .nexus-gallery-help {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      color:rgba(234,246,255,.68);
      font-size:.86rem;
      padding:0 2px;
    }
    .nexus-count { color:var(--gold); font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    .nexus-selected-title { color:rgba(244,247,248,.9); font-weight:800; }
    .nexus-scroll-button { width:42px; height:38px; display:grid; place-items:center; font-size:1.05rem; }
    .nexus-scroll-button:disabled { opacity:.35; cursor:default; box-shadow:none; }
    .nexus-gallery-row {
      width:100%;
      min-height:min(74svh,760px);
      display:flex;
      align-items:center;
      gap:clamp(18px,2.2vw,30px);
      overflow-x:auto;
      overflow-y:hidden;
      padding:36px max(24px,calc(50vw - var(--card) / 2)) 44px;
      scroll-snap-type:x mandatory;
      scroll-behavior:smooth;
      scrollbar-color:rgba(230,231,220,.66) rgba(255,255,255,.09);
      scrollbar-width:thin;
      cursor:grab;
      touch-action:pan-x;
      overscroll-behavior-x:contain;
    }
    .nexus-gallery-row.is-dragging { cursor:grabbing; scroll-snap-type:none; }
    .nexus-game-tile {
      flex:0 0 var(--card);
      width:var(--card);
      aspect-ratio:4/5;
      min-height:430px;
      display:flex;
      flex-direction:column;
      scroll-snap-align:center;
      overflow:hidden;
      border:0;
      border-left:1px solid rgba(236,242,245,.22);
      border-right:1px solid rgba(236,242,245,.22);
      color:inherit;
      text-align:left;
      text-decoration:none;
      background:linear-gradient(180deg,rgba(20,25,27,.76),rgba(4,6,7,.74));
      box-shadow:0 34px 95px rgba(0,0,0,.48),0 16px 34px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.06);
      transform:translateY(0) scale(.93);
      transform-origin:center center;
      transition:transform 190ms ease,border-color 190ms ease,box-shadow 190ms ease,filter 190ms ease;
      backdrop-filter:blur(18px);
      filter:saturate(.86) brightness(.82);
      cursor:pointer;
      user-select:none;
      z-index:1;
    }
    .nexus-game-tile.is-selected {
      border-left-color:rgba(255,227,109,.86);
      border-right-color:rgba(255,227,109,.86);
      box-shadow:0 52px 140px rgba(0,0,0,.62),0 0 94px rgba(255,227,109,.18),inset 0 1px 0 rgba(255,255,255,.1);
      transform:translateY(-18px) scale(var(--selected-scale));
      filter:saturate(1.08) brightness(1.04);
      z-index:3;
    }
    .nexus-game-tile:hover,
    .nexus-game-tile:focus-visible {
      transform:translateY(-12px) scale(1.01);
      border-left-color:rgba(255,227,109,.82);
      border-right-color:rgba(255,227,109,.82);
      outline:none;
      box-shadow:0 60px 150px rgba(0,0,0,.64),0 0 110px rgba(255,227,109,.13),inset 0 1px 0 rgba(255,255,255,.12);
      filter:saturate(1.08) brightness(1.04);
      z-index:4;
    }
    .nexus-game-tile.is-selected:hover,
    .nexus-game-tile.is-selected:focus-visible { transform:translateY(-20px) scale(calc(var(--selected-scale) + .02)); }
    .nexus-game-art { flex:0 0 39%; position:relative; overflow:hidden; background:linear-gradient(135deg,#101315,#050606); }
    .is-selected .nexus-game-art { flex-basis:43%; }
    .nexus-game-art::after { position:absolute; inset:0; content:""; background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.14),transparent 62%),linear-gradient(180deg,transparent,rgba(0,0,0,.18)); opacity:.85; }
    .nexus-game-art::before { position:absolute; inset:0; content:""; }
    .nexus-game-art.next::before { background:radial-gradient(circle at 48% 28%,rgba(255,227,109,.9) 0 10px,transparent 12px),linear-gradient(135deg,#1b2440,#0a1220); }
    .nexus-game-art.fogline::before { background:radial-gradient(circle at 48% 38%,rgba(238,248,250,.92) 0 6px,transparent 8px),radial-gradient(circle at 32% 64%,rgba(255,255,255,.18),transparent 5.5rem),linear-gradient(135deg,#050606,#1b2022); }
    .nexus-game-art.sora::before { background:radial-gradient(circle at 70% 26%,rgba(255,227,109,.95) 0 13px,transparent 15px),radial-gradient(circle at 46% 58%,rgba(150,213,255,.46),transparent 8rem),linear-gradient(145deg,#0b2b52,#5ca7e8 52%,#0a1525); }
    .nexus-game-art.zombie::before { background:radial-gradient(circle at 45% 54%,rgba(61,240,161,.64),transparent 5rem),radial-gradient(circle at 70% 36%,rgba(255,91,69,.42),transparent 5rem),linear-gradient(135deg,#0d1c13,#33130f); }
    .nexus-game-art.hell::before { background:radial-gradient(circle at 48% 42%,rgba(255,227,109,.92) 0 8px,transparent 9px),radial-gradient(circle at 42% 48%,rgba(239,68,68,.76) 0 30px,transparent 31px),radial-gradient(circle at 72% 36%,rgba(87,199,255,.28),transparent 5rem),linear-gradient(135deg,#180606,#08121d); }
    .nexus-game-info { padding:20px; display:flex; flex-direction:column; gap:13px; flex:1; min-height:0; }
    .nexus-tags { display:flex; flex-wrap:wrap; gap:7px; }
    .nexus-tag { border:1px solid rgba(130,216,255,.22); border-radius:999px; padding:6px 9px; color:var(--blue); background:rgba(130,216,255,.06); font-size:.72rem; font-weight:900; letter-spacing:.03em; text-transform:uppercase; }
    .nexus-tag.gold { color:var(--gold); border-color:rgba(255,227,109,.32); background:rgba(255,227,109,.06); }
    .nexus-tag.green { color:var(--green); border-color:rgba(105,240,184,.25); background:rgba(105,240,184,.06); }
    .nexus-tag.red { color:var(--red); border-color:rgba(255,139,123,.34); background:rgba(255,139,123,.07); }
    .nexus-game-tile h2 { margin:0; font-size:clamp(1.25rem,1.8vw,1.58rem); line-height:1.05; letter-spacing:-.04em; }
    .nexus-game-tile.is-selected h2 { font-size:clamp(1.75rem,2.5vw,2.35rem); }
    .nexus-game-tile p { margin:0; color:var(--muted); line-height:1.5; flex:1; overflow:hidden; }
    .nexus-play { color:var(--gold); font-weight:950; letter-spacing:.08em; text-transform:uppercase; font-size:.78rem; }
    .nexus-game-tile.is-selected .nexus-play::before { content:"Launch "; color:var(--green); }
    @media (max-width:720px) {
      .nexus-shell { width:min(100% - 16px,1680px); padding-top:10px; }
      .nexus-topbar { align-items:flex-start; flex-direction:column; border-radius:18px; }
      .nexus-gallery-help { flex-direction:column; align-items:flex-start; gap:8px; }
      .nexus-gallery-row { min-height:68svh; padding-top:22px; }
      .nexus-game-tile { min-height:390px; }
    }
  `;
  documentRef.head.append(style);
}

function createTile(game, index) {
  const tags = game.tags.map((tag) => `<span class="nexus-tag ${escapeHtml(tag.tone ?? "")}">${escapeHtml(tag.label)}</span>`).join("");
  return `
    <a class="nexus-game-tile" href="${escapeHtml(game.route)}" data-index="${index}" data-game-id="${escapeHtml(game.id)}">
      <div class="nexus-game-art ${escapeHtml(game.visual ?? "next")}" aria-hidden="true"></div>
      <div class="nexus-game-info">
        <div class="nexus-tags">${tags}</div>
        <h2>${escapeHtml(game.title)}</h2>
        <p>${escapeHtml(game.description)}</p>
        <span class="nexus-play">${escapeHtml(game.playLabel ?? "Play")}</span>
      </div>
    </a>
  `;
}

function nearestTile(row) {
  const tiles = [...row.querySelectorAll(".nexus-game-tile")];
  const center = row.scrollLeft + row.clientWidth / 2;
  let best = tiles[0] ?? null;
  let bestDistance = Infinity;
  for (const tile of tiles) {
    const tileCenter = tile.offsetLeft + tile.clientWidth / 2;
    const distance = Math.abs(tileCenter - center);
    if (distance < bestDistance) {
      best = tile;
      bestDistance = distance;
    }
  }
  return best;
}

function updateSelected(row, title, countLabel) {
  const tile = nearestTile(row);
  if (!tile) return;
  for (const other of row.querySelectorAll(".nexus-game-tile")) other.classList.toggle("is-selected", other === tile);
  const index = Number(tile.dataset.index ?? 0);
  const game = games[index];
  title.textContent = game?.title ?? "";
  countLabel.textContent = `${index + 1} / ${games.length}`;
}

function scrollByCard(row, direction) {
  const tile = row.querySelector(".nexus-game-tile");
  const amount = tile ? tile.clientWidth + 26 : row.clientWidth * 0.8;
  row.scrollBy({ left: direction * amount, behavior: "smooth" });
}

export function mountNexusExperimentsGallery({ documentRef = document, root = documentRef.querySelector("#app") } = {}) {
  if (!root) throw new Error("Nexus gallery root #app was not found.");
  injectStyles(documentRef);
  root.innerHTML = `
    <canvas class="nexus-gallery-background" aria-hidden="true"></canvas>
    <section class="nexus-shell">
      <header class="nexus-topbar">
        <div class="nexus-brand">
          <strong>NexusRealtime ${escapeHtml(galleryConfig.title)}</strong>
          <span>${escapeHtml(galleryConfig.subtitle)}</span>
        </div>
        <nav class="nexus-top-actions" aria-label="Gallery actions">
          <a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Repo</a>
          <a class="nexus-launch-button" href="${escapeHtml(getFeaturedGame()?.route ?? "#")}">Featured</a>
        </nav>
      </header>
      <section class="nexus-gallery-help" aria-label="Gallery status">
        <span>${escapeHtml(galleryConfig.hint)}</span>
        <span><strong class="nexus-count">1 / ${games.length}</strong> <span class="nexus-selected-title">${escapeHtml(games[0]?.title ?? "")}</span></span>
        <span class="nexus-gallery-controls">
          <button class="nexus-scroll-button" type="button" data-direction="-1" aria-label="Previous experiment">‹</button>
          <button class="nexus-scroll-button" type="button" data-direction="1" aria-label="Next experiment">›</button>
        </span>
      </section>
      <section class="nexus-gallery-row" aria-label="Playable experiment cards">
        ${games.map(createTile).join("")}
      </section>
    </section>
  `;

  const row = root.querySelector(".nexus-gallery-row");
  const title = root.querySelector(".nexus-selected-title");
  const countLabel = root.querySelector(".nexus-count");
  const buttons = [...root.querySelectorAll(".nexus-scroll-button")];

  let raf = null;
  row.addEventListener("scroll", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => updateSelected(row, title, countLabel));
  }, { passive:true });

  buttons.forEach((button) => button.addEventListener("click", () => scrollByCard(row, Number(button.dataset.direction ?? 1))));

  let dragging = false;
  let startX = 0;
  let startLeft = 0;
  row.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    startLeft = row.scrollLeft;
    row.classList.add("is-dragging");
    row.setPointerCapture?.(event.pointerId);
  });
  row.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    row.scrollLeft = startLeft - (event.clientX - startX);
  });
  for (const type of ["pointerup", "pointercancel", "mouseleave"]) {
    row.addEventListener(type, () => {
      dragging = false;
      row.classList.remove("is-dragging");
    });
  }

  updateSelected(row, title, countLabel);
  const canvas = root.querySelector(".nexus-gallery-background");
  startNexusGalleryShader({ canvas });
}

mountNexusExperimentsGallery();
