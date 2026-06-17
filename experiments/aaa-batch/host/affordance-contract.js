function actionLabel(actionId) {
  return String(actionId).replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()).trim();
}

export function normalizeAffordances(manifest) {
  const declared = manifest.affordances ?? manifest.actions?.map((action, index) => ({
    id: `${manifest.id}-${action.id}`,
    label: action.label ?? actionLabel(action.id),
    actionIds: [action.id],
    targetId: `${manifest.id}-target-${index + 1}`,
    enabled: true,
    blocked: false,
    completed: false,
    descriptor: {
      icon: "target",
      prompt: action.label ?? actionLabel(action.id),
      tone: index === 0 ? "primary" : "support",
      worldAnchorId: `${manifest.id}-node-${index + 1}`
    }
  })) ?? [];
  return Object.freeze(declared.map((affordance, index) => Object.freeze({
    id: String(affordance.id ?? `${manifest.id}-affordance-${index + 1}`),
    label: String(affordance.label ?? `Affordance ${index + 1}`),
    actionIds: Object.freeze((affordance.actionIds ?? []).map(String)),
    targetId: String(affordance.targetId ?? `${manifest.id}-target-${index + 1}`),
    enabled: affordance.enabled !== false,
    blocked: Boolean(affordance.blocked),
    completed: Boolean(affordance.completed),
    descriptor: Object.freeze({
      icon: String(affordance.descriptor?.icon ?? "target"),
      prompt: String(affordance.descriptor?.prompt ?? affordance.label ?? "Use"),
      tone: String(affordance.descriptor?.tone ?? "primary"),
      worldAnchorId: String(affordance.descriptor?.worldAnchorId ?? `${manifest.id}-node-${index + 1}`)
    })
  })));
}

export function createAffordanceContract(manifest) {
  const affordances = normalizeAffordances(manifest);

  function getAvailableAffordances(state = {}, actionId = null) {
    return affordances.filter((affordance) => {
      if (!affordance.enabled || affordance.blocked || affordance.completed) return false;
      if (state.mode && state.mode !== "active") return false;
      return actionId ? affordance.actionIds.includes(actionId) : true;
    });
  }

  function validateTargetAffordance(actionId, targetId, state = {}) {
    const candidates = getAvailableAffordances(state, actionId);
    const affordance = targetId ? candidates.find((entry) => entry.targetId === targetId || entry.id === targetId) : candidates[0];
    if (!affordance) {
      return { ok: false, actionId, targetId, affordanceId: null, descriptor: null, rejectionReason: `affordance unavailable: ${actionId}` };
    }
    return { ok: true, actionId, targetId: affordance.targetId, affordanceId: affordance.id, descriptor: affordance.descriptor, rejectionReason: null };
  }

  return {
    affordances,
    getAvailableAffordances,
    validateTargetAffordance
  };
}
