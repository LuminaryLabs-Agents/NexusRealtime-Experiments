export function createSignalBastionInputHost({ canvas, towerPanelEl, engine, renderer, blueprints = ["bolt", "ember", "slow"] }) {
  let activeBlueprint = blueprints[0] ?? "bolt";
  let placing = false;

  function presentation() {
    return engine.defensePresentationStack?.getSnapshot?.() ?? { rawSnapshot: engine.genericDefense.getSnapshot() };
  }

  function sessionSnapshot() {
    return engine.genericDefense.getSnapshot();
  }

  function beginPlacement(blueprintId = activeBlueprint) {
    activeBlueprint = blueprintId;
    placing = true;
    engine.defenseBuild?.setBlueprint?.(activeBlueprint);
    engine.towerSelectionPanel?.setSelectedBlueprint?.(activeBlueprint);
    engine.placementProjector?.begin?.(activeBlueprint);
  }

  function cancelPlacement() {
    placing = false;
    engine.placementProjector?.cancel?.();
  }

  function buildOrSelect(hit, event) {
    const point = renderer.screenToWorld(event);
    if (placing) {
      engine.placementProjector?.moveTo?.(point);
      const result = engine.placementProjector?.confirm?.({ commandId: `place:${activeBlueprint}:${engine.clock.frame}` });
      if (result?.accepted) placing = false;
      return;
    }
    if (!hit) return;
    if (hit.kind === "slot") {
      beginPlacement(activeBlueprint);
      engine.placementProjector?.moveTo?.(point);
    } else if (hit.kind === "structure") {
      engine.genericDefense.select(hit.id, "structure", { message: "Structure selected." });
      engine.inkOutline?.setSelected?.(hit.id);
    }
  }

  function setBlueprintByIndex(index) {
    activeBlueprint = blueprints[Math.max(0, Math.min(blueprints.length - 1, index))] ?? activeBlueprint;
    beginPlacement(activeBlueprint);
    return activeBlueprint;
  }

  function cycleBlueprint(direction = 1) {
    const current = blueprints.indexOf(activeBlueprint);
    activeBlueprint = blueprints[(current + direction + blueprints.length) % blueprints.length] ?? activeBlueprint;
    beginPlacement(activeBlueprint);
    return activeBlueprint;
  }

  towerPanelEl?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-blueprint-id]");
    if (!button) return;
    beginPlacement(button.dataset.blueprintId);
  });

  canvas.addEventListener("mousemove", (event) => {
    const point = renderer.screenToWorld(event);
    if (placing) engine.placementProjector?.moveTo?.(point);
    const hit = renderer.findHit(point, presentation());
    engine.inkOutline?.setHover?.(hit?.id ?? null);
    renderer.setHover(hit);
  });

  canvas.addEventListener("mouseleave", () => {
    renderer.setHover(null);
    engine.inkOutline?.setHover?.(null);
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    cancelPlacement();
  });

  canvas.addEventListener("click", (event) => {
    buildOrSelect(renderer.findHit(renderer.screenToWorld(event), presentation()), event);
  });

  globalThis.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === " " || key === "enter") {
      event.preventDefault();
      engine.defenseWaves?.startWave?.({ commandId: `wave:${engine.clock.frame}` });
    } else if (key === "escape") {
      cancelPlacement();
    } else if (key === "r") {
      engine.genericDefense.restart({ commandId: `restart:${engine.clock.frame}` });
      cancelPlacement();
    } else if (key === "u") {
      engine.defenseBuild?.upgrade?.(null, { commandId: `upgrade:${engine.clock.frame}` });
    } else if (key === "backspace") {
      const selected = sessionSnapshot()?.session;
      if (selected?.selectedKind === "structure") engine.defenseBuild?.sell?.(selected.selectedId, { commandId: `sell:${selected.selectedId}:${engine.clock.frame}` });
    } else if (key === "tab" || key === "q" || key === "e") {
      event.preventDefault();
      cycleBlueprint(key === "q" ? -1 : 1);
    } else if (/^[1-9]$/.test(key)) {
      setBlueprintByIndex(Number(key) - 1);
    }
  });

  beginPlacement(activeBlueprint);

  return {
    getActiveBlueprint: () => activeBlueprint,
    isPlacing: () => placing,
    setBlueprintByIndex,
    cycleBlueprint,
    beginPlacement,
    cancelPlacement
  };
}
