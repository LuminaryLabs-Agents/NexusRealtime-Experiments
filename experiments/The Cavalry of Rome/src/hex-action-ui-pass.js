const ACTION_UI_STYLE = "bottom-native-card-action-bar";

const ACTIONS = Object.freeze([
  { id: "advanceLeft", label: "Advance Left", cost: 1, hotkey: "1", kind: "Advance", detail: "Left third · 1d6 units" },
  { id: "advanceCenter", label: "Advance Center", cost: 1, hotkey: "2", kind: "Advance", detail: "Center third · 1d6 units" },
  { id: "advanceRight", label: "Advance Right", cost: 1, hotkey: "3", kind: "Advance", detail: "Right third · 1d6 units" },
  { id: "lineBrigade", label: "Line Brigade", cost: 2, hotkey: "4", kind: "Brigade", detail: "Adjacent line group" },
  { id: "heavyBrigade", label: "Heavy Brigade", cost: 3, hotkey: "5", kind: "Brigade", detail: "All heavy units" },
  { id: "berserk", label: "Berserk", cost: 4, hotkey: "6", kind: "Single", detail: "Move 2 + attack" },
  { id: "scout", label: "Scout", cost: 4, hotkey: "7", kind: "Single", detail: "Move any unit 3" }
]);

let root = null;
let apValue = null;
let phaseValue = null;
let cards = new Map();
let lastVisible = false;

function ensureUi() {
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    #cavalry-action-ui {
      position: fixed;
      left: max(14px, env(safe-area-inset-left));
      right: max(14px, env(safe-area-inset-right));
      bottom: max(12px, env(safe-area-inset-bottom));
      z-index: 30;
      display: none;
      align-items: stretch;
      gap: 10px;
      pointer-events: auto;
      color: #fff6e3;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      text-shadow: 0 1px 8px rgba(0,0,0,.65);
    }
    #cavalry-action-ui[data-visible="true"] { display: flex; }
    .cavalry-ap-card, .cavalry-action-card {
      border: 1px solid rgba(255, 220, 150, .22);
      background:
        linear-gradient(145deg, rgba(37, 24, 13, .88), rgba(16, 12, 9, .78)),
        radial-gradient(circle at 20% 0%, rgba(255, 218, 130, .18), transparent 48%);
      box-shadow: 0 14px 48px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.08);
      -webkit-backdrop-filter: blur(16px) saturate(1.25);
      backdrop-filter: blur(16px) saturate(1.25);
      border-radius: 16px;
    }
    .cavalry-ap-card {
      flex: 0 0 168px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 12px 14px;
      min-height: 94px;
    }
    .cavalry-ap-label, .cavalry-card-kicker {
      color: rgba(255, 234, 190, .70);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .cavalry-ap-number {
      align-self: center;
      color: #ffe19a;
      font-size: 38px;
      font-weight: 950;
      line-height: .95;
      letter-spacing: -.05em;
    }
    .cavalry-phase {
      color: rgba(255, 246, 227, .78);
      font-size: 11px;
      font-weight: 720;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cavalry-actions {
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: repeat(7, minmax(98px, 1fr));
      gap: 9px;
      min-width: 0;
    }
    .cavalry-action-card {
      position: relative;
      min-height: 94px;
      padding: 10px 11px;
      cursor: pointer;
      color: #fff6e3;
      appearance: none;
      text-align: left;
      overflow: hidden;
      transition: transform .12s ease, border-color .12s ease, background .12s ease, opacity .12s ease;
    }
    .cavalry-action-card::after {
      content: attr(data-hotkey);
      position: absolute;
      top: 9px;
      right: 9px;
      width: 22px;
      height: 22px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: rgba(255, 232, 178, .12);
      border: 1px solid rgba(255, 232, 178, .16);
      color: rgba(255, 237, 196, .82);
      font-size: 11px;
      font-weight: 900;
    }
    .cavalry-action-card:hover:not(:disabled), .cavalry-action-card:focus-visible:not(:disabled) {
      transform: translateY(-3px);
      outline: none;
      border-color: rgba(255, 222, 142, .62);
      background: linear-gradient(145deg, rgba(54, 34, 17, .92), rgba(18, 13, 8, .82));
    }
    .cavalry-action-card[data-active="true"] {
      border-color: rgba(255, 218, 116, .90);
      box-shadow: 0 18px 58px rgba(0,0,0,.42), 0 0 0 2px rgba(255, 205, 82, .18), inset 0 1px 0 rgba(255,255,255,.10);
    }
    .cavalry-action-card:disabled {
      cursor: not-allowed;
      opacity: .42;
      filter: grayscale(.45);
    }
    .cavalry-card-title {
      display: block;
      margin-top: 8px;
      padding-right: 22px;
      color: #fff5dc;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: -.01em;
      line-height: 1.05;
    }
    .cavalry-card-detail {
      display: block;
      margin-top: 7px;
      color: rgba(255, 237, 200, .66);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.15;
    }
    .cavalry-card-cost {
      position: absolute;
      left: 10px;
      bottom: 9px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #ffe19a;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .03em;
    }
    .cavalry-card-cost::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #fff0ad, #d99427 62%, #5f2b0a);
      box-shadow: 0 0 12px rgba(255, 204, 78, .42);
    }
    @media (max-width: 980px) {
      #cavalry-action-ui { gap: 8px; }
      .cavalry-ap-card { flex-basis: 118px; }
      .cavalry-actions { overflow-x: auto; grid-template-columns: repeat(7, minmax(120px, 120px)); padding-bottom: 2px; }
      .cavalry-action-card { min-height: 88px; }
    }
    @media (max-width: 640px) {
      #cavalry-action-ui { left: 8px; right: 8px; bottom: 8px; }
      .cavalry-ap-card { flex-basis: 96px; padding: 10px; }
      .cavalry-ap-number { font-size: 30px; }
    }
  `;
  document.head.append(style);

  root = document.createElement("section");
  root.id = "cavalry-action-ui";
  root.dataset.visible = "false";
  root.setAttribute("aria-label", "Tactical actions");
  root.innerHTML = `
    <div class="cavalry-ap-card" aria-label="Action points">
      <div class="cavalry-ap-label">Action Points</div>
      <div class="cavalry-ap-number" id="cavalry-ap-value">0</div>
      <div class="cavalry-phase" id="cavalry-phase-value">Battlefield</div>
    </div>
    <div class="cavalry-actions" id="cavalry-action-cards"></div>
  `;
  document.body.append(root);
  apValue = root.querySelector("#cavalry-ap-value");
  phaseValue = root.querySelector("#cavalry-phase-value");
  const actionGrid = root.querySelector("#cavalry-action-cards");
  for (const action of ACTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cavalry-action-card";
    button.dataset.actionId = action.id;
    button.dataset.hotkey = action.hotkey;
    button.innerHTML = `
      <span class="cavalry-card-kicker">${action.kind}</span>
      <span class="cavalry-card-title">${action.label}</span>
      <span class="cavalry-card-detail">${action.detail}</span>
      <span class="cavalry-card-cost">${action.cost} AP</span>
    `;
    button.addEventListener("click", () => startAction(action.id));
    actionGrid.append(button);
    cards.set(action.id, button);
  }
  return root;
}

function tacticalSnapshot() {
  return globalThis.GameHost?.getTacticalGameplaySnapshot?.() ?? globalThis.GameHost?.getSnapshot?.()?.tacticalGameplay ?? null;
}

function startAction(actionId) {
  const result = globalThis.GameHost?.startManeuver?.(actionId);
  if (result === false) {
    const card = cards.get(actionId);
    card?.animate?.([
      { transform: "translateX(0)" },
      { transform: "translateX(-5px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(0)" }
    ], { duration: 180, easing: "ease-out" });
  }
}

function labelForPhase(snapshot) {
  if (!snapshot) return "Battlefield";
  if (snapshot.activeManeuver) {
    const action = ACTIONS.find((entry) => entry.id === snapshot.activeManeuver);
    const suffix = snapshot.remainingMoves > 0 ? ` · ${snapshot.remainingMoves} moves` : "";
    return `${action?.label ?? snapshot.activeManeuver}${suffix}`;
  }
  return `Turn ${snapshot.turn ?? 1}`;
}

function render() {
  ensureUi();
  const gameSnapshot = globalThis.GameHost?.getSnapshot?.() ?? {};
  const snapshot = tacticalSnapshot();
  const visible = gameSnapshot.mode === "battlefield";
  if (visible !== lastVisible) {
    root.dataset.visible = visible ? "true" : "false";
    lastVisible = visible;
  }
  if (visible) {
    const ap = Number(snapshot?.actionPoints ?? 0);
    apValue.textContent = String(ap);
    phaseValue.textContent = labelForPhase(snapshot);
    for (const action of ACTIONS) {
      const card = cards.get(action.id);
      const active = snapshot?.activeManeuver === action.id;
      card.dataset.active = active ? "true" : "false";
      card.disabled = Boolean(snapshot?.activeManeuver && !active) || ap < action.cost;
      card.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }
  requestAnimationFrame(render);
}

function boot() {
  globalThis.CavalryActionUi = { style: ACTION_UI_STYLE, actions: ACTIONS, startAction };
  ensureUi();
  requestAnimationFrame(render);
}

boot();
