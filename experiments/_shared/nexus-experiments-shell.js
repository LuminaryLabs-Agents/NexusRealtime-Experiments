import { apps, tabs, galleryConfig } from "./nexus-gallery-data.js?v=main-flat-list";

const STYLE_ID = "nexus-experiments-shell-style";

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
  const kind = app.kind === "app" ? "App" : "Experiment";
  const subtype = String(app.subtype ?? "route").replace(/(^|-)([a-z])/g, (_, dash, letter) => `${dash ? " " : ""}${letter.toUpperCase()}`);
  return `${kind} · ${subtype}`;
}

function description(app) {
  return app.shortDescription ?? app.description ?? "Open this NexusRealtime route.";
}

function firstTabId() {
  return tabs.find((tab) => tab.id === "experiments")?.id ?? tabs[0]?.id ?? "experiments";
}

function tabItems(tabId, query = "") {
  const needle = query.trim().toLowerCase();
  return apps.filter((app) => {
    if (app.tab !== tabId) return false;
    if (!needle) return true;
    const haystack = String(app.searchText ?? [app.title, app.id, app.description, app.shortDescription, app.kind, app.subtype, app.source, app.route, ...(app.tags ?? []).map((tag) => tag.label), ...(app.kitStack ?? []), app.controls, ...(app.smokeActions ?? [])].join(" ")).toLowerCase();
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

function injectStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root { color-scheme:dark; --bg:#070706; --text:#fff6d7; --muted:#d9c593; --muted-2:#9e8a62; --accent:#ffe14a; --accent-2:#ff8a1f; --accent-3:#7cff9b; --accent-4:#53d6ff; --selected:rgba(255,225,74,.13); --hover:rgba(255,255,255,.052); --bar:rgba(18,16,11,.78); --divider:linear-gradient(90deg,transparent,rgba(255,225,74,.16),rgba(124,255,155,.24),rgba(83,214,255,.16),transparent); --hot-gradient:linear-gradient(90deg,#ffe14a,#ff8a1f,#7cff9b,#53d6ff); }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; background:radial-gradient(circle at 18% 0%,rgba(255,225,74,.16),transparent 28%),radial-gradient(circle at 84% 8%,rgba(83,214,255,.12),transparent 32%),linear-gradient(180deg,#090807 0%,#050504 100%); color:var(--text); font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
    body { overflow-y:auto; }
    a { color:inherit; }
    .nexus-shell { width:min(100% - 28px,1780px); min-height:100svh; margin:0 auto; padding:12px 0 24px; }
    .nexus-command-bar { position:relative; min-height:56px; display:grid; grid-template-columns:minmax(230px,auto) minmax(280px,1fr) auto auto; align-items:center; gap:12px; padding:8px 10px 8px 14px; border:0; border-radius:14px; background:linear-gradient(135deg,rgba(255,225,74,.12),rgba(124,255,155,.055) 34%,rgba(83,214,255,.08)),var(--bar); box-shadow:0 22px 70px rgba(0,0,0,.35),0 0 34px rgba(255,225,74,.075); overflow:hidden; }
    .nexus-command-bar::after { content:""; position:absolute; left:14px; right:14px; bottom:0; height:2px; background:var(--hot-gradient); opacity:.72; filter:drop-shadow(0 0 12px rgba(255,225,74,.55)); pointer-events:none; }
    .nexus-brand { min-width:0; }
    .nexus-brand strong { display:block; background:var(--hot-gradient); -webkit-background-clip:text; background-clip:text; color:transparent; font-size:.95rem; font-weight:950; letter-spacing:.18em; line-height:1.1; text-transform:uppercase; white-space:nowrap; }
    .nexus-brand span { display:block; margin-top:2px; color:var(--muted); font-size:.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .nexus-search { min-width:0; height:38px; display:flex; align-items:center; gap:8px; border:0; border-radius:9px; padding:0 11px; background:linear-gradient(90deg,rgba(255,225,74,.12),rgba(124,255,155,.055),rgba(83,214,255,.08)); box-shadow:inset 0 -1px 0 rgba(255,225,74,.28),0 0 22px rgba(255,225,74,.05); }
    .nexus-search span { color:var(--accent); font-size:.68rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
    .nexus-search-input { width:100%; min-width:80px; border:0; outline:0; background:transparent; color:var(--text); font:inherit; font-size:.92rem; }
    .nexus-search-input::placeholder { color:rgba(255,246,215,.42); }
    .nexus-tabs { display:flex; align-items:center; gap:4px; white-space:nowrap; overflow-x:auto; scrollbar-width:none; }
    .nexus-tabs::-webkit-scrollbar { display:none; }
    .nexus-tab { position:relative; height:34px; border:0; border-radius:8px; padding:0 10px; color:var(--muted); background:transparent; font-weight:900; font-size:.76rem; letter-spacing:.07em; text-transform:uppercase; cursor:pointer; }
    .nexus-tab::after { content:""; position:absolute; left:9px; right:9px; bottom:4px; height:1px; background:var(--divider); opacity:0; transition:opacity .16s ease; }
    .nexus-tab:hover { color:var(--text); background:linear-gradient(90deg,rgba(255,225,74,.08),rgba(83,214,255,.055)); }
    .nexus-tab:hover::after { opacity:1; }
    .nexus-tab.is-active { color:#140b01; background:var(--hot-gradient); box-shadow:0 0 24px rgba(255,225,74,.22); }
    .nexus-tab-count { opacity:.74; margin-left:4px; }
    .nexus-meta { display:flex; align-items:center; gap:12px; justify-content:flex-end; white-space:nowrap; }
    .nexus-result-count { background:var(--hot-gradient); -webkit-background-clip:text; background-clip:text; color:transparent; font-size:.78rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; }
    .nexus-repo-button { height:34px; display:inline-grid; place-items:center; border:0; border-radius:9px; padding:0 12px; color:#140b01; background:var(--hot-gradient); box-shadow:0 0 24px rgba(255,225,74,.18); font-size:.75rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; }
    .nexus-repo-button:hover { filter:brightness(1.08); }
    .nexus-context { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 4px 6px; color:var(--muted-2); font-size:.82rem; }
    .nexus-route-list { display:flex; flex-direction:column; border:0; }
    .nexus-route-row { position:relative; display:grid; grid-template-columns:6px minmax(180px,1.08fr) minmax(150px,.62fr) minmax(260px,1.9fr) auto; align-items:center; gap:12px; min-height:56px; padding:0 12px 0 0; border:0; color:var(--muted); text-decoration:none; cursor:default; outline:none; }
    .nexus-route-row::after { content:""; position:absolute; left:32px; right:14px; bottom:0; height:1px; background:var(--divider); opacity:.62; pointer-events:none; }
    .nexus-route-row:hover { background:linear-gradient(90deg,rgba(255,225,74,.065),rgba(124,255,155,.032),rgba(83,214,255,.045)); }
    .nexus-route-row:hover::after { height:2px; opacity:.95; filter:drop-shadow(0 0 8px rgba(124,255,155,.35)); }
    .nexus-route-row.is-selected { background:linear-gradient(90deg,rgba(255,225,74,.18),rgba(255,138,31,.08),rgba(124,255,155,.08),rgba(83,214,255,.06)); color:var(--text); box-shadow:inset 0 0 34px rgba(255,225,74,.055); }
    .nexus-route-row.is-selected::after { height:2px; background:var(--hot-gradient); opacity:1; filter:drop-shadow(0 0 12px rgba(255,225,74,.5)); }
    .nexus-route-row.is-selected .nexus-route-accent { background:var(--hot-gradient); box-shadow:0 0 22px rgba(255,225,74,.55); }
    .nexus-route-row.is-selected .nexus-route-title { color:var(--text); }
    .nexus-route-row.is-selected .nexus-route-open { color:var(--accent); opacity:1; text-shadow:0 0 14px rgba(255,225,74,.45); }
    .nexus-route-accent { width:4px; height:36px; border-radius:0 999px 999px 0; background:linear-gradient(180deg,rgba(255,225,74,.38),rgba(124,255,155,.25)); }
    .nexus-route-title { color:#fff1c3; font-weight:900; letter-spacing:-.015em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .nexus-route-kind { color:#e1c781; font-size:.84rem; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .nexus-route-desc { color:#b7a47b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .nexus-route-open { justify-self:end; color:#d1b46c; opacity:.76; font-size:.75rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; }
    .nexus-empty { padding:22px 12px; border:0; color:var(--muted); }
    @media (max-width:1180px) { .nexus-command-bar { grid-template-columns:1fr minmax(220px,1.2fr) auto; } .nexus-tabs { grid-column:1 / -1; order:4; } .nexus-route-row { grid-template-columns:6px minmax(180px,1fr) minmax(220px,1.6fr) auto; } .nexus-route-kind { display:none; } }
    @media (max-width:760px) { .nexus-shell { width:min(100% - 18px,1780px); padding-top:8px; } .nexus-command-bar { grid-template-columns:1fr; align-items:stretch; min-height:auto; } .nexus-meta { justify-content:space-between; } .nexus-brand span { white-space:normal; } .nexus-route-row { grid-template-columns:5px 1fr auto; gap:9px; min-height:62px; padding-right:8px; } .nexus-route-desc { grid-column:2 / 4; margin-top:-8px; font-size:.84rem; } .nexus-route-kind { display:block; grid-column:2 / 3; font-size:.76rem; } .nexus-route-open { grid-column:3 / 4; grid-row:1 / 2; } }
  `;
  documentRef.head.append(style);
}

function renderTabs(activeTabId) {
  return tabs.map((tab) => `<button class="nexus-tab${tab.id === activeTabId ? " is-active" : ""}" type="button" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeTabId}">${escapeHtml(tab.label)}<span class="nexus-tab-count">${tab.count}</span></button>`).join("");
}

function renderRow(app, index, selected) {
  return `<div class="nexus-route-row${selected ? " is-selected" : ""}" role="link" tabindex="${selected ? "0" : "-1"}" data-index="${index}" data-route="${escapeHtml(app.route)}" data-app-id="${escapeHtml(app.id)}" aria-selected="${selected}"><span class="nexus-route-accent" aria-hidden="true"></span><span class="nexus-route-title">${escapeHtml(displayTitle(app))}</span><span class="nexus-route-kind">${escapeHtml(routeKind(app))}</span><span class="nexus-route-desc">${escapeHtml(description(app))}</span><span class="nexus-route-open">Open →</span></div>`;
}

function renderShell(root, state) {
  root.innerHTML = `<section class="nexus-shell" aria-label="NexusRealtime applications launcher"><header class="nexus-command-bar" aria-label="Launcher command bar"><div class="nexus-brand"><strong>${escapeHtml(galleryConfig.title)}</strong><span>${escapeHtml(galleryConfig.subtitle)}</span></div><label class="nexus-search"><span>Search</span><input class="nexus-search-input" type="search" placeholder="Filter routes, kits, controls..." autocomplete="off" /></label><nav class="nexus-tabs" aria-label="Route type tabs">${renderTabs(state.activeTabId)}</nav><div class="nexus-meta"><span class="nexus-result-count" aria-live="polite"></span><a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Repo</a></div></header><div class="nexus-context" aria-live="polite"><span class="nexus-context-label"></span><span class="nexus-context-help">/ search · ↑↓ select · Enter open · Esc clear</span></div><section class="nexus-route-list" aria-label="Visible application routes"></section></section>`;
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
  parts.context.textContent = `${tab.label} · ${items.length} visible`;
  parts.list.innerHTML = items.length ? items.map((app, index) => renderRow(app, index, index === state.selectedIndex)).join("") : `<div class="nexus-empty">No routes matched this search in ${escapeHtml(tab.label)}.</div>`;
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
    selectIndex(parts, state, Number(row.dataset.index), true);
  });
  parts.list.addEventListener("dblclick", (event) => {
    const row = event.target.closest?.(".nexus-route-row");
    if (row) openRoute(row.dataset.route);
  });

  window.addEventListener("keydown", (event) => {
    const inSearch = document.activeElement === parts.search;
    if (event.key === "/" && !inSearch) {
      event.preventDefault();
      parts.search.focus();
      return;
    }
    if (event.key === "Escape" && (inSearch || state.query)) {
      event.preventDefault();
      parts.search.value = "";
      state.query = "";
      state.selectedIndex = 0;
      renderList(parts, state);
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
    if (event.key === "Enter") {
      const activeRow = document.activeElement?.closest?.(".nexus-route-row");
      if (activeRow) openRoute(activeRow.dataset.route);
      else if (inSearch || state.selectedIndex >= 0) openSelected(state);
    }
  });
}

function boot() {
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app root.");
  injectStyles(document);
  const state = { activeTabId: firstTabId(), query: "", selectedIndex: 0 };
  const parts = renderShell(root, state);
  wireLauncher(parts, state);
  renderList(parts, state);
}

boot();