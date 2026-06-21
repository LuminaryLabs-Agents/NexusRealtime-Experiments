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
    :root { color-scheme:dark; --mouse-x:50%; --mouse-y:22%; --parallax-soft-x:0px; --parallax-soft-y:0px; --parallax-hot-x:0px; --parallax-hot-y:0px; --text:#fff8dc; --text-hot:#fff; --muted:#f1d9a1; --muted-2:#d1b579; --pink:#ff4fd8; --violet:#8f5cff; --cyan:#53d6ff; --green:#7cff9b; --yellow:#ffe14a; --orange:#ff8a1f; --glass-strong:rgba(13,8,26,.72); --hot-gradient:linear-gradient(90deg,#ff4fd8,#ffe14a,#7cff9b,#53d6ff,#8f5cff); --rainbow-divider:linear-gradient(90deg,transparent,#ff4fd8,#ffe14a,#7cff9b,#53d6ff,#8f5cff,transparent); --arcade-road:linear-gradient(110deg,rgba(255,79,216,.18),rgba(255,225,74,.12) 26%,rgba(124,255,155,.13) 54%,rgba(83,214,255,.16) 78%,rgba(143,92,255,.16)); --arcade-lane:repeating-linear-gradient(112deg,transparent 0 28px,rgba(255,255,255,.09) 28px 30px,transparent 30px 58px); --arcade-edge:linear-gradient(90deg,#ff4fd8,#ffe14a,#7cff9b,#53d6ff,#8f5cff); --contrast-bg:#07020f; --contrast-panel:rgba(8,5,18,.84); --contrast-panel-strong:rgba(5,3,12,.92); --contrast-panel-soft:rgba(15,8,32,.76); --contrast-title:#fff; --contrast-text:#fffaf0; --contrast-muted:#ffe9b7; --contrast-dim:#dbc58d; --contrast-outline:rgba(255,255,255,.34); --contrast-outline-hot:rgba(255,225,74,.72); --contrast-shadow:0 20px 70px rgba(0,0,0,.48); --contrast-glow:0 0 32px rgba(255,225,74,.28),0 0 42px rgba(83,214,255,.18); }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; color:var(--text); font-family:Inter,ui-sans-serif,system-ui,sans-serif; background:radial-gradient(circle at 12% 10%,rgba(255,79,216,.58),transparent 32%),radial-gradient(circle at 86% 8%,rgba(83,214,255,.52),transparent 34%),radial-gradient(circle at 54% 0%,rgba(255,225,74,.36),transparent 30%),radial-gradient(circle at 20% 82%,rgba(124,255,155,.36),transparent 38%),radial-gradient(circle at 80% 78%,rgba(143,92,255,.38),transparent 38%),linear-gradient(135deg,#260052 0%,#00356f 36%,#00594c 62%,#5c2400 100%); background-size:130% 130%,130% 130%,120% 120%,130% 130%,130% 130%,100% 100%; animation:auroraBaseDrift 22s ease-in-out infinite; }
    body { position:relative; overflow-y:auto; isolation:isolate; }
    body::before,body::after { content:""; position:fixed; inset:-14vh -14vw; z-index:0; pointer-events:none; will-change:transform,opacity; }
    body::before { transform:translate3d(var(--parallax-soft-x),var(--parallax-soft-y),0) scale(1.04); background:radial-gradient(circle at var(--mouse-x) var(--mouse-y),rgba(255,255,255,.22),rgba(255,225,74,.14) 14%,rgba(83,214,255,.13) 28%,transparent 50%),radial-gradient(circle at 18% 24%,rgba(255,79,216,.36),transparent 30%),radial-gradient(circle at 74% 18%,rgba(83,214,255,.34),transparent 32%),radial-gradient(circle at 48% 62%,rgba(124,255,155,.24),transparent 36%),conic-gradient(from 140deg at 50% 50%,rgba(255,79,216,.12),rgba(255,225,74,.14),rgba(124,255,155,.13),rgba(83,214,255,.14),rgba(143,92,255,.13),rgba(255,79,216,.12)); filter:blur(34px) saturate(1.35); opacity:.95; animation:auroraLayerDrift 28s ease-in-out infinite; }
    body::after { transform:translate3d(var(--parallax-hot-x),var(--parallax-hot-y),0) rotate(-8deg) scale(1.12); background:linear-gradient(100deg,transparent 0%,rgba(255,79,216,.18) 12%,rgba(255,225,74,.13) 22%,transparent 34%,rgba(124,255,155,.15) 48%,rgba(83,214,255,.16) 58%,transparent 72%,rgba(143,92,255,.14) 86%,transparent 100%),radial-gradient(circle at 10% 28%,rgba(255,225,74,.30),transparent 9%),radial-gradient(circle at 26% 74%,rgba(255,79,216,.28),transparent 11%),radial-gradient(circle at 68% 20%,rgba(83,214,255,.30),transparent 10%),radial-gradient(circle at 88% 66%,rgba(124,255,155,.24),transparent 12%),radial-gradient(circle,rgba(255,255,255,.22) 0 1px,transparent 1.5px); background-size:auto,auto,auto,auto,auto,86px 86px; filter:blur(16px) saturate(1.28); opacity:.58; mix-blend-mode:screen; }
    a { color:inherit; }
    @keyframes auroraBaseDrift { 0% { background-position:0% 0%,100% 0%,50% 0%,0% 100%,100% 100%,0% 0%; } 50% { background-position:8% 5%,91% 10%,54% 7%,10% 92%,88% 90%,0% 0%; } 100% { background-position:0% 0%,100% 0%,50% 0%,0% 100%,100% 100%,0% 0%; } }
    @keyframes auroraLayerDrift { 0%,100% { filter:blur(34px) saturate(1.35) hue-rotate(0deg); } 50% { filter:blur(42px) saturate(1.52) hue-rotate(22deg); } }
    @keyframes happyRowBounce { 0% { transform:translateX(0) translateY(0) scale(1); } 56% { transform:translateX(9px) translateY(-3px) scale(1.014); } 100% { transform:translateX(7px) translateY(-2px) scale(1.008); } }
    @keyframes zipperCardIn { 0% { opacity:0; transform:translate3d(calc(var(--zipper-side) * 96px),34px,0) scale(.955); filter:blur(10px) saturate(.82); } 62% { opacity:1; } 100% { opacity:1; transform:translate3d(0,0,0) scale(1); filter:blur(0) saturate(1); } }
    .nexus-shell { position:relative; z-index:1; width:min(100% - 28px,1780px); min-height:100svh; margin:0 auto; padding:12px 0 34px; }
    .nexus-command-bar { position:relative; min-height:58px; display:grid; grid-template-columns:minmax(230px,auto) minmax(280px,1fr) auto auto; align-items:center; gap:12px; padding:9px 10px 9px 14px; border:0; border-radius:18px; background:linear-gradient(120deg,rgba(255,79,216,.18),rgba(255,225,74,.12),rgba(83,214,255,.16)),var(--contrast-panel-strong); -webkit-backdrop-filter:blur(22px) saturate(1.42); backdrop-filter:blur(22px) saturate(1.42); box-shadow:var(--contrast-shadow),var(--contrast-glow); overflow:hidden; }
    .nexus-command-bar::before { content:""; position:absolute; inset:-40%; background:radial-gradient(circle at var(--mouse-x) var(--mouse-y),rgba(255,255,255,.12),transparent 42%),linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.28)); opacity:.95; pointer-events:none; }
    .nexus-command-bar::after { content:""; position:absolute; left:50%; bottom:0; width:min(74%,1120px); height:4px; transform:translateX(-50%); border-radius:999px; background:var(--rainbow-divider); opacity:.95; filter:drop-shadow(0 0 16px rgba(255,225,74,.5)); pointer-events:none; }
    .nexus-command-bar > * { position:relative; z-index:1; }
    .nexus-brand { min-width:0; }
    .nexus-brand strong { display:block; background:linear-gradient(90deg,#fff2a8,#ff4fd8,#7cff9b,#53d6ff,#fff); -webkit-background-clip:text; background-clip:text; color:transparent; font-size:.98rem; font-weight:950; letter-spacing:.18em; line-height:1.1; text-transform:uppercase; white-space:nowrap; filter:drop-shadow(0 0 12px rgba(255,225,74,.24)); }
    .nexus-brand span { display:block; margin-top:3px; color:var(--contrast-muted); font-size:.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 2px 10px rgba(0,0,0,.55); }
    .nexus-search { position:relative; min-width:0; height:39px; display:flex; align-items:center; gap:8px; border:0; border-radius:12px; padding:0 12px; background:rgba(0,0,0,.44); box-shadow:inset 0 0 0 1px rgba(255,255,255,.20),inset 0 -2px 0 rgba(255,225,74,.42),0 0 24px rgba(83,214,255,.10); overflow:hidden; transition:transform .18s ease,box-shadow .18s ease,background .18s ease; }
    .nexus-search::before { content:""; position:absolute; inset:-80%; background:radial-gradient(circle at var(--mouse-x) var(--mouse-y),rgba(255,79,216,.22),rgba(255,225,74,.13) 18%,transparent 48%); opacity:.65; pointer-events:none; }
    .nexus-search:focus-within { transform:translateY(-1px) scale(1.012); background:rgba(0,0,0,.56); box-shadow:inset 0 0 0 1px rgba(255,255,255,.32),inset 0 -2px 0 rgba(255,225,74,.62),0 0 28px rgba(83,214,255,.22),0 0 34px rgba(255,79,216,.15); }
    .nexus-search span { position:relative; z-index:1; color:var(--yellow); font-size:.68rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
    .nexus-search-input { position:relative; z-index:1; width:100%; min-width:80px; border:0; outline:0; background:transparent; color:#fff; font:inherit; font-size:.92rem; }
    .nexus-search-input::placeholder { color:rgba(255,244,204,.82); }
    .nexus-tabs { display:flex; align-items:center; gap:5px; white-space:nowrap; overflow-x:auto; scrollbar-width:none; }
    .nexus-tabs::-webkit-scrollbar { display:none; }
    .nexus-tab { position:relative; height:35px; border:0; border-radius:999px; padding:0 12px; color:#fff6d4; background:rgba(0,0,0,.34); font-weight:900; font-size:.76rem; letter-spacing:.07em; text-transform:uppercase; cursor:pointer; overflow:hidden; transition:transform .18s ease,filter .18s ease,box-shadow .18s ease,background .18s ease,color .18s ease; }
    .nexus-tab::before { content:""; position:absolute; inset:0; background:var(--hot-gradient); opacity:0; transition:opacity .18s ease; }
    .nexus-tab:hover { transform:translateY(-2px) scale(1.035); color:#fff; background:rgba(0,0,0,.46); box-shadow:0 10px 24px rgba(0,0,0,.18); }
    .nexus-tab:hover::before { opacity:.22; }
    .nexus-tab.is-active { color:#12051a; background:linear-gradient(90deg,#ffe14a,#7cff9b,#53d6ff); box-shadow:0 0 26px rgba(255,225,74,.28),0 0 30px rgba(83,214,255,.16); }
    .nexus-tab.is-active::before { opacity:0; }
    .nexus-tab-label,.nexus-tab-count { position:relative; z-index:1; }
    .nexus-tab-count { opacity:.86; margin-left:4px; }
    .nexus-meta { display:flex; align-items:center; gap:12px; justify-content:flex-end; white-space:nowrap; }
    .nexus-result-count { background:var(--hot-gradient); -webkit-background-clip:text; background-clip:text; color:transparent; font-size:.78rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; filter:drop-shadow(0 2px 10px rgba(0,0,0,.5)); }
    .nexus-repo-button { height:35px; display:inline-grid; place-items:center; border:0; border-radius:999px; padding:0 14px; color:#16051c; background:var(--hot-gradient); box-shadow:0 0 26px rgba(255,225,74,.24),0 0 34px rgba(83,214,255,.16); font-size:.75rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; transition:transform .18s ease,filter .18s ease,box-shadow .18s ease; }
    .nexus-repo-button:hover { transform:translateY(-2px) scale(1.04); filter:brightness(1.1) saturate(1.12); box-shadow:0 0 34px rgba(255,225,74,.34),0 0 42px rgba(255,79,216,.18),0 0 46px rgba(83,214,255,.20); }
    .nexus-context { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 4px 6px; color:#ffe8b0; font-size:.82rem; font-weight:700; text-shadow:0 2px 10px rgba(0,0,0,.55); }
    .nexus-context-help { color:#f7dca0; opacity:.94; }
    .nexus-route-list { display:flex; flex-direction:column; gap:18px; padding:14px 0 10px; border:0; perspective:1200px; }
    .nexus-route-row { --row-x:50%; --row-y:50%; --zipper-side:-1; --zipper-delay:0ms; position:relative; display:grid; grid-template-columns:8px minmax(220px,1.08fr) minmax(150px,.54fr) minmax(280px,1.45fr) auto; align-items:center; gap:16px; min-height:clamp(122px,16vh,168px); padding:16px 18px 16px 0; border:0; border-radius:28px; color:var(--contrast-muted); text-decoration:none; cursor:default; outline:none; overflow:visible; background:var(--arcade-road),var(--arcade-lane),linear-gradient(90deg,rgba(255,79,216,.08),rgba(83,214,255,.06)),var(--contrast-panel); background-size:auto,96px 100%,auto,auto; -webkit-backdrop-filter:blur(10px) saturate(1.25); backdrop-filter:blur(10px) saturate(1.25); box-shadow:0 18px 58px rgba(0,0,0,.30),inset 0 0 0 1px rgba(255,255,255,.12); transform-origin:center; will-change:transform,opacity; contain:layout paint; opacity:0; animation:zipperCardIn .64s cubic-bezier(.16,.86,.28,1.08) both; animation-delay:var(--zipper-delay); transition:transform .18s ease,background .18s ease,box-shadow .18s ease,filter .18s ease; }
    .nexus-route-row.is-even { margin-right:clamp(14px,3.6vw,64px); }
    .nexus-route-row.is-odd { margin-left:clamp(14px,3.6vw,64px); }
    .nexus-route-row::before { content:""; position:absolute; inset:0; border-radius:inherit; background:radial-gradient(circle at var(--row-x) var(--row-y),rgba(255,255,255,.22),rgba(255,79,216,.17) 12%,rgba(255,225,74,.12) 22%,rgba(83,214,255,.12) 34%,transparent 54%); opacity:0; pointer-events:none; transition:opacity .18s ease; }
    .nexus-route-row::after { content:""; position:absolute; left:50%; bottom:-8px; width:min(58%,840px); height:5px; transform:translateX(-50%); border-radius:999px; background:var(--arcade-edge); opacity:.72; pointer-events:none; filter:drop-shadow(0 0 12px rgba(83,214,255,.24)) drop-shadow(0 0 16px rgba(255,79,216,.18)); transition:opacity .18s ease,height .18s ease,filter .18s ease,width .18s ease; }
    .nexus-route-row:hover { animation-name:zipperCardIn,happyRowBounce; animation-duration:.64s,.34s; animation-delay:var(--zipper-delay),0ms; animation-timing-function:cubic-bezier(.16,.86,.28,1.08),cubic-bezier(.18,.89,.32,1.28); transform:translateX(7px) translateY(-2px) scale(1.008); background:linear-gradient(112deg,rgba(255,79,216,.24),rgba(255,225,74,.16) 26%,rgba(124,255,155,.15) 54%,rgba(83,214,255,.20) 78%,rgba(143,92,255,.20)),var(--arcade-lane),var(--contrast-panel-strong); box-shadow:0 24px 74px rgba(0,0,0,.38),0 0 36px rgba(83,214,255,.20),0 0 34px rgba(255,79,216,.18),inset 0 0 0 1px rgba(255,255,255,.18); }
    .nexus-route-row:hover::before { opacity:1; }
    .nexus-route-row:hover::after,.nexus-route-row.is-selected::after { width:min(76%,1120px); height:7px; opacity:1; filter:drop-shadow(0 0 15px rgba(255,225,74,.54)) drop-shadow(0 0 24px rgba(83,214,255,.38)); }
    .nexus-route-row:focus-visible,.nexus-tab:focus-visible,.nexus-search-input:focus-visible,.nexus-repo-button:focus-visible { outline:3px solid rgba(255,245,180,.86); outline-offset:3px; }
    .nexus-route-row.is-selected { background:linear-gradient(112deg,rgba(255,79,216,.28),rgba(255,225,74,.20) 28%,rgba(124,255,155,.17) 56%,rgba(83,214,255,.22)),var(--arcade-lane),var(--contrast-panel-strong); color:var(--text-hot); box-shadow:inset 0 0 42px rgba(255,255,255,.06),0 0 42px rgba(255,225,74,.22),0 0 48px rgba(83,214,255,.18); outline:2px solid rgba(255,255,255,.30); outline-offset:0; }
    .nexus-route-row.is-selected::before { opacity:.75; }
    .nexus-route-accent,.nexus-route-title,.nexus-route-kind,.nexus-route-desc,.nexus-route-open { position:relative; z-index:1; }
    .nexus-route-accent { width:7px; height:calc(100% - 18px); min-height:86px; border-radius:0 999px 999px 0; background:linear-gradient(180deg,#ff4fd8,#ffe14a,#7cff9b,#53d6ff,#8f5cff); box-shadow:0 0 18px rgba(255,225,74,.30),0 0 24px rgba(83,214,255,.18); opacity:.95; }
    .nexus-route-row:hover .nexus-route-accent,.nexus-route-row.is-selected .nexus-route-accent { opacity:1; box-shadow:0 0 22px rgba(255,225,74,.52),0 0 30px rgba(83,214,255,.32); }
    .nexus-route-title { color:var(--contrast-title); font-weight:950; letter-spacing:-.025em; overflow:hidden; text-overflow:ellipsis; white-space:normal; line-height:1.02; font-size:clamp(1.05rem,1.45vw,1.48rem); text-shadow:0 2px 12px rgba(0,0,0,.66); }
    .nexus-route-kind { color:var(--contrast-muted); font-size:.84rem; font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 2px 10px rgba(0,0,0,.58); border-radius:999px; padding:6px 10px; background:rgba(0,0,0,.30); box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); }
    .nexus-route-desc { color:var(--contrast-text); opacity:.96; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; white-space:normal; line-height:1.28; font-size:clamp(.9rem,1.02vw,1.05rem); text-shadow:0 2px 10px rgba(0,0,0,.58); border-radius:16px; padding:9px 11px; background:rgba(0,0,0,.20); box-shadow:inset 0 0 0 1px rgba(255,255,255,.07); }
    .nexus-route-open { justify-self:end; color:#fff4a8; opacity:1; font-size:.78rem; font-weight:950; letter-spacing:.08em; text-transform:uppercase; text-shadow:0 0 12px rgba(0,0,0,.75),0 0 14px rgba(255,225,74,.45); border-radius:999px; padding:7px 10px; background:rgba(0,0,0,.30); box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); }
    .nexus-route-row:hover .nexus-route-open { color:#12051a; background:linear-gradient(90deg,#ffe14a,#7cff9b,#53d6ff); text-shadow:none; }
    .nexus-route-row.is-selected .nexus-route-title { color:var(--text-hot); }
    .nexus-route-row.is-selected .nexus-route-open { color:#12051a; opacity:1; text-shadow:none; background:linear-gradient(90deg,#ffe14a,#7cff9b,#53d6ff); }
    .nexus-contrast-boost .nexus-route-row { background-color:rgba(5,3,12,.88); }
    .nexus-contrast-boost .nexus-route-desc,.nexus-contrast-boost .nexus-context,.nexus-contrast-boost .nexus-context-help { opacity:1; }
    .nexus-empty { padding:22px 12px; border:0; color:var(--contrast-muted); background:var(--contrast-panel); border-radius:18px; -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); }
    @media (max-width:1180px) { .nexus-command-bar { grid-template-columns:1fr minmax(220px,1.2fr) auto; } .nexus-tabs { grid-column:1 / -1; order:4; } .nexus-route-row { grid-template-columns:8px minmax(180px,1fr) minmax(240px,1.45fr) auto; min-height:clamp(116px,15vh,152px); } .nexus-route-kind { display:none; } }
    @media (max-width:760px) { .nexus-shell { width:min(100% - 18px,1780px); padding-top:8px; } body::after { opacity:.36; } .nexus-command-bar { grid-template-columns:1fr; align-items:stretch; min-height:auto; border-radius:16px; } .nexus-meta { justify-content:space-between; } .nexus-brand span { white-space:normal; } .nexus-route-list { gap:14px; } .nexus-route-row { grid-template-columns:6px 1fr auto; gap:10px; min-height:112px; padding:13px 10px 13px 0; border-radius:22px; margin-left:0 !important; margin-right:0 !important; } .nexus-route-row:hover { animation:none; transform:translateX(3px) scale(1.003); } .nexus-route-row::after { width:78%; bottom:-7px; } .nexus-route-title { font-size:1rem; } .nexus-route-desc { grid-column:2 / 4; margin-top:-5px; font-size:.84rem; -webkit-line-clamp:2; padding:7px 9px; } .nexus-route-kind { display:block; grid-column:2 / 3; font-size:.76rem; width:max-content; max-width:100%; } .nexus-route-open { grid-column:3 / 4; grid-row:1 / 2; } .nexus-route-accent { min-height:74px; } }
    @media (prefers-reduced-motion: reduce) { html,body,body::before,.nexus-route-row,.nexus-route-row:hover { animation:none; } body::before,body::after { transform:none !important; } .nexus-route-row { opacity:1; transform:none !important; } .nexus-tab,.nexus-repo-button,.nexus-route-row,.nexus-search,.nexus-route-row::before,.nexus-route-row::after { transition:none; } .nexus-tab:hover,.nexus-repo-button:hover,.nexus-route-row:hover,.nexus-search:focus-within { transform:none; } }
  `;
  documentRef.head.append(style);
}

function renderTabs(activeTabId) {
  return tabs.map((tab) => `<button class="nexus-tab${tab.id === activeTabId ? " is-active" : ""}" type="button" data-tab-id="${escapeHtml(tab.id)}" aria-pressed="${tab.id === activeTabId}"><span class="nexus-tab-label">${escapeHtml(tab.label)}</span><span class="nexus-tab-count">${tab.count}</span></button>`).join("");
}

function renderRow(app, index, selected) {
  const side = index % 2 === 0 ? -1 : 1;
  const delay = Math.min(index * 58, 580);
  const alternate = index % 2 === 0 ? " is-even" : " is-odd";
  return `<div class="nexus-route-row${alternate}${selected ? " is-selected" : ""}" style="--zipper-side:${side};--zipper-delay:${delay}ms;--row-index:${index};" role="link" tabindex="${selected ? "0" : "-1"}" data-index="${index}" data-route="${escapeHtml(app.route)}" data-app-id="${escapeHtml(app.id)}" aria-selected="${selected}"><span class="nexus-route-accent" aria-hidden="true"></span><span class="nexus-route-title">${escapeHtml(displayTitle(app))}</span><span class="nexus-route-kind">${escapeHtml(routeKind(app))}</span><span class="nexus-route-desc">${escapeHtml(description(app))}</span><span class="nexus-route-open">Open →</span></div>`;
}

function renderShell(root, state) {
  root.innerHTML = `<section class="nexus-shell nexus-contrast-boost" aria-label="NexusRealtime applications launcher"><header class="nexus-command-bar" aria-label="Launcher command bar"><div class="nexus-brand"><strong>${escapeHtml(galleryConfig.title)}</strong><span>${escapeHtml(galleryConfig.subtitle)}</span></div><label class="nexus-search"><span>Search</span><input class="nexus-search-input" type="search" placeholder="Filter routes, kits, controls..." autocomplete="off" /></label><nav class="nexus-tabs" aria-label="Route type tabs">${renderTabs(state.activeTabId)}</nav><div class="nexus-meta"><span class="nexus-result-count" aria-live="polite"></span><a class="nexus-repo-button" href="${escapeHtml(galleryConfig.repoUrl)}">Repo</a></div></header><div class="nexus-context" aria-live="polite"><span class="nexus-context-label"></span><span class="nexus-context-help">/ search · ↑↓ select · Enter open · Esc clear</span></div><section class="nexus-route-list" aria-label="Visible application routes"></section></section>`;
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

function wireParallax(documentRef) {
  const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;
  const root = documentRef.documentElement;
  let frame = 0;
  let pointerX = 0.5;
  let pointerY = 0.22;
  function applyParallax() {
    frame = 0;
    const dx = pointerX - 0.5;
    const dy = pointerY - 0.5;
    root.style.setProperty("--mouse-x", `${Math.round(pointerX * 100)}%`);
    root.style.setProperty("--mouse-y", `${Math.round(pointerY * 100)}%`);
    root.style.setProperty("--parallax-soft-x", `${Math.round(dx * -24)}px`);
    root.style.setProperty("--parallax-soft-y", `${Math.round(dy * -18)}px`);
    root.style.setProperty("--parallax-hot-x", `${Math.round(dx * 62)}px`);
    root.style.setProperty("--parallax-hot-y", `${Math.round(dy * 44)}px`);
  }
  function requestApply() {
    if (!frame) frame = window.requestAnimationFrame(applyParallax);
  }
  function resetPointer() {
    pointerX = 0.5;
    pointerY = 0.22;
    requestApply();
  }
  window.addEventListener("pointermove", (event) => {
    pointerX = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
    pointerY = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
    requestApply();
  }, { passive: true });
  window.addEventListener("blur", resetPointer, { passive: true });
  documentRef.addEventListener("mouseleave", resetPointer, { passive: true });
  applyParallax();
}

function wireRowPointerGlow(parts) {
  parts.list.addEventListener("pointermove", (event) => {
    const row = event.target.closest?.(".nexus-route-row");
    if (!row) return;
    const rect = row.getBoundingClientRect();
    row.style.setProperty("--row-x", `${Math.round(event.clientX - rect.left)}px`);
    row.style.setProperty("--row-y", `${Math.round(event.clientY - rect.top)}px`);
  }, { passive: true });
  parts.list.addEventListener("pointerleave", () => {
    for (const row of parts.list.querySelectorAll(".nexus-route-row")) {
      row.style.removeProperty("--row-x");
      row.style.removeProperty("--row-y");
    }
  }, { passive: true });
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
  wireParallax(document);
  const state = { activeTabId: firstTabId(), query: "", selectedIndex: 0 };
  const parts = renderShell(root, state);
  wireLauncher(parts, state);
  wireRowPointerGlow(parts);
  renderList(parts, state);
}

boot();
