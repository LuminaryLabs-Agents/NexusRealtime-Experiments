import { apps, tabs, galleryConfig } from "./nexus-gallery-data.js?v=calm-cover-gallery-20260623";

const STYLE_ID = "nexus-experiments-shell-style";
const COVER_MANIFEST_URL = new URL("./generated-cover-manifest.json?v=calm-cover-gallery-20260623", import.meta.url);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function displayTitle(app) {
  return String(app.displayTitle ?? app.title ?? app.id).replace(/\s+—\s+NexusRealtime$/i, "");
}

function routeKind(app) {
  const rawKind = String(app.kind ?? "experiment").toLowerCase();
  const kind = rawKind === "game" ? "Game" : rawKind === "workshop" ? "Workshop" : rawKind === "simulation" ? "Simulation" : rawKind === "app" ? "App" : "Experiment";
  const subtype = String(app.subtype ?? app.source ?? app.visual ?? "route")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  return `${kind} · ${subtype}`;
}

function description(app) {
  return app.shortDescription ?? app.description ?? "Open this NexusRealtime route.";
}

function firstTabId() {
  return tabs.find((tab) => tab.id === "experiments")?.id ?? tabs[0]?.id ?? "experiments";
}

function normalizedRouteKey(route) {
  return String(route ?? "")
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/index\.html$/i, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .replace(/\/+$/, "") + "/";
}

function initials(app) {
  const words = displayTitle(app).split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NR";
}

function hashHue(value) {
  const text = String(value ?? "nexus");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash % 360;
}

function tabItems(tabId, query = "") {
  const needle = query.trim().toLowerCase();
  return apps.filter((app) => {
    if (app.tab !== tabId) return false;
    if (!needle) return true;
    const haystack = String(app.searchText ?? [
      app.title,
      app.displayTitle,
      app.id,
      app.description,
      app.shortDescription,
      app.kind,
      app.subtype,
      app.source,
      app.route,
      ...(app.tags ?? []).map((tag) => tag.label),
      ...(app.kitStack ?? []),
      app.controls,
      ...(app.smokeActions ?? [])
    ].join(" ")).toLowerCase();
    return haystack.includes(needle);
  });
}

function activeTab(state) {
  return tabs.find((tab) => tab.id === state.activeTabId) ?? tabs[0] ?? { id: "experiments", label: "Experiments", count: 0 };
}

function visibleItems(state) {
  return tabItems(activeTab(state).id, state.query);
}

function openRoute(route) {
  if (!route) return;
  globalThis.open(route, "_blank", "noopener");
}

async function loadCoverManifest() {
  try {
    const response = await fetch(COVER_MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

function coverForApp(app, manifest) {
  const key = normalizedRouteKey(app.route);
  const entry = manifest?.[key] ?? manifest?.[key.replace(/\/$/, "")] ?? null;
  const cover = entry?.status === "ok" && entry.cover ? entry.cover : app.coverImage ?? app.cover ?? null;
  if (!cover) return null;
  return new URL(cover, globalThis.location.href).toString();
}

function injectStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      color-scheme: dark;
      --bg: #080a0e;
      --bg-soft: #0d1016;
      --panel: rgba(16, 19, 27, .82);
      --panel-strong: rgba(18, 21, 30, .96);
      --line: rgba(255,255,255,.10);
      --line-strong: rgba(255,255,255,.18);
      --text: #f4f0e8;
      --muted: #aeb6c4;
      --dim: #77808e;
      --accent: #d8c38a;
      --accent-soft: rgba(216,195,138,.16);
      --shadow: 0 18px 60px rgba(0,0,0,.32);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { position: relative; overflow-y: auto; isolation: isolate; }
    body::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(circle at 50% -10%, rgba(216,195,138,.16), transparent 38%), radial-gradient(circle at 85% 5%, rgba(92,130,190,.10), transparent 32%), linear-gradient(180deg, #0b0d12 0%, #080a0e 42%, #06070a 100%); }
    body::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .34; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size: 64px 64px; mask-image: linear-gradient(to bottom, black, transparent 72%); }
    a { color: inherit; }
    .nexus-shell { position: relative; z-index: 1; width: min(100% - 32px, 1320px); min-height: 100svh; margin: 0 auto; padding: 18px 0 42px; }
    .nexus-command-bar { position: sticky; top: 10px; z-index: 5; display: grid; grid-template-columns: minmax(220px, auto) minmax(240px, 1fr) auto auto; gap: 10px; align-items: center; padding: 10px 12px; border: 1px solid var(--line); border-radius: 18px; background: rgba(18,21,30,.94); backdrop-filter: blur(18px); box-shadow: var(--shadow); }
    .nexus-brand { min-width: 0; }
    .nexus-brand strong { display: block; color: var(--text); font-size: .92rem; font-weight: 850; letter-spacing: .11em; text-transform: uppercase; white-space: nowrap; }
    .nexus-brand span { display: block; margin-top: 2px; color: var(--muted); font-size: .78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nexus-search { min-width: 0; height: 38px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--line); border-radius: 12px; background: rgba(0,0,0,.22); }
    .nexus-search span { color: var(--dim); font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .nexus-search-input { width: 100%; min-width: 80px; border: 0; outline: 0; background: transparent; color: var(--text); font: inherit; font-size: .92rem; }
    .nexus-search-input::placeholder { color: #7d8796; }
    .nexus-tabs { display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow-x: auto; scrollbar-width: none; }
    .nexus-tabs::-webkit-scrollbar { display: none; }
    .nexus-tab { height: 34px; border: 1px solid var(--line); border-radius: 999px; padding: 0 11px; color: var(--muted); background: rgba(255,255,255,.035); font-weight: 800; font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; transition: background .16s ease, color .16s ease, border-color .16s ease, transform .16s ease; }
    .nexus-tab:hover { transform: translateY(-1px); color: var(--text); border-color: var(--line-strong); background: rgba(255,255,255,.07); }
    .nexus-tab.is-active { color: #111318; border-color: rgba(216,195,138,.78); background: linear-gradient(180deg, #efe1b6, #bea66a); }
    .nexus-tab-count { opacity: .78; margin-left: 4px; }
    .nexus-meta { display: flex; align-items: center; justify-content: flex-end; gap: 10px; white-space: nowrap; }
    .nexus-result-count { color: var(--muted); font-size: .78rem; font-weight: 800; }
    .nexus-repo-button { height: 34px; display: inline-grid; place-items: center; border: 1px solid var(--line); border-radius: 999px; padding: 0 13px; color: var(--text); background: rgba(255,255,255,.05); font-size: .72rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; text-decoration: none; }
    .nexus-repo-button:hover { border-color: rgba(216,195,138,.6); background: var(--accent-soft); }
    .nexus-context { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 2px 8px; color: var(--muted); font-size: .82rem; }
    .nexus-context-help { color: var(--dim); }
    .nexus-route-list { display: flex; flex-direction: column; gap: 10px; padding: 6px 0 10px; }
    .nexus-route-row { --cover-hue: 220; position: relative; display: grid; grid-template-columns: 168px minmax(0, 1fr) auto; align-items: center; gap: 16px; min-height: 106px; padding: 10px 12px 10px 10px; border: 1px solid var(--line); border-radius: 18px; color: var(--muted); text-decoration: none; cursor: default; outline: none; background: linear-gradient(180deg, rgba(255,255,255,.046), rgba(255,255,255,.024)), var(--panel); box-shadow: 0 10px 36px rgba(0,0,0,.20); transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease; }
    .nexus-route-row:hover, .nexus-route-row.is-selected { transform: translateY(-1px); border-color: rgba(216,195,138,.40); background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.035)), var(--panel-strong); box-shadow: 0 16px 46px rgba(0,0,0,.28); }
    .nexus-route-row:focus-visible, .nexus-tab:focus-visible, .nexus-search-input:focus-visible, .nexus-repo-button:focus-visible { outline: 2px solid rgba(216,195,138,.82); outline-offset: 3px; }
    .nexus-route-cover { position: relative; height: 86px; border-radius: 12px; overflow: hidden; background: linear-gradient(135deg, hsl(var(--cover-hue) 26% 18%), hsl(calc(var(--cover-hue) + 36) 22% 29%)); border: 1px solid rgba(255,255,255,.10); box-shadow: inset 0 0 0 1px rgba(255,255,255,.04); }
    .nexus-route-cover::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 24% 18%, rgba(255,255,255,.18), transparent 28%), linear-gradient(135deg, transparent, rgba(0,0,0,.36)); pointer-events: none; }
    .nexus-route-cover img { width: 100%; height: 100%; display: block; object-fit: cover; }
    .nexus-cover-placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.76); font-size: 1.2rem; font-weight: 900; letter-spacing: .12em; }
    .nexus-route-main { min-width: 0; display: grid; gap: 7px; }
    .nexus-route-title { color: var(--text); font-weight: 850; letter-spacing: -.018em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: clamp(1rem, 1.2vw, 1.18rem); }
    .nexus-route-accent { display: inline-block; width: 34px; height: 4px; border-radius: 999px; background: linear-gradient(90deg, hsl(var(--cover-hue) 82% 62%), var(--accent)); box-shadow: 0 0 18px hsla(var(--cover-hue), 82%, 62%, .35); }
    .nexus-route-kind { width: max-content; max-width: 100%; color: var(--accent); font-size: .74rem; font-weight: 850; letter-spacing: .06em; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nexus-route-desc { color: var(--muted); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.32; font-size: .9rem; }
    .nexus-route-open { justify-self: end; color: var(--dim); font-size: .74rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
    .nexus-route-row:hover .nexus-route-open, .nexus-route-row.is-selected .nexus-route-open { color: var(--accent); }
    .nexus-empty { padding: 22px 14px; border: 1px solid var(--line); color: var(--muted); background: var(--panel); border-radius: 18px; }
    @media (max-width: 1040px) { .nexus-command-bar { grid-template-columns: 1fr minmax(220px, 1.2fr) auto; } .nexus-tabs { grid-column: 1 / -1; order: 4; } .nexus-meta { justify-content: space-between; } }
    @media (max-width: 720px) { .nexus-shell { width: min(100% - 18px, 1320px); padding-top: 8px; } .nexus-command-bar { position: relative; top: auto; grid-template-columns: 1fr; align-items: stretch; border-radius: 16px; } .nexus-brand span { white-space: normal; } .nexus-context { align-items: flex-start; flex-direction: column; gap: 4px; } .nexus-route-row { grid-template-columns: 92px 1fr; gap: 11px; min-height: 100px; padding: 9px; } .nexus-route-cover { height: 78px; } .nexus-route-open { grid-column: 2; justify-self: start; } .nexus-route-title { white-space: normal; } .nexus-route-desc { font-size: .84rem; -webkit-line-clamp: 2; } }
    @media (prefers-reduced-motion: reduce) { .nexus-route-row, .nexus-tab { transition: none; } .nexus-route-row:hover, .nexus-route-row.is-selected, .nexus-tab:hover { transform: none; } }
  `;
  documentRef.head.append(style);
}

function renderTabs(activeTabId) {
  return tabs.map((tab) => `<button class="nexus-tab${tab.id === activeTabId ? " is-active" : ""}" type="button" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeTabId}"><span class="nexus-tab-label">${escapeHtml(tab.label)}</span><span class="nexus-tab-count">${escapeHtml(tab.count ?? 0)}</span></button>`).join("");
}

function renderCover(app, manifest) {
  const cover = coverForApp(app, manifest);
  const hue = hashHue(app.id ?? app.route);
  const placeholder = `<span class="nexus-cover-placeholder" aria-hidden="true">${escapeHtml(initials(app))}</span>`;
  const image = cover ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy" decoding="async" onerror="this.remove()" />` : "";
  return `<span class="nexus-route-cover" style="--cover-hue:${hue};" aria-hidden="true">${image}${placeholder}</span>`;
}

function renderRow(app, index, selected, manifest) {
  const hue = hashHue(app.id ?? app.route);
  return `<div class="nexus-route-row${selected ? " is-selected" : ""}" role="link" tabindex="${selected ? "0" : "-1"}" data-index="${index}" data-route="${escapeHtml(app.route)}" data-app-id="${escapeHtml(app.id)}" aria-selected="${selected}" style="--cover-hue:${hue};">${renderCover(app, manifest)}<span class="nexus-route-main"><span class="nexus-route-title">${escapeHtml(displayTitle(app))}</span><span class="nexus-route-accent" aria-hidden="true"></span><span class="nexus-route-kind">${escapeHtml(routeKind(app))}</span><span class="nexus-route-desc">${escapeHtml(description(app))}</span></span><span class="nexus-route-open">Open →</span></div>`;
}

function renderShell(root, state) {
  root.innerHTML = `<section class="nexus-shell" aria-label="NexusRealtime applications launcher"><header class="nexus-command-bar" aria-label="Launcher command bar"><div class="nexus-brand"><strong>${escapeHtml(galleryConfig.title ?? "NexusRealtime")}</strong><span>${escapeHtml(galleryConfig.subtitle ?? "Playable routes")}</span></div><label class="nexus-search"><span>Search</span><input class="nexus-search-input" type="search" placeholder="Filter routes, kits, controls..." autocomplete="off" /></label><nav class="nexus-tabs" aria-label="Route type tabs">${renderTabs(state.activeTabId)}</nav><div class="nexus-meta"><span class="nexus-result-count" aria-live="polite"></span><a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Repo</a></div></header><div class="nexus-context" aria-live="polite"><span class="nexus-context-label"></span><span class="nexus-context-help">/ search · ↑↓ select · Enter open · Esc clear</span></div><section class="nexus-route-list" aria-label="Visible application routes"></section></section>`;
  return {
    tabButtons: Array.from(root.querySelectorAll(".nexus-tab")),
    search: root.querySelector(".nexus-search-input"),
    count: root.querySelector(".nexus-result-count"),
    context: root.querySelector(".nexus-context-label"),
    list: root.querySelector(".nexus-route-list")
  };
}

function getVisible(state) {
  return visibleItems(state);
}

function selectIndex(parts, state, index, focus = false) {
  const items = getVisible(state);
  state.selectedIndex = items.length ? Math.max(0, Math.min(items.length - 1, index)) : -1;
  for (const row of parts.list.querySelectorAll(".nexus-route-row")) {
    const active = Number(row.dataset.index) === state.selectedIndex;
    row.classList.toggle("is-selected", active);
    row.setAttribute("aria-selected", String(active));
    row.tabIndex = active ? 0 : -1;
    if (active && focus) row.focus({ preventScroll: false });
  }
}

function renderList(parts, state) {
  const tab = activeTab(state);
  const items = getVisible(state);
  if (state.selectedIndex >= items.length) state.selectedIndex = items.length - 1;
  if (state.selectedIndex < 0 && items.length) state.selectedIndex = 0;
  parts.count.textContent = `${items.length} / ${tab.count ?? items.length}`;
  parts.context.textContent = `${tab.label} · ${items.length} visible · covers ${Object.keys(state.coverManifest ?? {}).length ? "manifest on" : "fallbacks"}`;
  parts.list.innerHTML = items.length ? items.map((app, index) => renderRow(app, index, index === state.selectedIndex, state.coverManifest)).join("") : `<div class="nexus-empty">No routes matched this search in ${escapeHtml(tab.label)}.</div>`;
  for (const button of parts.tabButtons) {
    const active = button.dataset.tabId === state.activeTabId;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function openSelected(state) {
  const app = getVisible(state)[state.selectedIndex] ?? getVisible(state)[0];
  openRoute(app?.route);
}

function wireLauncher(parts, state) {
  for (const button of parts.tabButtons) {
    button.addEventListener("click", () => {
      state.activeTabId = button.dataset.tabId || firstTabId();
      state.selectedIndex = 0;
      renderList(parts, state);
    });
  }

  parts.search.addEventListener("input", () => {
    state.query = parts.search.value;
    state.selectedIndex = 0;
    renderList(parts, state);
  });

  parts.list.addEventListener("click", (event) => {
    const row = event.target.closest?.(".nexus-route-row");
    if (!row) return;
    openRoute(row.dataset.route);
  });

  parts.list.addEventListener("pointermove", (event) => {
    const row = event.target.closest?.(".nexus-route-row");
    if (!row) return;
    const index = Number(row.dataset.index);
    if (!Number.isNaN(index) && index !== state.selectedIndex) selectIndex(parts, state, index);
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    if (event.key === "/" && active !== parts.search) {
      event.preventDefault();
      parts.search.focus();
      return;
    }
    if (event.key === "Escape") {
      parts.search.value = "";
      state.query = "";
      renderList(parts, state);
      parts.search.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectIndex(parts, state, state.selectedIndex + 1, true);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectIndex(parts, state, state.selectedIndex - 1, true);
      return;
    }
    if (event.key === "Enter" && !String(active?.tagName ?? "").match(/input|textarea|select/i)) {
      event.preventDefault();
      openSelected(state);
    }
  });
}

export async function mountNexusExperimentsGallery(root = document.getElementById("app")) {
  if (!root) throw new Error("Missing #app root for NexusRealtime gallery.");
  injectStyles(document);
  const state = {
    activeTabId: firstTabId(),
    query: "",
    selectedIndex: 0,
    coverManifest: {}
  };
  const parts = renderShell(root, state);
  renderList(parts, state);
  wireLauncher(parts, state);
  state.coverManifest = await loadCoverManifest();
  renderList(parts, state);
  return { state, parts };
}

mountNexusExperimentsGallery().catch((error) => {
  const root = document.getElementById("app") ?? document.body;
  root.innerHTML = `<main style="min-height:100vh;background:#080a0e;color:#f4f0e8;font:16px system-ui;padding:24px;"><h1>NexusRealtime gallery failed to start</h1><pre>${escapeHtml(error?.stack ?? error?.message ?? error)}</pre></main>`;
});
