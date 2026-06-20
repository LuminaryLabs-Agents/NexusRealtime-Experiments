export function createDskHandRouter({ engine, spatialRenderer, status }) {
  const router = { selectedObjectId: null, activeGrabId: null, lastPinchByHand: new Map(), createdCount: 0 };

  function route(commands = []) {
    for (const command of commands) {
      engine.webxrHandAdapter?.input?.(command);
      engine.handGestures?.command?.(command);

      if (command.type === "hand.twoHandScale") {
        const selected = engine.selection?.getState?.()?.selectedObjectIds?.[0] ?? router.selectedObjectId;
        if (selected) engine.transforms?.resize?.([selected], command.scalar ?? 1);
        continue;
      }

      const handKey = command.hand ?? "right";
      const wasPinching = router.lastPinchByHand.get(handKey) ?? false;
      const isPinching = Boolean(command.pinch?.active);
      const hitId = command.hit?.objectId ?? null;

      if (!wasPinching && isPinching && hitId) {
        router.selectedObjectId = hitId;
        router.activeGrabId = hitId;
        engine.selection?.pointSelect?.({ objectId: hitId, hit: command.hit, confidence: command.confidence });
        handlePressLikeIntent(hitId, command);
      }

      if (wasPinching && isPinching && router.activeGrabId && command.ray) {
        if (isStaticActionButton(router.activeGrabId)) {
          router.lastPinchByHand.set(handKey, isPinching);
          continue;
        }
        const nextPosition = spatialRenderer.pointOnRay(command.ray, Math.max(0.75, command.hit?.distance ?? 1.35));
        engine.transforms?.move?.([router.activeGrabId], nextPosition);
      }

      if (wasPinching && !isPinching) router.activeGrabId = null;
      router.lastPinchByHand.set(handKey, isPinching);
    }
  }

  function handlePressLikeIntent(objectId, command) {
    const object = engine.spatialScene?.getObject?.(objectId);
    const action = object?.widget?.props?.action;
    if (!action) {
      engine.interactions?.press?.(objectId, command.actorId ?? "user");
      return;
    }
    if (action === "create-note") return createWidget("note", { title: "New Note", body: "Created with hands." }, command);
    if (action === "create-timer") return createWidget("timer", { label: "Timer", durationSeconds: 300 }, command);
    if (action === "save") {
      engine.persistence?.capture?.("hand-workspace-save");
      if (status) status.textContent = "Saved workspace snapshot through persistence-dsk.";
      return;
    }
    engine.interactions?.request?.({ targetId: objectId, actorId: command.actorId ?? "user", verb: "press" });
  }

  function createWidget(type, props, command) {
    router.createdCount += 1;
    const base = command.ray ? spatialRenderer.pointOnRay(command.ray, 1.15) : { x: 0, y: 1.25, z: -1.4 };
    engine.widgets?.create?.(type, props, {
      position: base,
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: type === "timer" ? { x: 0.42, y: 0.28, z: 0.04 } : { x: 0.48, y: 0.34, z: 0.04 }
    });
    if (status) status.textContent = `Created ${type} widget through widget-dsk.`;
  }

  function isStaticActionButton(id) { return id === "create-note" || id === "create-timer" || id === "save-workspace"; }
  return { route, getState: () => router };
}
