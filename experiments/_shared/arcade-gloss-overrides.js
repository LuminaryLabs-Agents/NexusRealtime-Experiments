const STYLE_ID = "nexus-arcade-performance-overrides";
const CENTER_SELECTION_MARKER = "nexus-centered-selection-wired";

function injectArcadePerformanceOverrides(documentRef = document) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --arcade-card-height: clamp(320px, 42vh, 460px);
      --candy-ink: #190026;
      --candy-chip: rgba(255,255,255,.86);
      --candy-panel: linear-gradient(116deg, #ff58d2 0%, #ffe45e 26%, #6dff9c 53%, #4fd8ff 78%, #9a6bff 100%);
      --candy-panel-alt: linear-gradient(116deg, #56d6ff 0%, #9b6bff 24%, #ff58d2 52%, #ffe45e 78%, #6dff9c 100%);
      --candy-lane: repeating-linear-gradient(112deg, rgba(255,255,255,.36) 0 2px, transparent 2px 42px, rgba(255,255,255,.22) 42px 45px, transparent 45px 86px);
      --candy-sheen: linear-gradient(145deg, rgba(255,255,255,.76) 0%, rgba(255,255,255,.34) 13%, rgba(255,255,255,.08) 36%, rgba(255,255,255,0) 58%);
      --candy-edge: linear-gradient(90deg, #ffffff, #ff4fd8, #ffe14a, #7cff9b, #53d6ff, #ffffff);
    }

    html, body {
      animation: none !important;
      background:
        radial-gradient(circle at 14% 8%, rgba(255,88,210,.48), transparent 30%),
        radial-gradient(circle at 88% 8%, rgba(79,216,255,.42), transparent 32%),
        radial-gradient(circle at 18% 88%, rgba(109,255,156,.34), transparent 34%),
        linear-gradient(135deg, #5a00a8 0%, #0089d6 38%, #00b47a 68%, #ff9b2f 100%) !important;
      background-attachment: fixed !important;
    }

    body::before,
    body::after {
      opacity: 0 !important;
      animation: none !important;
      transform: none !important;
      filter: none !important;
    }

    @keyframes zipperSwoopIn {
      0% { opacity: 0; transform: translate3d(var(--swoop-x), 72px, 0) rotateZ(var(--swoop-rotation)) scale(.94); }
      64% { opacity: 1; transform: translate3d(var(--swoop-over), -12px, 0) rotateZ(var(--swoop-correct)) scale(1.022); }
      100% { opacity: 1; transform: translate3d(0, 0, 0) rotateZ(0deg) scale(1); }
    }

    .nexus-command-bar,
    .nexus-search,
    .nexus-tab,
    .nexus-route-row,
    .nexus-route-kind,
    .nexus-route-desc,
    .nexus-route-open,
    .nexus-empty {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
    }

    .nexus-command-bar {
      background: linear-gradient(110deg, rgba(255,255,255,.28), rgba(255,255,255,.10)), linear-gradient(110deg, #ff58d2, #ffe45e 31%, #6dff9c 59%, #4fd8ff) !important;
      box-shadow: 0 10px 26px rgba(50,0,80,.18), inset 0 1px 0 rgba(255,255,255,.66), inset 0 0 0 1px rgba(255,255,255,.26) !important;
    }

    .nexus-command-bar::before { opacity: 0 !important; }
    .nexus-brand strong,
    .nexus-result-count { color: #180022 !important; background: none !important; -webkit-background-clip: initial !important; background-clip: initial !important; filter: none !important; text-shadow: 0 1px 0 rgba(255,255,255,.42) !important; }
    .nexus-brand span,
    .nexus-context,
    .nexus-context-help { color: #fff7cb !important; text-shadow: 0 1px 3px rgba(31,0,41,.62) !important; }
    .nexus-search,
    .nexus-tab { background: rgba(255,255,255,.78) !important; color: var(--candy-ink) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.7), inset 0 0 0 1px rgba(255,255,255,.34), 0 6px 14px rgba(48,0,76,.12) !important; }
    .nexus-tab.is-active,
    .nexus-repo-button { background: #ffffff !important; color: var(--candy-ink) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 8px 18px rgba(48,0,76,.16) !important; }
    .nexus-search-input,
    .nexus-search-input::placeholder,
    .nexus-search span { color: var(--candy-ink) !important; text-shadow: none !important; }

    .nexus-route-list { gap: 28px !important; padding: 18px 0 18px !important; perspective: none !important; }
    .nexus-route-row {
      --swoop-x: -232px;
      --swoop-rotation: -8deg;
      --swoop-over: 18px;
      --swoop-correct: 1.6deg;
      min-height: var(--arcade-card-height) !important;
      grid-template-columns: 10px minmax(220px, .9fr) minmax(150px, .44fr) minmax(300px, 1.4fr) auto !important;
      gap: 18px !important;
      padding: 26px 26px 26px 0 !important;
      border-radius: 42px !important;
      overflow: hidden !important;
      color: var(--candy-ink) !important;
      background: var(--candy-sheen), var(--candy-lane), var(--candy-panel) !important;
      background-size: auto, 112px 100%, auto !important;
      box-shadow: 0 16px 36px rgba(50,0,80,.18), inset 0 2px 0 rgba(255,255,255,.72), inset 0 -18px 34px rgba(80,0,120,.10), inset 0 0 0 1px rgba(255,255,255,.36) !important;
      contain: layout style paint;
      content-visibility: auto;
      contain-intrinsic-size: 360px;
      will-change: transform, opacity;
      opacity: 1 !important;
      transform-origin: center center;
      animation: zipperSwoopIn .68s cubic-bezier(.16,.84,.22,1) backwards !important;
      animation-delay: var(--zipper-delay) !important;
      transition: transform .16s ease, box-shadow .16s ease !important;
    }
    .nexus-route-row.is-even { --swoop-x: -232px; --swoop-rotation: -8deg; --swoop-over: 18px; --swoop-correct: 1.6deg; margin-right: clamp(24px, 5vw, 92px) !important; }
    .nexus-route-row.is-odd { --swoop-x: 232px; --swoop-rotation: 8deg; --swoop-over: -18px; --swoop-correct: -1.6deg; margin-left: clamp(24px, 5vw, 92px) !important; background: var(--candy-sheen), var(--candy-lane), var(--candy-panel-alt) !important; }
    .nexus-route-row::before { background: linear-gradient(126deg, rgba(255,255,255,.72), rgba(255,255,255,.18) 18%, transparent 33%), linear-gradient(24deg, transparent 42%, rgba(255,255,255,.28) 47%, transparent 53%) !important; opacity: .86 !important; mix-blend-mode: normal !important; }
    .nexus-route-row::after { bottom: -10px !important; width: min(72%, 1180px) !important; height: 10px !important; background: var(--candy-edge) !important; opacity: .96 !important; filter: none !important; box-shadow: 0 0 0 1px rgba(255,255,255,.32) !important; }
    .nexus-route-row:hover,
    .nexus-route-row.is-selected { transform: translate3d(0, -8px, 0) rotateZ(var(--swoop-correct)) scale(1.012) !important; box-shadow: 0 20px 42px rgba(50,0,80,.22), inset 0 2px 0 rgba(255,255,255,.82), inset 0 -18px 34px rgba(80,0,120,.08), inset 0 0 0 1px rgba(255,255,255,.46) !important; }
    .nexus-route-title,
    .nexus-route-kind,
    .nexus-route-desc,
    .nexus-route-open { color: var(--candy-ink) !important; text-shadow: none !important; filter: none !important; }
    .nexus-route-title { max-width: 15ch; padding: 14px 16px; border-radius: 26px; background: rgba(255,255,255,.68); box-shadow: inset 0 1px 0 rgba(255,255,255,.62), inset 0 0 0 1px rgba(255,255,255,.30); font-size: clamp(1.42rem, 2.35vw, 2.44rem) !important; line-height: .96 !important; }
    .nexus-route-kind,
    .nexus-route-desc,
    .nexus-route-open { background: var(--candy-chip) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.72), inset 0 0 0 1px rgba(255,255,255,.34), 0 5px 12px rgba(48,0,76,.10) !important; }
    .nexus-route-desc { -webkit-line-clamp: 4 !important; font-size: clamp(1rem, 1.22vw, 1.18rem) !important; line-height: 1.35 !important; padding: 14px 16px !important; }
    .nexus-route-open,
    .nexus-route-row:hover .nexus-route-open,
    .nexus-route-row.is-selected .nexus-route-open { background: #ffffff !important; color: var(--candy-ink) !important; }
    .nexus-route-accent { min-height: calc(var(--arcade-card-height) - 54px) !important; width: 10px !important; background: #ffffff !important; box-shadow: inset 0 0 0 1px rgba(255,255,255,.4) !important; }

    @media (max-width: 1180px) { .nexus-route-row { min-height: clamp(284px, 38vh, 420px) !important; } .nexus-route-title { max-width: none; } }
    @media (max-width: 760px) { .nexus-route-list { gap: 22px !important; } .nexus-route-row { min-height: 278px !important; margin-left: 0 !important; margin-right: 0 !important; padding: 20px 12px 20px 0 !important; border-radius: 32px !important; grid-template-columns: 8px 1fr auto !important; } .nexus-route-row:hover { transform: translate3d(0, -4px, 0) scale(1.006) !important; } .nexus-route-desc { -webkit-line-clamp: 3 !important; } .nexus-route-title { font-size: 1.18rem !important; } .nexus-route-accent { min-height: 210px !important; } }
    @media (prefers-reduced-motion: reduce) { html, body, .nexus-route-row, .nexus-route-row:hover { animation: none !important; } .nexus-route-row { opacity: 1 !important; transform: none !important; } .nexus-route-row:hover { transform: none !important; } }
  `;
  documentRef.head.append(style);
}

function getArcadeRows(documentRef = document) {
  return Array.from(documentRef.querySelectorAll(".nexus-route-row"));
}

function getCenteredArcadeRow(documentRef = document) {
  const rows = getArcadeRows(documentRef);
  if (!rows.length) return null;
  const viewportCenter = window.innerHeight * 0.5;
  let best = null;
  let bestScore = Infinity;
  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    if (!rect.height) continue;
    const rowCenter = rect.top + rect.height * 0.5;
    const visible = rect.bottom >= 0 && rect.top <= window.innerHeight;
    const distance = Math.abs(rowCenter - viewportCenter);
    const offscreenPenalty = visible ? 0 : window.innerHeight;
    const score = distance + offscreenPenalty;
    if (score < bestScore) {
      best = row;
      bestScore = score;
    }
  }
  return best ?? rows[0];
}

function applyCenteredArcadeSelection(documentRef = document) {
  const centered = getCenteredArcadeRow(documentRef);
  const rows = getArcadeRows(documentRef);
  for (const row of rows) {
    const active = row === centered;
    row.classList.toggle("is-selected", active);
    row.setAttribute("aria-selected", String(active));
    row.tabIndex = active ? 0 : -1;
  }
  return centered;
}

function scrollArcadeRowToCenter(row, behavior = "smooth") {
  if (!row) return;
  const rect = row.getBoundingClientRect();
  const top = window.scrollY + rect.top - window.innerHeight * 0.5 + rect.height * 0.5;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function wireCenteredArcadeSelection(documentRef = document) {
  if (window[CENTER_SELECTION_MARKER]) return;
  window[CENTER_SELECTION_MARKER] = true;
  let frame = 0;
  const scheduleSelection = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      applyCenteredArcadeSelection(documentRef);
    });
  };

  const moveCenteredSelection = (direction) => {
    const rows = getArcadeRows(documentRef);
    if (!rows.length) return;
    const centered = getCenteredArcadeRow(documentRef);
    const current = Math.max(0, rows.indexOf(centered));
    const next = Math.max(0, Math.min(rows.length - 1, current + direction));
    scrollArcadeRowToCenter(rows[next]);
  };

  window.addEventListener("scroll", scheduleSelection, { passive: true });
  window.addEventListener("resize", scheduleSelection, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopImmediatePropagation();
      moveCenteredSelection(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter") {
      const row = getCenteredArcadeRow(documentRef);
      const route = row?.dataset?.route;
      if (!route) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.open(route, "_blank", "noopener");
    }
  }, true);

  documentRef.addEventListener("click", (event) => {
    const row = event.target.closest?.(".nexus-route-row");
    if (!row) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    scrollArcadeRowToCenter(row);
  }, true);

  const observer = new MutationObserver(scheduleSelection);
  const observe = () => {
    const list = documentRef.querySelector(".nexus-route-list");
    if (list) observer.observe(list, { childList: true });
    scheduleSelection();
  };
  observe();
  window.setTimeout(observe, 60);
  window.setTimeout(scheduleSelection, 220);
}

injectArcadePerformanceOverrides();
wireCenteredArcadeSelection();
