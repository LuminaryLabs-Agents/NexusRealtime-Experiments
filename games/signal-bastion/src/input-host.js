export function createSignalBastionInputHost({ canvas, engine, renderer, blueprints = ["bolt", "ember", "slow"] }) {
  let activeBlueprint = blueprints[0] ?? "bolt";

  function snapshot() {
    return engine.genericDefense.getSnapshot();
  }

  function buildOrSelect(hit) {
    if (!hit) return;
    if (hit.kind === "slot") {
      engine.defenseBuild?.build?.(hit.id, activeBlueprint, { commandId: `build:${hit.id}:${engine.clock.frame}` });
    } else if (hit.kind === "structure") {
      engine.genericDefense.select(hit.id, "structure", { message: "Structure selected. Press U to upgrade." });
    }
  }

  function setBlueprintByIndex(index) {
    activeBlueprint = blueprints[Math.max(0, Math.min(blueprints.length - 1, index))] ?? activeBlueprint;
    engine.defenseBuild?.setBlueprint?.(activeBlueprint);
    return activeBlueprint;
  }

  function cycleBlueprint(direction = 1) {
    const current = blueprints.indexOf(activeBlueprint);
    activeBlueprint = blueprints[(current + direction + blueprints.length) % blueprints.length] ?? activeBlueprint;
    engine.defenseBuild?.setBlueprint?.(activeBlueprint);
    return activeBlueprint;
  }

  canvas.addEventListener("mousemove", (event) => {
    const hit = renderer.findHit(renderer.screenToWorld(event), snapshot());
    renderer.setHover(hit);
  });

  canvas.addEventListener("mouseleave", () => renderer.setHover(null));

  canvas.addEventListener("click", (event) => {
    buildOrSelect(renderer.findHit(renderer.screenToWorld(event), snapshot()));
  });

  globalThis.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === " " || key === "enter") {
      event.preventDefault();
      engine.defenseWaves?.startWave?.({ commandId: `wave:${engine.clock.frame}` });
    } else if (key === "r") {
      engine.genericDefense.restart({ commandId: `restart:${engine.clock.frame}` });
    } else if (key === "u") {
      engine.defenseBuild?.upgrade?.(null, { commandId: `upgrade:${engine.clock.frame}` });
    } else if (key === "backspace") {
      const selected = snapshot()?.session;
      if (selected?.selectedKind === "structure") engine.defenseBuild?.sell?.(selected.selectedId, { commandId: `sell:${selected.selectedId}:${engine.clock.frame}` });
    } else if (key === "tab" || key === "q" || key === "e") {
      event.preventDefault();
      cycleBlueprint(key === "q" ? -1 : 1);
    } else if (["1", "2", "3", "4", "5"].includes(key)) {
      setBlueprintByIndex(Number(key) - 1);
    }
  });

  return {
    getActiveBlueprint: () => activeBlueprint,
    setBlueprintByIndex,
    cycleBlueprint
  };
}
